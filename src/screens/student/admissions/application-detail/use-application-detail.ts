'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query';
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useMemo, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetAdmissionFormStageQuery } from 'src/redux/student/admissions/admission-form-stage-api';
import {
  useGetAdmissionApplicationQuery,
  useGetAdmissionApplicationFormQuery,
  useSubmitAdmissionApplicationMutation,
  useGetAdmissionApplicationWorkflowQuery,
  useEndAdmissionApplicationJourneyMutation,
  useReopenAdmissionApplicationFormMutation,
  useGetAdmissionApplicationFormHistoryQuery,
  useAdvanceAdmissionApplicationWorkflowMutation,
  useUpdateAdmissionApplicationFormValuesMutation,
} from 'src/redux/student/admissions/admission-applications-api';

import { readAdmissionFormValue } from '../admission-visibility-rules';
import { canRequestNormalStageAdvance } from './application-progress-model';
import { normalizeAdmissionFormEmailValues } from '../admission-email-values';
import { waitForAdmissionValidationPaint } from '../admission-validation-feedback';
import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';
import {
  buildDynamicAdmissionYupSchema,
  getDynamicAdmissionValidationErrors,
  getAdmissionSubmissionValidationErrors,
  getDynamicAdmissionFieldValidationError,
} from '../admission-form-validation';

export type RuntimeAction = 'skip' | 'override' | null;
export type AdvanceOptions = {
  concurrencyStamp?: string;
  reason?: string;
  transitionDefinitionId?: string;
  skipCurrentStage?: boolean;
  adminOverride?: boolean;
  deferFeeCollection?: boolean;
};

export function useApplicationDetail(
  id: string,
  selectedStageId?: string,
  view: 'journey' | 'form' | 'history' = 'journey'
) {
  const applicationQuery = useGetAdmissionApplicationQuery(id);
  // Both endpoints enforce application access. Neither response depends on the other.
  const workflowQuery = useGetAdmissionApplicationWorkflowQuery(id);
  const selectedStage =
    workflowQuery.data?.stages.find(
      (stage) => stage.id === (selectedStageId ?? workflowQuery.data?.currentStageInstanceId)
    ) ??
    workflowQuery.data?.stages.find(
      (stage) => stage.id === workflowQuery.data?.currentStageInstanceId
    ) ??
    [...(workflowQuery.data?.stages ?? [])].reverse().find((stage) => stage.status >= 2);
  const requiresForm = view === 'form' || (view === 'journey' && selectedStage?.stageType === 1);
  const formQueryResult = useGetAdmissionApplicationFormQuery(
    applicationQuery.data?.id === id && requiresForm ? id : skipToken
  );
  // RTK Query's data may retain the preceding argument's result while the new
  // application loads. Only currentData belongs to this application's form.
  const formQuery = { ...formQueryResult, data: formQueryResult.currentData };
  const selectedFormStage = workflowQuery.data?.stages.find(
    (stage) =>
      stage.id === (selectedStageId ?? workflowQuery.data?.currentStageInstanceId) &&
      stage.formStageEnabled
  );
  const formStageQuery = useGetAdmissionFormStageQuery(
    view === 'journey' && selectedFormStage
      ? { applicationId: id, stageId: selectedFormStage.id }
      : skipToken
  );
  const formHistoryQuery = useGetAdmissionApplicationFormHistoryQuery(
    applicationQuery.data && view === 'history' ? id : skipToken
  );
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const [updateValues, updateState] = useUpdateAdmissionApplicationFormValuesMutation();
  const [submit, submitState] = useSubmitAdmissionApplicationMutation();
  const [reopen, reopenState] = useReopenAdmissionApplicationFormMutation();
  const [advanceWorkflow, advanceState] = useAdvanceAdmissionApplicationWorkflowMutation();
  const [endJourneyMutation, endJourneyState] = useEndAdmissionApplicationJourneyMutation();
  const canManage = hasGrantedPermission(permissions, ADMISSION_APPLICATION_PERMISSIONS.manage);
  const canEndJourney = canManage && applicationQuery.data?.canEndJourney === true;
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [runtimeAction, setRuntimeAction] = useState<RuntimeAction>(null);
  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        (formQuery.data?.values ?? []).map((item) => [
          item.fieldCode,
          readAdmissionFormValue(item.valueJson),
        ])
      ),
    [formQuery.data?.values]
  );
  const validationSchema = useMemo(
    () => buildDynamicAdmissionYupSchema(formQuery.data?.definition ?? { sections: [] }),
    [formQuery.data?.definition]
  );
  const formik = useFormik<Record<string, string>>({
    initialValues,
    validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async () => undefined,
  });
  const draftApplicationId = useRef(id);
  const baseline = useRef(initialValues);
  const baselineStamp = useRef(
    formQuery.data?.concurrencyStamp ?? applicationQuery.data?.concurrencyStamp
  );
  const editedFields = useRef(new Set<string>());
  const persistedFields = useRef(new Set<string>());
  const currentValues = draftApplicationId.current === id ? formik.values : {};
  const latestValues = useRef(currentValues);
  latestValues.current = currentValues;
  useEffect(() => {
    if (draftApplicationId.current !== id) {
      draftApplicationId.current = id;
      baseline.current = initialValues;
      baselineStamp.current =
        formQuery.data?.concurrencyStamp ?? applicationQuery.data?.concurrencyStamp;
      editedFields.current.clear();
      persistedFields.current.clear();
      latestValues.current = initialValues;
      formik.resetForm({ values: initialValues });
      setErrors([]);
      setFieldErrors({});
      return;
    }
    // Leaving the form view or a pending fetch must not clear a same-record draft.
    if (!formQuery.data || baseline.current === initialValues) return;
    const hasEdits = Object.entries(latestValues.current).some(
      ([code, value]) => value !== baseline.current[code]
    );
    if (hasEdits && baselineStamp.current !== applicationQuery.data?.concurrencyStamp) return;
    if (!hasEdits)
      baselineStamp.current =
        formQuery.data?.concurrencyStamp ?? applicationQuery.data?.concurrencyStamp;
    const nextBaseline = { ...initialValues };
    // Once saved, this field has answer history and is no longer eligible for
    // projection. A delayed GET may contain any old source text, so acknowledge
    // the field rather than comparing projection strings.
    (formQuery.data.autoFilledFieldCodes ?? []).forEach((code) => {
      if (persistedFields.current.has(code)) {
        if (Object.prototype.hasOwnProperty.call(baseline.current, code))
          nextBaseline[code] = baseline.current[code];
        else delete nextBaseline[code];
      }
    });
    const merged = { ...nextBaseline };
    Object.entries(latestValues.current).forEach(([code, value]) => {
      if (editedFields.current.has(code) || value !== baseline.current[code]) merged[code] = value;
    });
    baseline.current = nextBaseline;
    latestValues.current = merged;
    formik.resetForm({ values: nextBaseline, touched: formik.touched, errors: formik.errors });
    formik.setValues(merged, false);
    // Formik's state changes must not re-run server reconciliation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, initialValues]);
  const validateEditedField = (
    fieldCode: string,
    values: Record<string, string>,
    showUntouchedError: boolean
  ) => {
    const error = formQuery.data
      ? getDynamicAdmissionFieldValidationError(validationSchema, fieldCode, values)
      : undefined;
    setFieldErrors((previous) => {
      if ((!showUntouchedError && !previous[fieldCode]) || previous[fieldCode] === error)
        return previous;
      const next = { ...previous };
      if (error) next[fieldCode] = error;
      else delete next[fieldCode];
      return next;
    });
  };

  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const persistChanges = async (showSuccessMessage: boolean) => {
    if (savingRef.current || updateState.isLoading || draftApplicationId.current !== id)
      return false;
    const application = applicationQuery.data;
    if (application?.id !== id || !application?.concurrencyStamp) {
      shikshaMitraToast.error({
        message: 'The application changed or is still loading. Refresh it before saving.',
      });
      return false;
    }
    if (
      baselineStamp.current &&
      baselineStamp.current !== application.concurrencyStamp &&
      Object.entries(latestValues.current).some(([code, value]) => value !== baseline.current[code])
    ) {
      shikshaMitraToast.error({
        message:
          'This application changed while you were editing. Your answers are retained. Discard the draft and refresh the latest form before saving.',
      });
      return false;
    }
    const snapshotStamp = baselineStamp.current ?? application.concurrencyStamp;
    const valuesAtSave = latestValues.current;
    const normalizedValues = formQuery.data
      ? normalizeAdmissionFormEmailValues(formQuery.data.definition, valuesAtSave)
      : valuesAtSave;
    const writableCodes = new Set(
      formQuery.data?.definition.sections.flatMap(({ fields }) =>
        fields.filter((field) => !field.readOnly).map((field) => field.code)
      ) ?? []
    );
    const projectedCodes = new Set(
      (formQuery.data?.autoFilledFieldCodes ?? []).filter(
        (code) =>
          writableCodes.has(code) &&
          Object.prototype.hasOwnProperty.call(normalizedValues, code) &&
          !persistedFields.current.has(code)
      )
    );
    const normalizedInitialValues = formQuery.data
      ? normalizeAdmissionFormEmailValues(formQuery.data.definition, formik.initialValues)
      : formik.initialValues;
    // Hints identify untouched display projections; edits and clears are authored
    // answers even when a family source changes before this PATCH reaches the server.
    const autoFilledFieldCodes = [...projectedCodes].filter(
      (code) => normalizedValues[code] === normalizedInitialValues[code]
    );
    const changedValues = Object.entries(normalizedValues).filter(
      ([fieldCode, value]) => value !== baseline.current[fieldCode] || projectedCodes.has(fieldCode)
    );
    if (!changedValues.length) return true;
    savingRef.current = true;
    setSaving(true);
    const savingApplicationId = id;
    try {
      const savedForm = await updateValues({
        id,
        concurrencyStamp: snapshotStamp,
        ...(autoFilledFieldCodes.length ? { autoFilledFieldCodes } : {}),
        // Projected answers are display-only until this normal draft save.
        // Union them with edits, including deliberate clears, exactly once.
        values: changedValues.map(([fieldCode, value]) => ({
          fieldCode,
          valueJson: JSON.stringify(value),
        })),
      }).unwrap();
      if (draftApplicationId.current !== savingApplicationId) return false;
      changedValues.forEach(([code]) => {
        persistedFields.current.add(code);
      });
      const savedValues = Array.isArray(savedForm?.values)
        ? Object.fromEntries(
            savedForm.values.map((item) => [item.fieldCode, readAdmissionFormValue(item.valueJson)])
          )
        : normalizedValues;
      const merged = { ...savedValues };
      editedFields.current.clear();
      Object.entries(latestValues.current).forEach(([code, value]) => {
        if (value !== valuesAtSave[code]) {
          merged[code] = value;
          editedFields.current.add(code);
        }
      });
      baseline.current = savedValues;
      baselineStamp.current =
        (savedForm as { concurrencyStamp?: string })?.concurrencyStamp ?? snapshotStamp;
      latestValues.current = merged;
      formik.resetForm({ values: savedValues });
      formik.setValues(merged, false);
      if (showSuccessMessage) shikshaMitraToast.success({ message: 'Application saved' });
      return true;
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to save application',
      });
      return false;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  const save = () => persistChanges(true);
  const [advancing, setAdvancing] = useState(false);
  const advancingRef = useRef(false);
  const advance = async (options?: AdvanceOptions) => {
    if (advancingRef.current || advanceState.isLoading) return false;
    advancingRef.current = true;
    setAdvancing(true);
    try {
      let application = applicationQuery.data;
      let workflow = workflowQuery.data;
      // Managed review and assessment actions can change the application's stamp
      // before their query invalidations finish. Read both records at action time.
      try {
        [application, workflow] = await Promise.all([
          applicationQuery.refetch().unwrap(),
          workflowQuery.refetch().unwrap(),
        ]);
      } catch {
        shikshaMitraToast.error({
          message: 'The latest application could not be loaded. Try again before continuing.',
        });
        return false;
      }
      if (workflow.currentStageInstanceId !== workflowQuery.data?.currentStageInstanceId) {
        shikshaMitraToast.info({
          message: 'The admission step changed. Review the updated step before continuing.',
        });
        return false;
      }
      if (!application?.concurrencyStamp || !workflow?.currentStageInstanceId) {
        shikshaMitraToast.error({
          message: 'The application changed or is still loading. Refresh it before continuing.',
        });
        return false;
      }
      const currentStage = workflow.stages.find(
        (stage) => stage.id === workflow.currentStageInstanceId
      );
      if (
        !options?.skipCurrentStage &&
        !options?.adminOverride &&
        !canRequestNormalStageAdvance(currentStage, application.status)
      ) {
        shikshaMitraToast.error({
          message:
            "This admission step is not available in the application's current status. Refresh the application, complete the required decision or submission first, then try again.",
        });
        return false;
      }
      try {
        await advanceWorkflow({
          id,
          expectedCurrentStageInstanceId: workflow.currentStageInstanceId,
          idempotencyKey: crypto.randomUUID(),
          ...options,
          concurrencyStamp: application.concurrencyStamp,
        }).unwrap();
        setRuntimeAction(null);
        // Keep Continue pending until both records describe the saved destination stage.
        // A failed refresh uses the existing query error/retry state, never retries the write.
        await Promise.allSettled([
          applicationQuery.refetch().unwrap(),
          workflowQuery.refetch().unwrap(),
        ]);
        shikshaMitraToast.success({
          message: options?.deferFeeCollection
            ? 'Fee collection deferred to Onboarding. The application moved to the next stage.'
            : options?.skipCurrentStage
              ? 'Current stage skipped'
              : options?.adminOverride
                ? 'Workflow transition overridden'
                : 'Application moved to the next stage',
        });
        return true;
      } catch (error) {
        shikshaMitraToast.error({
          message: parseApiProblemDetail(error).detail || 'Unable to advance the workflow',
        });
        return false;
      }
    } finally {
      advancingRef.current = false;
      setAdvancing(false);
    }
  };
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const submitApplication = async () => {
    if (submittingRef.current || submitState.isLoading) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await waitForAdmissionValidationPaint();
      if (formQuery.data) {
        const normalizedErrors = getAdmissionSubmissionValidationErrors(
          formQuery.data.definition,
          latestValues.current
        );
        await formik.setTouched(
          Object.fromEntries(
            Object.keys(latestValues.current).map((fieldCode) => [fieldCode, true])
          ),
          false
        );
        if (Object.keys(normalizedErrors).length) {
          setFieldErrors(normalizedErrors);
          setErrors(['Complete the highlighted fields before submitting.']);
          return;
        }
      }
      const saved = await persistChanges(false);
      if (!saved) return;
      const result = await submit(id).unwrap();
      setErrors(result.validationErrors ?? []);
      setFieldErrors(result.fieldErrors ?? {});
      if (!result.validationErrors?.length) {
        await Promise.allSettled([
          applicationQuery.refetch().unwrap(),
          workflowQuery.refetch().unwrap(),
        ]);
        shikshaMitraToast.success({
          message:
            applicationQuery.data?.status === 1
              ? 'Application moved to the next admission step'
              : 'Application submitted',
        });
      }
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to submit application',
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };
  const validateStep = (sectionId: string) => {
    const form = formQuery.data;
    if (!form) return true;
    const section = form.definition.sections.find((item) => item.id === sectionId);
    if (!section) return true;
    const validationErrors = getDynamicAdmissionValidationErrors(
      { sections: [{ fields: section.fields }] },
      latestValues.current
    );
    setFieldErrors(validationErrors);
    setErrors(
      Object.keys(validationErrors).length
        ? ['Complete the highlighted fields before continuing.']
        : []
    );
    return Object.keys(validationErrors).length === 0;
  };
  const reopenApplication = async () => {
    try {
      await reopen(id).unwrap();
      shikshaMitraToast.success({ message: 'Application reopened' });
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to reopen application',
      });
    }
  };
  const endJourney = async (reason: string) => {
    const trimmedReason = reason.trim();
    if (!canEndJourney || !trimmedReason || trimmedReason.length > 512) return false;
    const concurrencyStamp = applicationQuery.data?.concurrencyStamp;
    if (!concurrencyStamp) {
      shikshaMitraToast.error({ message: 'Refresh the application before ending its journey.' });
      return false;
    }
    try {
      await endJourneyMutation({ id, input: { reason: trimmedReason, concurrencyStamp } }).unwrap();
      formik.resetForm();
      shikshaMitraToast.success({ message: 'Admission journey ended' });
      return true;
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to end the admission journey',
      });
      return false;
    }
  };

  return {
    applicationQuery,
    formQuery,
    workflowQuery,
    formStageQuery,
    formHistoryQuery,
    requiresForm,
    currentValues,
    hasUnsavedAnswers: draftApplicationId.current === id && formik.dirty,
    discardUnsavedAnswers: () => {
      baseline.current = initialValues;
      baselineStamp.current =
        formQuery.data?.concurrencyStamp ?? applicationQuery.data?.concurrencyStamp;
      latestValues.current = initialValues;
      formik.resetForm({ values: initialValues });
      editedFields.current.clear();
      setErrors([]);
      setFieldErrors({});
    },
    errors,
    fieldErrors,
    runtimeAction,
    setRuntimeAction,
    updateState: { ...updateState, isLoading: updateState.isLoading || saving },
    submitState: { ...submitState, isLoading: submitState.isLoading || submitting },
    advanceState: { ...advanceState, isLoading: advanceState.isLoading || advancing },
    save,
    advance,
    submitApplication,
    reopenApplication,
    reopenState,
    endJourney,
    endJourneyState,
    canEndJourney,
    validateStep,
    setFieldValue: async (fieldCode: string, value: string) => {
      if (latestValues.current[fieldCode] !== value) editedFields.current.add(fieldCode);
      // A selector may change and blur before React renders the new Formik values.
      const nextValues = { ...latestValues.current, [fieldCode]: value };
      latestValues.current = nextValues;
      validateEditedField(fieldCode, nextValues, Boolean(formik.touched[fieldCode]));
      await formik.setFieldValue(fieldCode, value);
    },
    setFieldTouched: async (fieldCode: string) => {
      // Keep validation local to this field; later steps validate on Next/Submit.
      validateEditedField(fieldCode, latestValues.current, true);
      await formik.setFieldTouched(fieldCode, true, false);
    },
    canEdit: canManage,
    canAdvance: canManage,
    canSkip: canManage,
    canOverride: canManage,
    canReopen: canManage,
  };
}

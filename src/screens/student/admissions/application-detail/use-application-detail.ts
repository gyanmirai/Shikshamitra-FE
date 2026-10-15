'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useRef, useMemo, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { shikshaMitraToast } from 'src/components/toast';
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
import { ADMISSION_APPLICATION_PERMISSIONS } from '../admission-application-permissions';
import {
  buildDynamicAdmissionYupSchema,
  getDynamicAdmissionValidationErrors,
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

export function useApplicationDetail(id: string, selectedStageId?: string) {
  const applicationQuery = useGetAdmissionApplicationQuery(id);
  const applicationId = applicationQuery.data ? id : skipToken;
  const formQuery = useGetAdmissionApplicationFormQuery(applicationId);
  const workflowQuery = useGetAdmissionApplicationWorkflowQuery(applicationId);
  const selectedFormStage = workflowQuery.data?.stages.find(
    (stage) =>
      stage.id === (selectedStageId ?? workflowQuery.data?.currentStageInstanceId) &&
      stage.formStageEnabled
  );
  const formStageQuery = useGetAdmissionFormStageQuery(
    selectedFormStage ? { applicationId: id, stageId: selectedFormStage.id } : skipToken
  );
  const formHistoryQuery = useGetAdmissionApplicationFormHistoryQuery(applicationId);
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
  const formik = useFormik<Record<string, string>>({
    initialValues,
    enableReinitialize: true,
    validationSchema: formQuery.data
      ? buildDynamicAdmissionYupSchema(formQuery.data.definition)
      : Yup.object(),
    onSubmit: async () => undefined,
  });
  const currentValues = formik.values;
  const latestValues = useRef(currentValues);
  latestValues.current = currentValues;
  const validateEditedField = (
    fieldCode: string,
    values: Record<string, string>,
    showUntouchedError: boolean
  ) => {
    const error = formQuery.data
      ? getDynamicAdmissionValidationErrors(formQuery.data.definition, values)[fieldCode]
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

  const persistChanges = async (showSuccessMessage: boolean) => {
    const application = applicationQuery.data;
    if (!application?.concurrencyStamp) {
      shikshaMitraToast.error({
        message: 'The application changed or is still loading. Refresh it before saving.',
      });
      return false;
    }
    const changedValues = Object.entries(formik.values).filter(
      ([fieldCode, value]) => value !== formik.initialValues[fieldCode]
    );
    if (!changedValues.length) return true;
    try {
      await updateValues({
        id,
        concurrencyStamp: application.concurrencyStamp,
        // Send only fields changed since the last load. The backend still
        // validates the complete pinned form on submit, while draft saves stay
        // small and safe to retry.
        values: changedValues.map(([fieldCode, value]) => ({
          fieldCode,
          valueJson: JSON.stringify(value),
        })),
      }).unwrap();
      formik.resetForm({ values: formik.values });
      if (showSuccessMessage) shikshaMitraToast.success({ message: 'Application saved' });
      return true;
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Unable to save application',
      });
      return false;
    }
  };
  const save = () => persistChanges(true);
  const [advancing, setAdvancing] = useState(false);
  const advance = async (options?: AdvanceOptions) => {
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
      setAdvancing(false);
    }
  };
  const submitApplication = async () => {
    if (formQuery.data) {
      const clientErrors = await formik.validateForm();
      const normalizedErrors = Object.fromEntries(
        Object.entries(clientErrors).filter(([, error]) => typeof error === 'string')
      ) as Record<string, string>;
      await formik.setTouched(
        Object.fromEntries(Object.keys(formik.values).map((fieldCode) => [fieldCode, true]))
      );
      if (Object.keys(normalizedErrors).length) {
        setFieldErrors(normalizedErrors);
        setErrors(['Complete the highlighted fields before submitting.']);
        return;
      }
    }
    const saved = await persistChanges(false);
    if (!saved) return;
    try {
      const result = await submit(id).unwrap();
      setErrors(result.validationErrors ?? []);
      setFieldErrors(result.fieldErrors ?? {});
      if (!result.validationErrors?.length) {
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
    }
  };
  const validateStep = (sectionId: string) => {
    const form = formQuery.data;
    if (!form) return true;
    const section = form.definition.sections.find((item) => item.id === sectionId);
    if (!section) return true;
    const validationErrors = getDynamicAdmissionValidationErrors(
      { sections: [{ fields: section.fields }] },
      currentValues
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
    currentValues,
    hasUnsavedAnswers: formik.dirty,
    discardUnsavedAnswers: () => {
      formik.resetForm();
      setErrors([]);
      setFieldErrors({});
    },
    errors,
    fieldErrors,
    runtimeAction,
    setRuntimeAction,
    updateState,
    submitState,
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

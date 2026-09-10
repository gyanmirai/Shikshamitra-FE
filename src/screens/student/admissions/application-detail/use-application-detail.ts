'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useGetAdmissionApplicationQuery,
  useGetAdmissionApplicationFormQuery,
  useSubmitAdmissionApplicationMutation,
  useGetAdmissionApplicationWorkflowQuery,
  useReopenAdmissionApplicationFormMutation,
  useGetAdmissionApplicationFormHistoryQuery,
  useAdvanceAdmissionApplicationWorkflowMutation,
  useUpdateAdmissionApplicationFormValuesMutation,
} from 'src/redux/student/admissions/admission-applications-api';

import { readAdmissionFormValue } from '../admission-visibility-rules';
import {
  buildDynamicAdmissionYupSchema,
  getDynamicAdmissionValidationErrors,
} from '../admission-form-validation';

export type RuntimeAction = 'skip' | 'override' | null;
export type AdvanceOptions = {
  reason?: string;
  transitionDefinitionId?: string;
  skipCurrentStage?: boolean;
  adminOverride?: boolean;
};

export function useApplicationDetail(id: string) {
  const applicationQuery = useGetAdmissionApplicationQuery(id);
  const formQuery = useGetAdmissionApplicationFormQuery(id);
  const workflowQuery = useGetAdmissionApplicationWorkflowQuery(id);
  const formHistoryQuery = useGetAdmissionApplicationFormHistoryQuery(id);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const [updateValues, updateState] = useUpdateAdmissionApplicationFormValuesMutation();
  const [submit, submitState] = useSubmitAdmissionApplicationMutation();
  const [reopen, reopenState] = useReopenAdmissionApplicationFormMutation();
  const [advanceWorkflow, advanceState] = useAdvanceAdmissionApplicationWorkflowMutation();
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
  const save = async () => {
    await persistChanges(true);
  };
  const advance = async (options?: AdvanceOptions) => {
    const application = applicationQuery.data;
    const workflow = workflowQuery.data;
    if (!application?.concurrencyStamp || !workflow?.currentStageInstanceId) {
      shikshaMitraToast.error({
        message: 'The application changed or is still loading. Refresh it before continuing.',
      });
      return false;
    }
    try {
      await advanceWorkflow({
        id,
        expectedCurrentStageInstanceId: workflow.currentStageInstanceId,
        idempotencyKey: crypto.randomUUID(),
        concurrencyStamp: application.concurrencyStamp,
        ...options,
      }).unwrap();
      setRuntimeAction(null);
      shikshaMitraToast.success({
        message: options?.skipCurrentStage
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
        shikshaMitraToast.success({ message: 'Application submitted' });
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

  return {
    applicationQuery,
    formQuery,
    workflowQuery,
    formHistoryQuery,
    currentValues,
    errors,
    fieldErrors,
    runtimeAction,
    setRuntimeAction,
    updateState,
    submitState,
    advanceState,
    save,
    advance,
    submitApplication,
    reopenApplication,
    reopenState,
    validateStep,
    setFieldValue: async (fieldCode: string, value: string) => {
      await formik.setFieldValue(fieldCode, value);
    },
    setFieldTouched: async (fieldCode: string) => {
      await formik.setFieldTouched(fieldCode, true, false);
      setFieldErrors(
        formQuery.data
          ? getDynamicAdmissionValidationErrors(formQuery.data.definition, formik.values)
          : {}
      );
    },
    canAdvance: hasGrantedPermission(permissions, 'Students.Admissions.Applications.Advance'),
    canSkip: hasGrantedPermission(permissions, 'Students.Admissions.Applications.SkipStage'),
    canOverride: hasGrantedPermission(
      permissions,
      'Students.Admissions.Applications.OverrideWorkflow'
    ),
    canReopen: hasGrantedPermission(permissions, 'Students.Admissions.Applications.Reopen'),
  };
}

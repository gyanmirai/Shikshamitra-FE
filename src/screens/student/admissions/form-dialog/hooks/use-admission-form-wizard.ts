import type { FormikProps } from 'formik';
import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { useRef, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { getAdmissionWizardSchema } from '../form-wizard-model';
import { getInquiryFormConfigurationIssues } from '../../admission-inquiry-field-bindings';
import {
  getAdmissionFormInitialValues,
  getBlankAdmissionFormInitialValues,
} from '../form-dialog-model';

type Props = {
  editing?: AdmissionForm | null;
  initialPurpose?: CreateUpdateAdmissionForm['purpose'];
  onClose: () => void;
  onSave: (value: CreateUpdateAdmissionForm) => Promise<void>;
  onPublishNow: (value: CreateUpdateAdmissionForm) => Promise<void>;
  canContinue?: () => boolean;
};

export function useAdmissionFormWizard({
  editing,
  initialPurpose,
  onClose,
  onSave,
  onPublishNow,
  canContinue,
}: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [initialValues] = useState(() =>
    editing
      ? getAdmissionFormInitialValues(editing, initialPurpose)
      : getBlankAdmissionFormInitialValues(initialPurpose)
  );
  const submitting = useBoolean();
  const savingRef = useRef(false);
  const submit = async (
    action: (value: CreateUpdateAdmissionForm) => Promise<void>,
    _isLastStep: boolean,
    values: CreateUpdateAdmissionForm,
    formik: FormikProps<CreateUpdateAdmissionForm>,
    setLoading: (loading: boolean) => void
  ) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setLoading(true);
    submitting.onTrue();
    try {
      await action({
        ...values,
        name: values.name.trim(),
        code: editing?.code ?? '',
        inheritance: values.purpose === 1 ? values.inheritance : undefined,
      });
      formik.resetForm();
      onClose();
    } catch (error) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Failed to save form',
      });
    } finally {
      savingRef.current = false;
      setLoading(false);
      submitting.onFalse();
    }
  };
  const saveDraft = (
    isLastStep: boolean,
    values: CreateUpdateAdmissionForm,
    formik: FormikProps<CreateUpdateAdmissionForm>,
    setLoading: (loading: boolean) => void
  ) => submit(onSave, isLastStep, values, formik, setLoading);
  const publishNow = (
    isLastStep: boolean,
    values: CreateUpdateAdmissionForm,
    formik: FormikProps<CreateUpdateAdmissionForm>,
    setLoading: (loading: boolean) => void
  ) =>
    submit(
      async (draft) => {
        const issues = getInquiryFormConfigurationIssues(draft);
        if (issues.length) throw new Error(issues.join(' '));
        await onPublishNow(draft);
      },
      isLastStep,
      values,
      formik,
      setLoading
    );
  const next = async (
    isLastStep: boolean,
    values: CreateUpdateAdmissionForm,
    formik: FormikProps<CreateUpdateAdmissionForm>,
    setLoading: (loading: boolean) => void
  ) => {
    if (
      activeStep > 0 &&
      values.purpose === 1 &&
      values.inheritance?.enabled &&
      (!values.inheritance.sources.length || (canContinue && !canContinue()))
    ) {
      shikshaMitraToast.error({
        message: 'Review and approve the current Inquiry field compatibility before continuing.',
      });
      setLoading(false);
      return;
    }
    if (!isLastStep) {
      setActiveStep(Math.min(activeStep + 1, 2));
      return;
    }
    // The shared stepper validates asynchronously, so lock before React updates busy state.
    await publishNow(isLastStep, values, formik, setLoading);
  };
  return {
    activeStep,
    initialValues,
    validationSchema: getAdmissionWizardSchema(activeStep),
    submitting: submitting.value,
    next,
    saveDraft,
    back: () => setActiveStep((step) => Math.max(step - 1, 0)),
    goTo: (step: number) => {
      if (step > activeStep && step === 2 && canContinue && !canContinue()) {
        shikshaMitraToast.error({
          message: 'Review and approve the current Inquiry field compatibility before continuing.',
        });
        return;
      }
      setActiveStep(step);
    },
  };
}

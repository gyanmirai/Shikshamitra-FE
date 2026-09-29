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
import { clearAdmissionFormDraft, useAdmissionFormDraftOwner } from '../form-draft-recovery';
import {
  getAdmissionFormInitialValues,
  getBlankAdmissionFormInitialValues,
} from '../form-dialog-model';

type Props = {
  editing?: AdmissionForm | null;
  initialPurpose?: CreateUpdateAdmissionForm['purpose'];
  onClose: () => void;
  onSave: (value: CreateUpdateAdmissionForm) => Promise<void>;
};

export function useAdmissionFormWizard({ editing, initialPurpose, onClose, onSave }: Props) {
  const draftOwner = useAdmissionFormDraftOwner();
  const [activeStep, setActiveStep] = useState(0);
  const [initialValues] = useState(() =>
    editing
      ? getAdmissionFormInitialValues(editing, initialPurpose)
      : getBlankAdmissionFormInitialValues(initialPurpose)
  );
  const submitting = useBoolean();
  const savingRef = useRef(false);
  const saveDraft = async (
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
      await onSave({ ...values, name: values.name.trim(), code: values.code.trim().toUpperCase() });
      clearAdmissionFormDraft(draftOwner, editing?.id);
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
  const next = async (
    isLastStep: boolean,
    values: CreateUpdateAdmissionForm,
    formik: FormikProps<CreateUpdateAdmissionForm>,
    setLoading: (loading: boolean) => void
  ) => {
    if (!isLastStep) {
      setActiveStep(Math.min(activeStep + 1, 2));
      return;
    }
    // The shared stepper validates asynchronously, so lock before React updates busy state.
    await saveDraft(isLastStep, values, formik, setLoading);
  };
  return {
    activeStep,
    initialValues,
    validationSchema: getAdmissionWizardSchema(activeStep),
    submitting: submitting.value,
    next,
    saveDraft,
    back: () => setActiveStep((step) => Math.max(step - 1, 0)),
    goTo: (step: number) => setActiveStep(step),
  };
}

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
import { getAdmissionFormInitialValues } from '../form-dialog-model';

type Props = {
  editing?: AdmissionForm | null;
  onClose: () => void;
  onSave: (value: CreateUpdateAdmissionForm) => Promise<void>;
};

export function useAdmissionFormWizard({ editing, onClose, onSave }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [initialValues] = useState(() => getAdmissionFormInitialValues(editing));
  const submitting = useBoolean();
  const savingRef = useRef(false);
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
    if (savingRef.current) return;
    savingRef.current = true;
    setLoading(true);
    submitting.onTrue();
    try {
      await onSave({ ...values, name: values.name.trim(), code: values.code.trim().toUpperCase() });
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
  return {
    activeStep,
    initialValues,
    validationSchema: getAdmissionWizardSchema(activeStep),
    submitting: submitting.value,
    next,
    back: () => setActiveStep((step) => Math.max(step - 1, 0)),
    goTo: (step: number) => setActiveStep(step),
  };
}

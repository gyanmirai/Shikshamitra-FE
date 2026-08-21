'use client';

import type { AdmissionForm, CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useMemo } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { admissionFormSchema, getAdmissionFormInitialValues } from './form-dialog-model';

type Props = {
  editing?: AdmissionForm | null;
  onClose: () => void;
  onSave: (value: CreateUpdateAdmissionForm) => Promise<void>;
};

export function useAdmissionFormDialog({ editing, onClose, onSave }: Props) {
  /**
   * Memoization Justification:
   * - Formik enableReinitialize compares this nested section/field graph by reference.
   * - Stable initial values avoid generating new IDs and resetting user input on parent renders.
   * - The graph is regenerated only when the loaded editable form changes.
   */
  const initialValues = useMemo(
    () => getAdmissionFormInitialValues(editing),
    [editing]
  );

  return useFormik<CreateUpdateAdmissionForm>({
    enableReinitialize: true,
    initialValues,
    validationSchema: admissionFormSchema,
    onSubmit: async (values, helpers) => {
      try {
        await onSave({
          ...values,
          name: values.name.trim(),
          code: values.code.trim().toUpperCase(),
        });
        helpers.resetForm();
        onClose();
      } catch (error) {
        shikshaMitraToast.error({
          message: parseApiProblemDetail(error).detail || 'Failed to save form',
        });
      }
    },
  });
}

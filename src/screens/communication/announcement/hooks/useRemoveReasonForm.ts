import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo, useCallback } from 'react';

interface UseRemoveReasonFormProps {
  onClose: (e: any, isSubmit: boolean) => void;
}

/**
 * Custom hook to manage the state and logic for the Announcement Remove Reason Form.
 * Prevents re-renders in the main UI component by encapsulating Formik logic.
 */
export const useRemoveReasonForm = ({ onClose }: UseRemoveReasonFormProps) => {
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        reason: Yup.string().required('Reason is required'),
      }),
    /**
     * Memoization Justification:
     * Schema is static and doesn't need to be recreated on every render.
     */
    []
  );

  const initialValues = useMemo(
    () => ({
      reason: '',
    }),
    /**
     * Memoization Justification:
     * Initial values are static for this form.
     */
    []
  );

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: () => {
      onClose(null, true);
    },
  });

  const handleCancel = useCallback(() => {
    onClose(null, false);
  }, [onClose]);

  /**
   * Memoization Justification:
   * Optimized handler to prevent unnecessary re-renders when passed to TextField.
   */
  const handleReasonChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      formik.setFieldValue('reason', e.target.value);
      formik.setFieldTouched('reason', true);
    },
    [formik]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      formik.handleSubmit();
    },
    [formik]
  );

  return {
    formik,
    handleCancel,
    handleReasonChange,
    handleSubmit,
  };
};

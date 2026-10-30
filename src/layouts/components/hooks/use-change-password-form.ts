import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useChangePasswordMutation } from 'src/redux/user/userApi';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

export const passwordFields = [
  { name: 'oldPassword', label: 'Old password', autoComplete: 'current-password' },
  { name: 'newPassword', label: 'New password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Confirm password', autoComplete: 'new-password' },
] as const;

export function useChangePasswordForm(onClose: () => void) {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [errorMessage, setErrorMessage] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const submitting = useRef(false);
  const focusedSubmit = useRef(0);
  const formik = useFormik({
    initialValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required('Old password is required'),
      newPassword: Yup.string().required('New password is required'),
      confirmPassword: Yup.string()
        .required('Confirm password is required')
        .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
    }),
    onSubmit: async (values, helpers) => {
      if (submitting.current) return;
      submitting.current = true;
      setErrorMessage('');
      try {
        await changePassword({
          data: { currentPassword: values.oldPassword, newPassword: values.newPassword },
        }).unwrap();
        helpers.resetForm();
        shikshaMitraToast.success({ message: 'Password changed successfully' });
        onClose();
      } catch (error) {
        setErrorMessage(
          parseApiProblemDetail(error).detail || 'Unable to change your password. Please try again.'
        );
      } finally {
        submitting.current = false;
      }
    },
  });
  const busy = isLoading || formik.isSubmitting;
  const { submitCount, isValidating, errors } = formik;

  useEffect(() => {
    if (!submitCount || busy || isValidating || focusedSubmit.current === submitCount) return;
    focusedSubmit.current = submitCount;
    const first = passwordFields.find(({ name }) => errors[name]);
    if (first)
      contentRef.current?.querySelector<HTMLInputElement>(`[name="${first.name}"]`)?.focus();
  }, [submitCount, busy, isValidating, errors]);

  return { formik, busy, errorMessage, contentRef };
}

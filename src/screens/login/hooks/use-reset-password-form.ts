import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useRouter, useSearchParams } from 'next/navigation';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useResetPasswordMutation,
  useVerifyPasswordResetTokenMutation,
} from 'src/redux/auth/authApi';

const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

export function useResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const token = searchParams.get('resetToken') || searchParams.get('token') || '';
  const tenantId =
    searchParams.get('tenantId') ||
    searchParams.get('__tenant') ||
    searchParams.get('tenant') ||
    '';
  const [tokenChecked, setTokenChecked] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [complete, setComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verifyToken] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useVerifyPasswordResetTokenMutation,
  });
  const [resetPassword] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useResetPasswordMutation,
    popupConfig: { error: false },
  });

  useEffect(() => {
    let active = true;
    setTokenChecked(false);
    setIsValidToken(false);
    const checkToken = async () => {
      try {
        const result = await verifyToken({
          body: { userId, resetToken: token },
          tenantId,
        }).unwrap();
        if (active) setIsValidToken(result);
      } catch {
        if (active) setIsValidToken(false);
      } finally {
        if (active) setTokenChecked(true);
      }
    };
    if (!userId || !token) setTokenChecked(true);
    else checkToken();
    return () => {
      active = false;
    };
  }, [userId, token, tenantId, verifyToken]);

  useEffect(() => {
    if (!complete) return undefined;
    const timeout = setTimeout(() => router.push('/login'), 2000);
    return () => clearTimeout(timeout);
  }, [complete, router]);

  const formik = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      if (!tokenChecked || !isValidToken || complete) return;
      setErrorMessage('');
      try {
        await resetPassword({
          body: { userId, resetToken: token, password: values.password },
          tenantId,
        }).unwrap();
        shikshaMitraToast.success({
          message: 'Password reset successful! Redirecting to login...',
        });
        setComplete(true);
        formik.resetForm();
      } catch {
        setErrorMessage('Unable to reset your password. Please try again.');
      }
    },
  });
  return { formik, tokenChecked, isValidToken, complete, errorMessage };
}

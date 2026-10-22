import * as Yup from 'yup';
import { useFormik } from 'formik';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { AUTH_ERROR_CODE, getLoginErrorMessage } from 'src/constants/auth-errors';

export type LoginValues = { organization: string; email: string; password: string };

const loginSchema = (hostLogin: boolean) =>
  Yup.object({
    organization: hostLogin
      ? Yup.string().trim()
      : Yup.string().trim().required('School Code is required'),
    email: Yup.string().trim().required('Email or Username is required'),
    password: Yup.string().required('Password is required'),
  });

export function useLoginForm() {
  const [hostLogin, setHostLogin] = useState(false);
  const [tenantInactive, setTenantInactive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setTenantInactive(
      new URLSearchParams(window.location.search).get('reason') === 'tenant-inactive'
    );
  }, []);

  const formik = useFormik<LoginValues>({
    initialValues: { organization: '', email: '', password: '' },
    validationSchema: loginSchema(hostLogin),
    onSubmit: async (values) => {
      setTenantInactive(false);
      setErrorMessage('');
      try {
        const res = await signIn('credentials', {
          email: values.email.trim(),
          password: values.password,
          organizationName: hostLogin ? '' : values.organization.trim(),
          redirect: false,
        });
        if (res?.error) {
          const inactive = res.code === 'tenant-inactive';
          const message = inactive
            ? 'This school is inactive. Contact the platform administrator.'
            : getLoginErrorMessage(res.code);
          setTenantInactive(inactive);
          if (res.code === AUTH_ERROR_CODE.invalidSchoolCode) {
            formik.setFieldError('organization', message);
          } else if (!inactive) setErrorMessage(message);
          shikshaMitraToast.error({ message });
        }
      } catch {
        setErrorMessage('Unable to sign in. Please try again.');
      }
    },
  });

  const toggleHostLogin = () => {
    if (formik.isSubmitting) return;
    setHostLogin((value) => !value);
    formik.setFieldValue('organization', '', false);
    formik.setFieldTouched('organization', false, false);
    formik.setFieldError('organization', undefined);
    setTenantInactive(false);
    setErrorMessage('');
  };

  return { formik, tenantInactive, errorMessage, hostLogin, toggleHostLogin };
}

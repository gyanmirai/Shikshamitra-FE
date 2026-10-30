import * as Yup from 'yup';
import { useFormik } from 'formik';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { AUTH_ERROR_CODE, getLoginErrorMessage } from 'src/constants/auth-errors';

export type LoginValues = { organization: string; email: string; password: string };

const loginSchema = Yup.object({
  organization: Yup.string().trim(),
  email: Yup.string().trim().required('Email or Username is required'),
  password: Yup.string().required('Password is required'),
});

export function useLoginForm() {
  const [tenantInactive, setTenantInactive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setTenantInactive(
      new URLSearchParams(window.location.search).get('reason') === 'tenant-inactive'
    );
  }, []);

  const formik = useFormik<LoginValues>({
    initialValues: { organization: '', email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setTenantInactive(false);
      setErrorMessage('');
      try {
        const res = await signIn('credentials', {
          email: values.email.trim(),
          password: values.password,
          organizationName: values.organization.trim(),
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

  const { setFieldValue } = formik;
  useEffect(() => {
    const organization = new URLSearchParams(window.location.search).get('organization')?.trim();
    if (organization) setFieldValue('organization', organization, false);
  }, [setFieldValue]);

  return { formik, tenantInactive, errorMessage };
}

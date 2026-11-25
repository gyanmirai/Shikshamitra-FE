import type { ChangeEvent } from 'react';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { AUTH_ERROR_CODE, getLoginErrorMessage } from 'src/constants/auth-errors';

export type LoginValues = { organization: string; email: string; password: string };

const SCHOOL_CODE_STORAGE_KEY = 'shikshamitra.login.school-code';

const loginSchema = Yup.object({
  organization: Yup.string().trim(),
  email: Yup.string().trim().required('Email or Username is required'),
  password: Yup.string().required('Password is required'),
});

export function useLoginForm() {
  const [tenantInactive, setTenantInactive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginSucceeded, setLoginSucceeded] = useState(false);

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
      setLoginSucceeded(false);
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
        } else if (res?.ok) {
          setLoginSucceeded(true);
        }
      } catch {
        setErrorMessage('Unable to sign in. Please try again.');
      }
    },
  });

  const { setFieldValue } = formik;
  useEffect(() => {
    let organization = new URLSearchParams(window.location.search).get('organization')?.trim();
    if (!organization) {
      try {
        organization = window.localStorage.getItem(SCHOOL_CODE_STORAGE_KEY)?.trim();
      } catch {
        // Storage may be blocked. The school code can still be entered manually.
      }
    }
    if (organization) setFieldValue('organization', organization, false);
  }, [setFieldValue]);

  const handleSchoolCodeChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    formik.handleChange(event);

    const schoolCode = event.target.value.trim();
    try {
      if (schoolCode) {
        window.localStorage.setItem(SCHOOL_CODE_STORAGE_KEY, schoolCode);
      } else {
        window.localStorage.removeItem(SCHOOL_CODE_STORAGE_KEY);
      }
    } catch {
      // Storage may be blocked. The current form value still works for sign-in.
    }
  };

  return { formik, tenantInactive, errorMessage, loginSucceeded, handleSchoolCodeChange };
}

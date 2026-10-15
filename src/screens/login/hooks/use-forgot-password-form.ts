import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useSendPasswordResetCodeMutation } from 'src/redux/auth/authApi';

const forgotPasswordSchema = Yup.object({
  organization: Yup.string().required('School code is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

export function useForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sendPasswordResetCode] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSendPasswordResetCodeMutation,
    popupConfig: { error: false },
  });
  const formik = useFormik({
    initialValues: { organization: '', email: '' },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      setErrorMessage('');
      try {
        await sendPasswordResetCode({
          body: { email: values.email, appName: 'shikshamitra-nextjs' },
          tenantId: values.organization,
        }).unwrap();
        setSent(true);
      } catch {
        setErrorMessage('Unable to send the reset link. Please try again.');
      }
    },
  });
  return { formik, sent, errorMessage };
}

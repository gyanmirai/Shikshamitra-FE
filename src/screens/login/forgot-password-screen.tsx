import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

import { AuthCard } from './components/auth-card';
import { AuthLayout } from './components/auth-layout';
import { LoginField } from './components/login-field';
import { AuthBackLink } from './components/auth-back-link';
import { AuthSubmitButton } from './components/auth-submit-button';
import { useForgotPasswordForm } from './hooks/use-forgot-password-form';

export default function ForgotPasswordScreen() {
  const { formik, sent, errorMessage } = useForgotPasswordForm();
  return (
    <AuthLayout>
      <AuthCard
        headingId="forgot-password-heading"
        title={sent ? 'Check your email' : 'Forgot your password?'}
        description={
          sent
            ? 'Follow the link in your email to choose a new password.'
            : 'Enter your school code and email to request a reset link.'
        }
      >
        {sent ? (
          <Stack spacing={2}>
            <Alert severity="success">
              If the account exists, a password reset link has been sent.
            </Alert>
            <AuthBackLink />
          </Stack>
        ) : (
          <Box
            component="form"
            noValidate
            onSubmit={formik.handleSubmit}
            aria-busy={formik.isSubmitting}
          >
            <Stack spacing={2}>
              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
              <LoginField
                name="organization"
                label="School code"
                placeholder="Enter your school code"
                autoComplete="organization"
                formik={formik}
              />
              <LoginField
                name="email"
                label="Email"
                placeholder="Enter your email address"
                type="email"
                autoComplete="email"
                formik={formik}
              />
              <AuthSubmitButton loading={formik.isSubmitting} disabled={formik.isSubmitting}>
                {formik.isSubmitting ? 'Sending link...' : 'Send reset link'}
              </AuthSubmitButton>
              {!formik.isSubmitting && <AuthBackLink />}
            </Stack>
          </Box>
        )}
      </AuthCard>
    </AuthLayout>
  );
}

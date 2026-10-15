import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { AuthCard } from './auth-card';
import { AuthBackLink } from './auth-back-link';
import { AuthSubmitButton } from './auth-submit-button';
import { AuthPasswordField } from './auth-password-field';
import { useResetPasswordForm } from '../hooks/use-reset-password-form';

export function ResetPasswordLoading() {
  return (
    <AuthCard
      headingId="reset-password-loading-heading"
      title="Checking your reset link"
      description="Please wait while we verify your password reset link."
    >
      <Stack spacing={2} role="status" aria-label="Checking password reset link" aria-busy>
        <Skeleton variant="rounded" height={48} />
        <Skeleton variant="rounded" height={48} />
      </Stack>
    </AuthCard>
  );
}

export function ResetPasswordForm() {
  const { formik, tokenChecked, isValidToken, complete, errorMessage } = useResetPasswordForm();
  if (!tokenChecked) return <ResetPasswordLoading />;

  if (!isValidToken) {
    return (
      <AuthCard
        headingId="reset-password-heading"
        title="Reset link unavailable"
        description="Request a new link to reset your password."
      >
        <Stack spacing={2}>
          <Alert severity="error">Invalid or expired password reset link.</Alert>
          <AuthBackLink href="/forgot-password">Request a new reset link</AuthBackLink>
          <AuthBackLink />
        </Stack>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      headingId="reset-password-heading"
      title={complete ? 'Your password is updated' : 'Choose a new password'}
      description={
        complete
          ? 'You can now sign in with your new password.'
          : 'Set a new password for your school account.'
      }
    >
      {complete ? (
        <Stack spacing={2}>
          <Alert severity="success">Password reset successful. Redirecting to login...</Alert>
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
            <AuthPasswordField
              name="password"
              label="New password"
              placeholder="Enter your new password"
              autoComplete="new-password"
              formik={formik}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Use at least 8 characters with uppercase and lowercase letters, a number, and a
              special character.
            </Typography>
            <AuthPasswordField
              name="confirmPassword"
              label="Confirm password"
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              formik={formik}
            />
            <AuthSubmitButton loading={formik.isSubmitting} disabled={formik.isSubmitting}>
              {formik.isSubmitting ? 'Resetting password...' : 'Reset password'}
            </AuthSubmitButton>
            {!formik.isSubmitting && <AuthBackLink />}
          </Stack>
        </Box>
      )}
    </AuthCard>
  );
}

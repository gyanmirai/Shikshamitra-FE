import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';

import { AuthCard } from './auth-card';
import { LoginHelp } from './login-help';
import { LoginCredentials } from './login-credentials';
import { useLoginForm } from '../hooks/use-login-form';
import { AuthSubmitButton } from './auth-submit-button';

export function LoginForm() {
  const { formik, tenantInactive, errorMessage, hostLogin, toggleHostLogin } = useLoginForm();

  return (
    <Box sx={{ width: 1, maxWidth: 440, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <AuthCard
        headingId="login-heading"
        title="Enter your workspace"
        description={
          hostLogin
            ? 'Sign in with your platform administrator account. No school code is needed.'
            : 'Sign in to continue to your school workspace.'
        }
      >
        <Box
          component="form"
          noValidate
          onSubmit={formik.handleSubmit}
          aria-busy={formik.isSubmitting}
        >
          <Stack spacing={2}>
            {tenantInactive && (
              <Alert severity="warning">
                This school is inactive. Contact the platform administrator.
              </Alert>
            )}
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <LoginCredentials formik={formik} hostLogin={hostLogin} />
            <Link
              component={RouterLink}
              href="/forgot-password"
              underline="hover"
              aria-disabled={formik.isSubmitting || undefined}
              tabIndex={formik.isSubmitting ? -1 : undefined}
              sx={(theme) => ({
                alignSelf: 'flex-end',
                color: 'primary.dark',
                fontSize: '0.8125rem',
                minHeight: 44,
                display: 'inline-flex',
                alignItems: 'center',
                pointerEvents: formik.isSubmitting ? 'none' : 'auto',
                ...theme.applyStyles('dark', { color: 'primary.light' }),
                '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: 2 },
              })}
            >
              Forgot password?
            </Link>
            <AuthSubmitButton
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting}
              endIcon={!formik.isSubmitting && <Iconify icon="mdi:arrow-right" width={18} />}
            >
              {formik.isSubmitting ? 'Signing in...' : 'Sign in'}
            </AuthSubmitButton>
            <Button
              type="button"
              variant="text"
              onClick={toggleHostLogin}
              disabled={formik.isSubmitting}
            >
              {hostLogin ? 'Sign in to a school' : 'Platform administrator sign in'}
            </Button>
          </Stack>
        </Box>
      </AuthCard>
      <LoginHelp disabled={formik.isSubmitting} />
    </Box>
  );
}

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { RouterLink } from 'src/routes/components';
import { getContrastRatio } from '@mui/material/styles';

import { LoginHelp } from './login-help';
import { LoginCredentials } from './login-credentials';
import { useLoginForm } from '../hooks/use-login-form';

const buttonTextColor = (background: string, text: string) =>
  getContrastRatio(background, text) >= 4.5 ? 'primary.contrastText' : 'grey.900';

export function LoginForm() {
  const { formik, tenantInactive, errorMessage } = useLoginForm();

  return (
    <Box sx={{ width: 1, maxWidth: 440, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Box
        component="section"
        aria-labelledby="login-heading"
        sx={{
          color: 'text.primary',
          width: 1,
          px: { xs: 2.5, sm: 3.5 },
          py: 3.5,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2.5,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Typography
          variant="caption"
          sx={(theme) => ({
            mb: 2,
            color: 'primary.dark',
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            ...theme.applyStyles('dark', { color: 'primary.light' }),
          })}
        >
          GYANMIRAI SCHOOL PORTAL
        </Typography>
        <Typography
          id="login-heading"
          component="h2"
          variant="h3"
          sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, letterSpacing: '-0.025em', mb: 1 }}
        >
          Enter your workspace
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Sign in to continue to your school workspace.
        </Typography>
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
            <LoginCredentials formik={formik} />
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
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting}
              endIcon={!formik.isSubmitting && <Iconify icon="mdi:arrow-right" width={18} />}
              sx={({ palette: { primary } }) => ({
                minHeight: 48,
                borderRadius: 1.5,
                boxShadow: 'none',
                bgcolor: 'primary.main',
                color: buttonTextColor(primary.main, primary.contrastText),
                fontSize: '0.9375rem',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  color: buttonTextColor(primary.dark, primary.contrastText),
                  boxShadow: 'none',
                },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'text.primary',
                  outlineOffset: 3,
                },
              })}
            >
              {formik.isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </Stack>
        </Box>
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          justifyContent="center"
          sx={{ mt: 3, color: 'text.secondary' }}
        >
          <Iconify icon="mdi:lock-outline" width={16} />
          <Typography variant="caption">School account access</Typography>
        </Stack>
      </Box>
      <LoginHelp disabled={formik.isSubmitting} />
    </Box>
  );
}

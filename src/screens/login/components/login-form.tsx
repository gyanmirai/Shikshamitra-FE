import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { RouterLink } from 'src/routes/components';
import { motion, useReducedMotion } from 'framer-motion';

import { LoginHelp } from './login-help';
import { LoginCredentials } from './login-credentials';
import { useLoginForm } from '../hooks/use-login-form';

export function LoginForm() {
  const { formik, tenantInactive, errorMessage } = useLoginForm();
  const reduceMotion = useReducedMotion();

  return (
    <Box
      component={motion.section}
      aria-labelledby="login-heading"
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      sx={{
        position: 'relative',
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRadius: '32px 32px 0 0',
        mt: -4,
        px: 3.5,
        pt: 4,
        pb: 'max(24px, env(safe-area-inset-bottom))',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <Typography
        id="login-heading"
        component="h2"
        variant="h4"
        sx={{ fontSize: '1.5rem', mb: 0.75 }}
      >
        Welcome back
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Sign in to your school account.
      </Typography>
      <Box
        component="form"
        noValidate
        onSubmit={formik.handleSubmit}
        aria-busy={formik.isSubmitting}
      >
        <Stack spacing={2.5}>
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
            sx={{
              alignSelf: 'flex-end',
              color: 'text.primary',
              fontSize: '0.8125rem',
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
              pointerEvents: formik.isSubmitting ? 'none' : 'auto',
              '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: 2 },
            }}
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
            sx={{
              minHeight: 52,
              borderRadius: 1.5,
              boxShadow: 'none',
              bgcolor: 'primary.lighter',
              color: 'primary.darker',
              fontSize: '0.9375rem',
              '&:hover': { bgcolor: 'primary.light', boxShadow: 'none' },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'text.primary',
                outlineOffset: 3,
              },
            }}
          >
            {formik.isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </Stack>
      </Box>
      <LoginHelp disabled={formik.isSubmitting} />
    </Box>
  );
}

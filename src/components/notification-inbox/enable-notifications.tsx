'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { useWebPush } from 'src/hooks/notifications/use-web-push';

const messages = {
  loading: 'Checking notification settings…',
  unsupported: 'Browser notifications are unavailable on this device.',
  'needs-installation':
    'On iPhone or iPad, open this site in Safari and choose Share → Add to Home Screen. Turn on Open as Web App if shown, then open the new icon and enable notifications from the bell.',
  unconfigured: 'Browser notifications are unavailable for this school.',
  blocked: 'Allow notifications in your browser settings, then try again.',
  ready: 'Get school updates on this device.',
  enabled: 'Browser notifications are on for this device.',
  expired: 'Browser notifications expired on this device.',
  error: 'Notification settings could not be loaded.',
} as const;

const toggleLabels = {
  enabled: 'Turn off browser notifications',
  ready: 'Enable browser notifications',
  expired: 'Enable browser notifications again',
} as const;

export default function EnableNotifications() {
  const { visible, state, busy, failed, toggle, retry } = useWebPush();
  if (!visible) return null;

  const canToggle = state === 'enabled' || state === 'ready' || state === 'expired';
  const canRetry = state === 'error' || state === 'blocked';
  const severity =
    failed || state === 'error' ? 'error' : canRetry || state === 'expired' ? 'warning' : undefined;
  const message = failed ? 'The setting could not be saved. Try again.' : messages[state];

  return (
    <Stack
      component="footer"
      gap={1}
      sx={{
        px: { xs: 2, sm: 3 },
        pt: 1.5,
        pb: (theme) => `max(${theme.spacing(1.5)}, env(safe-area-inset-bottom))`,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.neutral',
        flexShrink: 0,
      }}
    >
      {severity ? (
        <Alert
          variant="outlined"
          severity={severity}
          role={severity === 'error' ? 'alert' : 'status'}
        >
          {message}
        </Alert>
      ) : (
        <Stack direction="row" gap={1} alignItems="center" color="text.secondary">
          <Iconify icon={GlobalIcons.bell} width={18} aria-hidden />
          <Typography variant="caption" role="status" aria-busy={state === 'loading' || busy}>
            {message}
          </Typography>
        </Stack>
      )}
      {(canToggle || canRetry) && (
        <Stack direction="row" gap={1} flexWrap="wrap">
          {canToggle && (
            <Button size="small" variant="outlined" color="inherit" loading={busy} onClick={toggle}>
              {toggleLabels[state]}
            </Button>
          )}
          {canRetry && (
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
              onClick={retry}
            >
              Try again
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
}

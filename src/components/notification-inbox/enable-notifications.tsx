'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useWebPush } from 'src/hooks/notifications/use-web-push';

const messages = {
  loading: 'Checking notification settings…',
  unsupported: 'This browser cannot enable notifications here. On iPhone or iPad, open the website from your Home Screen.',
  unconfigured: 'Browser notifications are unavailable for this school.',
  blocked: 'Allow notifications in your browser settings, then try again.',
  ready: 'Get school updates on this device.',
  enabled: 'Browser notifications are on for this device.',
  error: 'Notification settings could not be loaded.',
} as const;

export default function EnableNotifications() {
  const { visible, state, busy, failed, toggle, retry } = useWebPush();
  if (!visible) return null;

  return (
    <Box sx={{ px: 2.5, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary" role="status">
        {failed ? 'The setting could not be saved. Try again.' : messages[state]}
      </Typography>
      {(state === 'enabled' || state === 'ready') && (
        <Button size="small" loading={busy} sx={{ mt: 0.5 }} onClick={toggle}>
          {state === 'enabled' ? 'Turn off browser notifications' : 'Enable browser notifications'}
        </Button>
      )}
      {(state === 'error' || state === 'blocked') && (
        <Button size="small" sx={{ mt: 0.5 }} onClick={retry}>Try again</Button>
      )}
    </Box>
  );
}

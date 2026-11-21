import type { NotificationSendResult } from 'src/redux/library/notification-types';

import { useRef, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Alert, Stack, Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useRunLibraryNotificationRemindersMutation } from 'src/redux/library/notifications-api';

import { useNotificationAccess } from './useNotificationAccess';

export function NotificationRunDialog({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: (result: NotificationSendResult) => void;
}) {
  const { canAct } = useNotificationAccess();
  const [run, response] = useRunLibraryNotificationRemindersMutation();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const submit = async () => {
    if (!canAct || inFlight.current) return;
    inFlight.current = true;
    setError('');
    try {
      onComplete(await run({}).unwrap());
    } catch (cause) {
      setError(parseApiProblemDetail(cause).detail || 'Could not run reminders. Please retry.');
    } finally {
      inFlight.current = false;
    }
  };
  return (
    <ConfirmDialog
      open
      title="Run Eligible Reminders?"
      icon="info"
      onClose={onClose}
      disableCancel={response.isLoading}
      disableEscapeKeyDown={response.isLoading}
      disableBackdropClick
      bodyBusy={response.isLoading}
      content={
        <Stack spacing={2}>
          <span>
            Evaluate current records in your authorized scope using the Library school date. Event
            settings, recipient eligibility, consent and repeat intervals are checked by the server.
          </span>
          <span>
            Email deliveries are queued. Existing delivery records may suppress duplicates.
          </span>
          {!canAct && <Alert severity="info">Notification action authority is required.</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      }
      action={
        <Button
          type="button"
          size="small"
          variant="contained"
          loading={response.isLoading}
          disabled={!canAct}
          onClick={submit}
          startIcon={<Iconify icon={GlobalIcons.sendNotification} />}
        >
          Run reminders
        </Button>
      }
    />
  );
}

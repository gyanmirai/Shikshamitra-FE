import type { LibraryNotificationHistory } from 'src/redux/library/library-adapters';

import { useRef, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Button, Checkbox, FormControlLabel } from '@mui/material';
import { useRetryLibraryNotificationMutation } from 'src/redux/library/notifications-api';

import { useNotificationAccess } from './useNotificationAccess';

export function NotificationRetryDialog({
  item,
  onClose,
}: {
  item: LibraryNotificationHistory;
  onClose: () => void;
}) {
  const { canAct } = useNotificationAccess();
  const [retry, result] = useRetryLibraryNotificationMutation();
  const [acknowledge, setAcknowledge] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const uncertain = item.status === 'Unconfirmed';
  const allowed =
    canAct && item.channel === 'Email' && ['Failed', 'Unconfirmed'].includes(item.status);
  const submit = async () => {
    if (!allowed || inFlight.current || (uncertain && !acknowledge)) return;
    inFlight.current = true;
    setError('');
    try {
      await retry({ id: item.id, acknowledgePossibleDuplicate: acknowledge }).unwrap();
      onClose();
    } catch (cause) {
      setError(parseApiProblemDetail(cause).detail || 'Could not queue this retry.');
    } finally {
      inFlight.current = false;
    }
  };
  return (
    <ConfirmDialog
      open
      title="Retry Email Delivery?"
      icon="warning"
      onClose={onClose}
      disableCancel={result.isLoading}
      disableEscapeKeyDown={result.isLoading}
      disableBackdropClick
      bodyBusy={result.isLoading}
      content={
        <Stack spacing={2}>
          <span>
            {item.subject} · {item.recipientName || 'Recorded recipient'}
          </span>
          <span>
            A retry is queued and rechecks current scope, recipient eligibility and delivery
            consent.
          </span>
          {uncertain && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={acknowledge}
                  disabled={result.isLoading}
                  onChange={(_, value) => setAcknowledge(value)}
                />
              }
              label="I understand the previous delivery is unconfirmed and a retry may send a duplicate email."
            />
          )}
          {!allowed && (
            <Alert severity="info">
              This delivery cannot be retried with your current authority or status.
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      }
      action={
        <Button
          type="button"
          size="small"
          variant="contained"
          loading={result.isLoading}
          disabled={!allowed || (uncertain && !acknowledge)}
          onClick={submit}
          startIcon={<Iconify icon={GlobalIcons.sendNotification} />}
        >
          Queue retry
        </Button>
      }
    />
  );
}

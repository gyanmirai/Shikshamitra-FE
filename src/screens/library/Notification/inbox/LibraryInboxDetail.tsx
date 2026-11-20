import type { LibraryInboxItem } from 'src/redux/library/notification-types';

import { useRef, useState } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useMarkLibraryInboxReadMutation } from 'src/redux/library/inbox-api';
import { Alert, Stack, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { notificationZone } from '../notification-display';

export function LibraryInboxDetail({
  item,
  viewer,
  onClose,
}: {
  item: LibraryInboxItem;
  viewer: string;
  onClose: () => void;
}) {
  const [mark, response] = useMarkLibraryInboxReadMutation();
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const confirmed = response.data?.id === item.id ? response.data : item;
  useUnsavedNavigation(false, { blockNavigation: response.isLoading, guardContextChanges: true });
  const submit = async () => {
    if (inFlight.current || confirmed.readAt) return;
    inFlight.current = true;
    setError('');
    try {
      await mark({ id: item.id, viewer }).unwrap();
    } catch (cause) {
      setError(
        parseApiProblemDetail(cause).detail ||
          'Could not confirm the read receipt. Refresh the inbox before retrying.'
      );
    } finally {
      inFlight.current = false;
    }
  };
  return (
    <CustomDialog
      open
      hasForm={false}
      maxWidth="sm"
      title="Library Message"
      titleInfo="Opening a message does not mark it as read. Use the explicit action to record your read receipt."
      handleClose={onClose}
      disableClose={response.isLoading}
      guardUnsavedChanges={false}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <FormSectionCard
            title="Message Details"
            icon={GlobalIcons.email}
            descriptionTooltip="This message was delivered to your account using a verified school association."
          >
            <Label color={confirmed.readAt ? 'default' : 'info'}>
              {confirmed.readAt ? 'Read' : 'Unread'}
            </Label>
            {confirmed.memberName && (
              <Typography variant="body2">For: {confirmed.memberName}</Typography>
            )}
            <Typography variant="caption">
              Sent {fDateTime(confirmed.sentAt)} · {notificationZone()}
            </Typography>
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {confirmed.subject}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {confirmed.message}
            </Typography>
            {confirmed.readAt && (
              <Typography variant="caption">
                Read {fDateTime(confirmed.readAt)} · {notificationZone()}
              </Typography>
            )}
          </FormSectionCard>
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          type="button"
          size="small"
          variant="outlined"
          color="inherit"
          disabled={response.isLoading}
          onClick={onClose}
        >
          Close
        </Button>
        {!confirmed.readAt && (
          <Button
            type="button"
            size="small"
            variant="contained"
            loading={response.isLoading}
            onClick={submit}
            startIcon={<Iconify icon={GlobalIcons.tick} />}
          >
            Mark as read
          </Button>
        )}
      </DialogActions>
    </CustomDialog>
  );
}

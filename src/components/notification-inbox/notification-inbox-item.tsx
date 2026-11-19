import type { NotificationInboxItem } from 'src/redux/communication/notification-self-api';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import { Alert, Stack, Button, ListItem, Typography } from '@mui/material';
import { useChangePersonalNotificationItemMutation } from 'src/redux/communication/notification-self-api';

import { notificationLink } from './notification-link';

export function NotificationInboxRow({ item, owner, onOpen }: {
  item: NotificationInboxItem;
  owner: string;
  onOpen: () => void;
}) {
  const sending = useRef(false);
  const [change, mutation] = useChangePersonalNotificationItemMutation();
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState<NotificationInboxItem>();
  const row = updated ?? item;
  const link = notificationLink(row.relativeLink);

  async function changeItem(action: 'read' | 'acknowledge') {
    if (sending.current) return;
    sending.current = true;
    setError('');
    try {
      setUpdated(await change({ owner, id: item.id, action }).unwrap());
    } catch {
      setError(action === 'read' ? 'The notification could not be marked read.' : 'The acknowledgement could not be saved.');
    } finally {
      sending.current = false;
    }
  }

  return (
    <ListItem alignItems="flex-start" disableGutters sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'block' }}>
      <Stack gap={1}>
        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <Typography component="h3" variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>{item.title || 'School notification'}</Typography>
          {row.acknowledgedAt ? <Label color="success">Acknowledged</Label> : !row.readAt && <Label color="info">Unread</Label>}
        </Stack>
        <Typography component="time" dateTime={item.creationTime} variant="caption" color="text.secondary">
          {fDateTime(item.creationTime)}
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{item.body}</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {link && <Button size="small" LinkComponent={Link} href={link} onClick={onOpen}>Open record</Button>}
          {!row.readAt && (
            <Button size="small" disabled={mutation.isLoading} onClick={() => changeItem('read')}>Mark as read</Button>
          )}
          {!row.acknowledgedAt && (
            <Button size="small" disabled={mutation.isLoading} onClick={() => changeItem('acknowledge')}>Acknowledge</Button>
          )}
        </Stack>
      </Stack>
    </ListItem>
  );
}

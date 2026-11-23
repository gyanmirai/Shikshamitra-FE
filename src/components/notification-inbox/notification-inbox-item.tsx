import type { NotificationInboxItem } from 'src/redux/communication/notification-self-api';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { fDateTime, formatStr } from 'src/utils/format-time';
import { Alert, Stack, Button, Typography, CircularProgress } from '@mui/material';
import { useChangePersonalNotificationItemMutation } from 'src/redux/communication/notification-self-api';

import { notificationLink } from './notification-link';

const academicReportDownload =
  /^\/api\/academic-reports\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\/download$/i;

const statusActions = [
  { action: 'read', label: 'Mark as read', pendingLabel: 'Marking as read…' },
  { action: 'acknowledge', label: 'Acknowledge', pendingLabel: 'Acknowledging…' },
] as const;

type RowAction = (typeof statusActions)[number]['action'];

export function NotificationInboxRow({
  item,
  owner,
  unreadOnly,
  isToday,
  onOpen,
}: {
  item: NotificationInboxItem;
  owner: string;
  unreadOnly: boolean;
  isToday: boolean;
  onOpen: () => void;
}) {
  const title = useRef<HTMLHeadingElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const sending = useRef(false);
  const [change] = useChangePersonalNotificationItemMutation();
  const [pending, setPending] = useState<RowAction>();
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState<NotificationInboxItem>();
  const row = updated ?? item;
  const unread = !row.readAt && !row.acknowledgedAt;
  const link = notificationLink(row.relativeLink);
  const isReportDownload = link !== null && academicReportDownload.test(link);

  async function changeItem(action: RowAction) {
    if (sending.current) return;
    sending.current = true;
    setPending(action);
    setError('');
    try {
      const saved = await change({ owner, id: item.id, action }).unwrap();
      if (
        title.current &&
        actions.current?.contains(document.activeElement) &&
        document.activeElement?.getAttribute('aria-disabled') === 'true'
      ) {
        const nextFocus = unreadOnly
          ? title.current.closest<HTMLElement>('[role="tabpanel"]')
          : title.current;
        nextFocus?.focus();
      }
      setUpdated(saved);
    } catch {
      setError(
        action === 'read'
          ? 'The notification could not be marked read.'
          : 'The acknowledgement could not be saved.'
      );
    } finally {
      sending.current = false;
      setPending(undefined);
    }
  }

  return (
    <Stack
      component="li"
      gap={1}
      sx={(theme) => ({
        px: { xs: 2, sm: 3 },
        py: 2,
        borderBottom: 1,
        borderColor: 'divider',
        ...(unread && {
          bgcolor: varAlpha(theme.vars.palette.info.mainChannel, 0.06),
          boxShadow: `inset ${theme.direction === 'rtl' ? '-3px' : '3px'} 0 ${theme.vars.palette.info.main}`,
        }),
      })}
    >
      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
        <Typography
          ref={title}
          component="h4"
          variant={unread ? 'subtitle1' : 'subtitle2'}
          tabIndex={-1}
          sx={{ overflowWrap: 'anywhere' }}
        >
          {item.title || 'School notification'}
        </Typography>
        {row.acknowledgedAt ? (
          <Label color="success">Acknowledged</Label>
        ) : (
          unread && <Label color="info">Unread</Label>
        )}
      </Stack>
      <Typography
        component="time"
        dateTime={item.creationTime}
        variant="caption"
        color="text.secondary"
      >
        {fDateTime(item.creationTime, isToday ? formatStr.time : undefined)}
      </Typography>
      <Typography
        color="text.secondary"
        variant="body2"
        sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
      >
        {item.body}
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Stack
        ref={actions}
        direction="row"
        flexWrap="wrap"
        gap={1}
        sx={{
          '& .MuiButton-root[aria-disabled="true"]': {
            color: 'text.disabled',
            pointerEvents: 'none',
          },
        }}
      >
        {link && (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            LinkComponent={isReportDownload ? 'a' : Link}
            href={link}
            onClick={isReportDownload ? undefined : onOpen}
            startIcon={
              <Iconify
                icon={isReportDownload ? GlobalIcons.download : GlobalIcons.eye}
                width={18}
              />
            }
          >
            {isReportDownload ? 'Download report' : 'Open record'}
          </Button>
        )}
        {statusActions.map(({ action, label, pendingLabel }) => {
          if (action === 'read' ? row.readAt : row.acknowledgedAt) return null;
          const isPending = pending === action;

          return (
            <Button
              key={action}
              size="small"
              aria-disabled={pending ? true : undefined}
              aria-busy={isPending}
              startIcon={
                isPending ? <CircularProgress size={14} color="inherit" aria-hidden /> : undefined
              }
              onClick={() => changeItem(action)}
            >
              {isPending ? pendingLabel : label}
            </Button>
          );
        })}
      </Stack>
    </Stack>
  );
}

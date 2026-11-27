import type { NotificationInboxItem } from 'src/redux/communication/notification-self-api';

import Link from 'next/link';
import { Label } from 'src/components/label';
import { useId, useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { varAlpha, stylesMode } from 'src/theme/styles';
import { fTime, fDateTime } from 'src/utils/format-time';
import { Box, Alert, Stack, Button, ListItem, Typography } from '@mui/material';
import { useChangePersonalNotificationItemMutation } from 'src/redux/communication/notification-self-api';

import { presentNotification } from './notification-presentation';

const academicReportDownload = /^\/api\/academic-reports\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\/download$/i;

export function NotificationInboxRow({ item, owner, attention, onOpen }: {
  item: NotificationInboxItem;
  owner: string;
  attention?: boolean;
  onOpen: () => void;
}) {
  const contentId = useId();
  const titleButton = useRef<HTMLButtonElement>(null);
  const sending = useRef(false);
  const [change, mutation] = useChangePersonalNotificationItemMutation();
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [updated, setUpdated] = useState<NotificationInboxItem>();
  const readAt = item.readAt ?? updated?.readAt;
  const acknowledgedAt = item.acknowledgedAt ?? updated?.acknowledgedAt;
  const mustAcknowledge = item.requiresAcknowledgement && !acknowledgedAt;
  const { title, message, isLessonPlan, link } = presentNotification(item);
  const isReportDownload = link !== null && academicReportDownload.test(link);
  const hasSummaryActions = item.requiresReview || mustAcknowledge || isReportDownload || acknowledgedAt;

  async function changeItem(action: 'read' | 'acknowledge') {
    if (sending.current) return;
    sending.current = true;
    setError('');
    try {
      const saved = await change({ owner, id: item.id, action }).unwrap();
      titleButton.current?.focus();
      setUpdated(saved);
    } catch {
      setError(action === 'read' ? 'The notification could not be marked read.' : 'The acknowledgement could not be saved.');
    } finally {
      sending.current = false;
    }
  }

  return (
    <ListItem disableGutters sx={{
      px: attention ? 1.25 : 2, py: 1, display: 'grid', alignItems: 'start',
      gridTemplateColumns: '28px minmax(0, 1fr)', gap: 1,
      '& + &': { borderTop: 1, borderColor: 'divider' },
    }}>
      <Box aria-hidden sx={(theme) => ({
        width: 28, height: 28, mt: 0.25, display: 'grid', placeItems: 'center', borderRadius: 1,
        bgcolor: readAt ? 'background.neutral' : varAlpha(theme.vars.palette.primary.mainChannel, 0.14),
        color: readAt ? 'text.secondary' : 'primary.dark',
        [stylesMode.dark]: { color: readAt ? 'text.secondary' : 'primary.light' },
      })}>
        <Iconify width={16} icon={isLessonPlan ? 'solar:notebook-bold-duotone' : 'solar:bell-bold-duotone'} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={0.5} flexWrap="wrap">
          <Typography component="h4" variant="subtitle2" sx={{ minWidth: 0 }}>
            <Button ref={titleButton} size="small" color="inherit" aria-expanded={expanded} aria-controls={contentId}
              aria-describedby={!readAt ? `${contentId}-unread` : undefined}
              onClick={() => setExpanded((previous) => !previous)}
              sx={{
                minWidth: 0, minHeight: 30, height: 'auto', maxWidth: 1, px: 0,
                textAlign: 'left', whiteSpace: 'normal', overflowWrap: 'anywhere', fontWeight: readAt ? 600 : 700,
              }}>
              {!readAt && <Box component="span" aria-hidden sx={{
                mr: 0.75, width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0,
              }} />}
              {title}
            </Button>
          </Typography>
          {!readAt && <span id={`${contentId}-unread`} hidden>Unread</span>}
          <Typography component="time" dateTime={item.creationTime} variant="caption" color="text.secondary"
            title={fDateTime(item.creationTime) ?? undefined} sx={{ whiteSpace: 'nowrap' }}>
            {attention ? fDateTime(item.creationTime, 'D MMM, h:mm a') : fTime(item.creationTime)}
          </Typography>
        </Stack>
        {!expanded && message && <Typography variant="body2" color="text.secondary" sx={{
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere',
        }}>{message}</Typography>}
        {hasSummaryActions && (
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.5 }}>
            {item.requiresReview && <Button size="small" color="primary" aria-expanded={expanded} aria-controls={contentId}
              onClick={() => setExpanded((previous) => !previous)} sx={{ px: 0 }}>
              {expanded ? 'Hide feedback' : 'Review feedback'}
            </Button>}
            {mustAcknowledge && <Button size="small" color="primary" loading={mutation.isLoading}
              onClick={() => changeItem('acknowledge')} sx={{ px: 0 }}>Acknowledge</Button>}
            {isReportDownload && (
              <Button size="small" variant="soft" color="primary" component="a" href={link}>
                Download report
              </Button>
            )}
            {acknowledgedAt && <Label color="success" sx={{ alignSelf: 'center' }}>Acknowledged</Label>}
          </Stack>
        )}
        {error && <Alert severity="error" sx={{ mt: 0.5 }}>{error}</Alert>}
        <Box id={contentId} hidden={!expanded} sx={expanded ? { pb: 0.25 } : undefined}>
          {message && <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{message}</Typography>}
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 0.5 }}>
            {link && !isReportDownload && (
              <Button size="small" LinkComponent={Link} href={link} onClick={onOpen}>Open record</Button>
            )}
            {!readAt && <Button size="small" disabled={mutation.isLoading} onClick={() => changeItem('read')}>Mark as read</Button>}
            {!acknowledgedAt && !mustAcknowledge && (
              <Button size="small" disabled={mutation.isLoading} onClick={() => changeItem('acknowledge')}>Acknowledge</Button>
            )}
          </Stack>
        </Box>
      </Box>
    </ListItem>
  );
}

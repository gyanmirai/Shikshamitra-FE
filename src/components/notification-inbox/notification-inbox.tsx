import type { NotificationInboxItem } from 'src/redux/communication/notification-self-api';

import dayjs from 'dayjs';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, List, Alert, Stack, Button, Skeleton, Typography } from '@mui/material';
import { usePersonalNotificationInboxInfiniteQuery } from 'src/redux/communication/notification-self-api';

import { NotificationInboxRow } from './notification-inbox-item';
import { notificationDay, needsNotificationAttention } from './notification-presentation';

export function NotificationInbox({ owner, unreadOnly, onOpen }: {
  owner: string;
  unreadOnly: boolean;
  onOpen: () => void;
}) {
  const query = usePersonalNotificationInboxInfiniteQuery({ owner, unreadOnly }, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
    pollingInterval: 30000,
    skipPollingIfUnfocused: true,
  });
  const entries = new Map<string, NotificationInboxItem>();
  query.currentData?.pages.forEach(({ items }) => items.forEach((item) => entries.set(item.id, item)));
  const attention: NotificationInboxItem[] = [];
  const days = new Map<string, NotificationInboxItem[]>();
  const now = dayjs();
  entries.forEach((item) => {
    if (needsNotificationAttention(item)) {
      attention.push(item);
      return;
    }
    const day = notificationDay(item.creationTime, now);
    const group = days.get(day);
    if (group) group.push(item);
    else days.set(day, [item]);
  });
  const { error } = query;
  const nextPageFailed = query.isFetchNextPageError && error && 'status' in error &&
    (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR' ||
      (typeof error.status === 'number' && error.status >= 500));

  if (query.isError && !nextPageFailed) {
    return (
      <Alert severity="error" sx={{ m: 2 }} action={<Button size="small" onClick={() => query.refetch()}>Retry</Button>}>
        Your notifications could not be loaded.
      </Alert>
    );
  }
  if (!query.currentData && query.isFetching) {
    return (
      <Stack gap={1} sx={{ p: 2 }} role="status" aria-label="Loading notifications">
        <Skeleton variant="rounded" height={48} />
        <Skeleton variant="rounded" height={48} />
      </Stack>
    );
  }
  if (!entries.size) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        {unreadOnly ? 'You have no unread notifications.' : 'You have no notifications yet.'}
      </Typography>
    );
  }

  return (
    <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
      <Box sx={{ pb: 1 }}>
        {attention.length > 0 && (
          <Box component="section" aria-label="Needs your attention" sx={{
            mx: 1.5, mt: 1.5, mb: 0.5, border: 1, borderColor: 'divider', borderRadius: 1.25, overflow: 'hidden',
          }}>
            <Stack direction="row" gap={0.75} alignItems="center" sx={(theme) => ({
              px: 1.25, py: 0.75, bgcolor: varAlpha(theme.vars.palette.warning.mainChannel, 0.12),
            })}>
              <Iconify icon="solar:bell-bold-duotone" width={16} sx={{ color: 'warning.main' }} />
              <Typography component="h3" variant="caption" fontWeight={700}>Needs your attention</Typography>
            </Stack>
            <List disablePadding aria-label="Actionable notifications">
              {attention.map((item) => <NotificationInboxRow key={item.id} item={item} owner={owner} onOpen={onOpen} attention />)}
            </List>
          </Box>
        )}
        {Array.from(days, ([day, items]) => (
          <Box key={day}>
            <Typography component="h3" variant="caption" fontWeight={700} color="text.secondary"
              sx={{ px: 2, pt: 1, display: 'block' }}>{day}</Typography>
            <List disablePadding aria-label={day}>
              {items.map((item) => <NotificationInboxRow key={item.id} item={item} owner={owner} onOpen={onOpen} />)}
            </List>
          </Box>
        ))}
        {nextPageFailed && <Alert severity="error" sx={{ mx: 2, mt: 1 }}>More notifications could not be loaded.</Alert>}
        {(query.hasNextPage || nextPageFailed) && (
          <Stack alignItems="center" sx={{ mx: 2, mt: 1, pt: 0.75, borderTop: 1, borderColor: 'divider' }}>
            <Button size="small" color="primary" loading={query.isFetchingNextPage}
              disabled={query.isFetching && !query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
              {nextPageFailed ? 'Retry loading more' : 'Load more'}
            </Button>
          </Stack>
        )}
      </Box>
    </Scrollbar>
  );
}

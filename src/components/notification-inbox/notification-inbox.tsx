import { useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, List, Alert, Stack, Button, Skeleton, Typography } from '@mui/material';
import { usePersonalNotificationInboxQuery } from 'src/redux/communication/notification-self-api';

import { NotificationInboxRow } from './notification-inbox-item';

const pageSize = 10;

export function NotificationInbox({ owner, unreadOnly, onOpen }: {
  owner: string;
  unreadOnly: boolean;
  onOpen: () => void;
}) {
  const [page, setPage] = useState(0);
  const query = usePersonalNotificationInboxQuery({
    owner, unreadOnly, skipCount: page * pageSize, maxResultCount: pageSize,
  }, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
    pollingInterval: 30000,
    skipPollingIfUnfocused: true,
  });
  const result = query.currentData;
  const showPages = Boolean(page || (result && result.totalCount > pageSize));
  return (
    <>
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        {query.isError ? (
          <Alert severity="error" sx={{ m: 2 }} action={<Button size="small" onClick={query.refetch}>Retry</Button>}>
            Your notifications could not be loaded.
          </Alert>
        ) : !result && query.isFetching ? (
          <Stack gap={1} sx={{ p: 2 }} role="status" aria-label="Loading notifications">
            <Skeleton variant="rounded" height={72} />
            <Skeleton variant="rounded" height={72} />
          </Stack>
        ) : result?.items.length ? (
          <List disablePadding aria-label={unreadOnly ? 'Unread notifications' : 'All notifications'}>
            {result.items.map((item) => <NotificationInboxRow key={item.id} item={item} owner={owner} onOpen={onOpen} />)}
          </List>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {page ? 'There are no notifications on this page.' : unreadOnly ? 'You have no unread notifications.' : 'You have no notifications yet.'}
            </Typography>
          </Box>
        )}
      </Scrollbar>
      {showPages && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}
          sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <Button size="small" disabled={!page || query.isFetching} onClick={() => setPage(page - 1)}>Previous</Button>
          <Typography variant="caption">Page {page + 1}</Typography>
          <Button size="small" disabled={!result || (page + 1) * pageSize >= result.totalCount || query.isFetching}
            onClick={() => setPage(page + 1)}>Next</Button>
        </Stack>
      )}
    </>
  );
}

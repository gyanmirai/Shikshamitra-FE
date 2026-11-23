import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { Alert, Stack, Button, Skeleton, Typography, LinearProgress } from '@mui/material';
import { usePersonalNotificationInboxQuery } from 'src/redux/communication/notification-self-api';

import { NotificationInboxList } from './notification-inbox-list';

const pageSize = 10;
const inboxInsets = { xs: 2, sm: 3 };

export function NotificationInbox({
  owner,
  unreadOnly,
  onOpen,
}: {
  owner: string;
  unreadOnly: boolean;
  onOpen: () => void;
}) {
  const [page, setPage] = useState(0);
  const [accessDeniedAt, setAccessDeniedAt] = useState(0);
  const query = usePersonalNotificationInboxQuery(
    {
      owner,
      unreadOnly,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
    },
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
      pollingInterval: 30000,
      skipPollingIfUnfocused: true,
    }
  );
  const { error } = query;
  let status;
  if (error && 'status' in error) {
    status = error.status === 'PARSING_ERROR' ? error.originalStatus : error.status;
  }
  const accessLost = status === 401 || status === 403 || status === 'CUSTOM_ERROR';
  useEffect(() => {
    if (accessLost) setAccessDeniedAt(Date.now());
  }, [accessLost]);
  const canShowResult = !accessLost && (query.fulfilledTimeStamp ?? 0) >= accessDeniedAt;
  const result = canShowResult ? query.currentData : undefined;
  const showError = query.isError && !query.isFetching;
  const showPages = Boolean(page || (result && result.totalCount > pageSize));
  const emptyTitle = page
    ? 'There are no notifications on this page.'
    : unreadOnly
      ? 'You have no unread notifications.'
      : 'You have no notifications yet.';

  return (
    <>
      <Scrollbar fillContent sx={{ flex: 1, minHeight: 0 }} aria-busy={query.isFetching}>
        {result && query.isFetching && <LinearProgress aria-label="Refreshing notifications" />}
        {showError && (
          <Alert
            severity="error"
            variant="outlined"
            sx={{ mx: inboxInsets, my: 2 }}
            action={
              <Button
                size="small"
                color="inherit"
                startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
                onClick={query.refetch}
              >
                Retry
              </Button>
            }
          >
            {result
              ? 'Your notifications could not be refreshed.'
              : 'Your notifications could not be loaded.'}
          </Alert>
        )}
        {!result && !showError && (
          <Stack
            gap={2}
            sx={{ px: inboxInsets, py: 2 }}
            role="status"
            aria-label="Loading notifications"
          >
            {[1, 2].map((row) => (
              <Stack key={row} gap={1}>
                <Skeleton variant="text" width="55%" />
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" width="85%" />
                <Skeleton variant="rounded" width="45%" height={30} />
              </Stack>
            ))}
          </Stack>
        )}
        {!!result?.items.length && (
          <NotificationInboxList
            items={result.items}
            owner={owner}
            unreadOnly={unreadOnly}
            onOpen={onOpen}
          />
        )}
        {result && !result.items.length && !showError && (
          <EmptyContent title={emptyTitle} sx={{ py: 3 }} slotProps={{ img: { maxWidth: 120 } }} />
        )}
      </Scrollbar>
      {showPages && (
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
          sx={{
            px: inboxInsets,
            py: 1.75,
            flexShrink: 0,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Button
            size="small"
            disabled={!page || query.isFetching}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Typography variant="caption">Page {page + 1}</Typography>
          <Button
            size="small"
            disabled={!result || (page + 1) * pageSize >= result.totalCount || query.isFetching}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </Stack>
      )}
    </>
  );
}

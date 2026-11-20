import { useState } from 'react';
import { useGetLibraryInboxQuery } from 'src/redux/library/inbox-api';
import { Box, Stack, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

import { useInboxLocation } from './useInboxLocation';
import { LibraryInboxTable } from './LibraryInboxTable';
import { LibraryInboxDetail } from './LibraryInboxDetail';
import { notificationZone } from '../notification-display';

export function LibraryInboxContent({ viewer }: { viewer: string }) {
  const location = useInboxLocation();
  const query = useGetLibraryInboxQuery(
    { viewer, page: location.page, pageSize: location.pageSize, unreadOnly: location.unreadOnly },
    { refetchOnMountOrArgChange: true, refetchOnFocus: true }
  );
  const [selected, setSelected] = useState<string | null>(null);
  const data = query.currentData;
  const item = data?.items.find((message) => message.id === selected);
  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ sm: 'center' }}
        sx={{ px: 1, py: 1 }}
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          aria-label="Inbox view"
          value={location.unreadOnly ? 'unread' : 'all'}
          onChange={(_, value) => {
            if (value) location.update({ unreadOnly: value === 'unread', page: 1 });
          }}
        >
          <ToggleButton value="all">All messages</ToggleButton>
          <ToggleButton value="unread">Unread</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="body2" aria-label="Unread messages">
          Unread messages: {data ? data.unreadCount : 'Loading'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Times shown in {notificationZone()}
        </Typography>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <LibraryInboxTable
          items={data?.items || []}
          page={data ? location.page : 1}
          pageSize={location.pageSize}
          totalCount={data?.totalCount || 0}
          loading={!data && query.isFetching}
          refreshing={Boolean(data && query.isFetching)}
          error={query.error}
          onRetry={() => query.refetch()}
          onPage={(page, pageSize) => location.update({ page, pageSize })}
          onOpen={setSelected}
        />
      </Box>
      {item && (
        <LibraryInboxDetail
          key={item.id}
          item={item}
          viewer={viewer}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

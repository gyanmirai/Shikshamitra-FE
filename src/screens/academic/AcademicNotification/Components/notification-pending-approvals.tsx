import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';

import { useState } from 'react';
import { fDateTime } from 'src/utils/format-time';
import { RouterLink } from 'src/routes/components';
import { Stack, Button, Typography } from '@mui/material';
import { academicPaths } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import { notificationEventKeyLabel } from 'src/redux/academic-notifications/response-adapters';
import { useAcademicNotificationPendingApprovalsQuery } from 'src/redux/academic-notifications/delivery-api';

const columns: IColumn[] = [
  { id: 'notification', label: 'Notification', minWidth: 160, rowHeader: true, isSort: false, isFilter: false, render: (value) => value },
  { id: 'requested', label: 'Requested', minWidth: 140, isSort: false, isFilter: false },
  { id: 'recipients', label: 'Eligible recipients', minWidth: 100, isSort: false, isFilter: false, cellSx: { textAlign: 'right' } },
];

export function NotificationPendingApprovals({ identity }: { identity: AcademicNotificationCacheIdentity }) {
  const [cursors, setCursors] = useState<string[]>([]);
  const afterId = cursors.at(-1);
  const requests = useAcademicNotificationPendingApprovalsQuery({ ...identity, afterId },
    { refetchOnFocus: true, refetchOnMountOrArgChange: true });
  const current = requests.isError ? undefined : requests.currentData;
  const next = current?.nextAfterId;

  return (
    <Stack gap={1} sx={{ p: 1, flex: 1, minHeight: 0 }}>
      <Typography variant="subtitle2" component="h2">Pending Approvals</Typography>
      <CustomizableTable tableId="academic-notification-pending-approvals" tableTitle="Pending Academic notification approvals"
        columns={columns} data={(current?.items ?? []).map((item) => ({
          id: item.operationId,
          notification: (
            <Button size="small" component={RouterLink}
              href={`${academicPaths.notification}?view=history&operation=${encodeURIComponent(item.operationId)}`}>
              {notificationEventKeyLabel(item.eventKey)}
            </Button>
          ),
          requested: fDateTime(item.createdAt) ?? '—',
          recipients: item.eligibleRecipientCount,
        }))}
        isPagination={false} isSearch={false} showColumns showFullScreen showExport={false}
        isLoading={!current && requests.isFetching} isRefreshing={Boolean(current) && requests.isFetching}
        error={requests.error} onRetry={requests.refetch}
        noDataText={afterId ? 'There are no more pending approvals.' : 'No pending approvals are assigned to you.'}
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }} tableContainerProps={{ sx: { height: 1, minHeight: 0 } }} />
      {(afterId || next) && (
        <Stack direction="row" gap={1} justifyContent="flex-end">
          <Button size="small" disabled={!afterId || requests.isFetching}
            onClick={() => setCursors((previous) => previous.slice(0, -1))}>Previous</Button>
          <Button size="small" disabled={!next || requests.isFetching}
            onClick={() => { if (next) setCursors((previous) => [...previous, next]); }}>Next</Button>
        </Stack>
      )}
    </Stack>
  );
}

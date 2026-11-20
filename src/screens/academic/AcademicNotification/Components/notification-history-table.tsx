import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AcademicNotificationHistoryItem } from 'src/redux/academic-notifications/delivery-types';

import { Button } from '@mui/material';
import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import CustomizableTable from 'src/components/customizabaleTable';
import { AcademicDispatchStatus } from 'src/redux/academic-notifications/delivery-types';
import { deliveryReason, dispatchStatusLabels } from 'src/redux/academic-notifications/delivery-adapters';
import { notificationLabel, notificationChannelLabels } from 'src/redux/academic-notifications/response-adapters';

const columns: IColumn[] = [
  { id: 'recorded', label: 'Recorded', minWidth: 180, rowHeader: true },
  { id: 'recipient', label: 'Recipient type', minWidth: 130 },
  { id: 'channelName', label: 'Channel', minWidth: 110 },
  { id: 'status', label: 'Delivery status', minWidth: 150, render: (value: AcademicDispatchStatus) => (
    <Label color={value === AcademicDispatchStatus.UnknownAcceptance ? 'warning' : 'default'}>
      {dispatchStatusLabels[value] ?? 'Status unavailable'}
    </Label>
  ) },
  { id: 'attempt', label: 'Attempt', minWidth: 90 },
  { id: 'reason', label: 'Details', minWidth: 180 },
  { id: 'accepted', label: 'Accepted at', minWidth: 180, defaultHidden: true },
  { id: 'delivered', label: 'Delivered at', minWidth: 180, defaultHidden: true },
  { id: 'read', label: 'Read at', minWidth: 180, defaultHidden: true },
].map((column) => ({ ...column, isSort: false }));
const columnsWithActions: IColumn[] = [...columns, {
  id: 'actions', label: 'Actions', minWidth: 125, isSort: false, sticky: true, stickyPosition: 'right',
  stickyOnMobile: true, render: (value) => value,
}];

export function NotificationHistoryTable({
  items, total, page, pageSize, loading, refreshing, error, filtered, onRetry, onPage, onDeliveryRetry, retryBusy,
}: {
  items: AcademicNotificationHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  refreshing: boolean;
  error: unknown;
  filtered: boolean;
  onRetry: () => void;
  onPage: (page: number, pageSize: number) => void;
  onDeliveryRetry?: (item: AcademicNotificationHistoryItem) => void;
  retryBusy?: boolean;
}) {
  return (
    <CustomizableTable tableId="academic-notification-history" tableTitle="Academic notification delivery history"
      columns={onDeliveryRetry ? columnsWithActions : columns} data={items.map((item) => ({
        id: [item.operationId, item.attemptId, item.dispatchId, item.recipientSnapshotId].join('/'),
        recorded: fDateTime(item.recordedAt) ?? '—',
        recipient: item.recipientKind ? notificationLabel(item.recipientKind) : '—',
        channelName: item.channel === null ? '—' : notificationChannelLabels[item.channel] ?? '—',
        status: item.status,
        attempt: item.attemptNumber ?? '—',
        reason: deliveryReason(item.reasonCode),
        accepted: fDateTime(item.acceptedAt) ?? '—',
        delivered: fDateTime(item.deliveredAt) ?? '—',
        read: fDateTime(item.readAt) ?? '—',
        actions: onDeliveryRetry && item.canRequestRetry && item.dispatchId && item.attemptId && item.channel !== null ? (
          <Button size="small" disabled={retryBusy} onClick={() => onDeliveryRetry(item)}
            aria-label={`Retry ${notificationChannelLabels[item.channel]}`}>Retry delivery</Button>
        ) : null,
      }))}
      isFilter={false} isSearch={false} showExport={false}
      isLoading={loading} isRefreshing={refreshing} error={error} onRetry={onRetry}
      noDataText={filtered ? 'No deliveries match this status.' : 'No delivery attempts or exclusions have been recorded.'}
      serverSidePagination maxServerRowsPerPage={100} paginationDisabled={loading}
      totalCount={total} page={page} rowsPerPage={pageSize} onServerPagination={onPage}
      wrapperProps={{ sx: { height: 1, minHeight: 0 } }} tableContainerProps={{ sx: { height: 1, minHeight: 0 } }} />
  );
}

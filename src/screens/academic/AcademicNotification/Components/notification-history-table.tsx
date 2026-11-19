import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AcademicNotificationHistoryItem } from 'src/redux/academic-notifications/delivery-types';

import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import CustomizableTable from 'src/components/customizabaleTable';
import { AcademicDispatchStatus } from 'src/redux/academic-notifications/delivery-types';
import { notificationLabel, notificationChannelLabels } from 'src/redux/academic-notifications/response-adapters';

import { deliveryReason, dispatchStatusLabels } from '../notification-delivery-labels';

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

export function NotificationHistoryTable({
  items, total, page, pageSize, loading, refreshing, error, filtered, onRetry, onPage,
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
}) {
  return (
    <CustomizableTable tableId="academic-notification-history" tableTitle="Academic notification delivery history"
      columns={columns} data={items.map((item) => ({
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
      }))}
      isFilter={false} isSearch={false} showExport={false}
      isLoading={loading} isRefreshing={refreshing} error={error} onRetry={onRetry}
      noDataText={filtered ? 'No deliveries match this status.' : 'No delivery attempts or exclusions have been recorded.'}
      serverSidePagination maxServerRowsPerPage={100} paginationDisabled={loading}
      totalCount={total} page={page} rowsPerPage={pageSize} onServerPagination={onPage}
      wrapperProps={{ sx: { height: 1, minHeight: 0 } }} tableContainerProps={{ sx: { height: 1, minHeight: 0 } }} />
  );
}

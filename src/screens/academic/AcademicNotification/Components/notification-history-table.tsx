import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { AcademicNotificationHistoryItem } from 'src/redux/academic-notifications/delivery-types';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { fDateTime } from 'src/utils/format-time';
import CustomizableTable from 'src/components/customizabaleTable';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { AcademicDispatchStatus } from 'src/redux/academic-notifications/delivery-types';
import { deliveryReason, dispatchStatusLabels } from 'src/redux/academic-notifications/delivery-adapters';
import { notificationLabel, notificationChannelLabels } from 'src/redux/academic-notifications/response-adapters';

const statusOptions = Object.entries(dispatchStatusLabels).map(([value, label]) => ({ value: Number(value), label }));

const columns: IColumn[] = [
  { id: 'recorded', label: 'Recorded', minWidth: 180, rowHeader: true, isFilter: false },
  { id: 'recipient', label: 'Recipient type', minWidth: 130, isFilter: false },
  { id: 'channelName', label: 'Channel', minWidth: 110, isFilter: false },
  { id: 'attempt', label: 'Attempt', minWidth: 90, isFilter: false },
  { id: 'reason', label: 'Details', minWidth: 180, isFilter: false },
  { id: 'accepted', label: 'Accepted at', minWidth: 180, defaultHidden: true, isFilter: false },
  { id: 'delivered', label: 'Delivered at', minWidth: 180, defaultHidden: true, isFilter: false },
  { id: 'read', label: 'Read at', minWidth: 180, defaultHidden: true, isFilter: false },
  {
    id: 'status', label: 'Delivery status', minWidth: 150, sticky: true, stickyPosition: 'right' as const,
    isFilter: true, filterType: 'enum' as const, enumOptions: statusOptions,
    render: (value: AcademicDispatchStatus) => (
      <Label color={value === AcademicDispatchStatus.UnknownAcceptance ? 'warning' : 'default'}>
        {dispatchStatusLabels[value] ?? 'Status unavailable'}
      </Label>
    ),
  },
].map((column) => ({ ...column, isSort: false }));
const columnsWithActions: IColumn[] = [...columns, {
  id: 'actions', label: 'Actions', width: 92, isSort: false, isFilter: false, excludeFromExport: true,
  sticky: true, stickyPosition: 'right', stickyOnMobile: true, render: (value) => value,
}];

export function NotificationHistoryTable({
  items, total, page, pageSize, loading, refreshing, error, status, onStatusChange, onRetry, onPage, onDeliveryRetry, retryBusy,
}: {
  items: AcademicNotificationHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  refreshing: boolean;
  error: unknown;
  status: string;
  onStatusChange: (value: string) => void;
  onRetry: () => void;
  onPage: (page: number, pageSize: number) => void;
  onDeliveryRetry?: (item: AcademicNotificationHistoryItem) => void;
  retryBusy?: boolean;
}) {
  const selectedStatus = statusOptions.find(({ value }) => String(value) === status);
  const filters: IParams['filters'] = selectedStatus ? [{
    column: 'status', type: 'equals', value: selectedStatus.value, valueType: 'enum',
    label: 'Delivery status', displayValue: selectedStatus.label,
  }] : [];

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
          <AdaptiveThreeDotsActions
            directActionLimit={2}
            sx={{ justifyContent: 'flex-end' }}
            actions={[{
              id: 'retry', label: `Retry ${notificationChannelLabels[item.channel]} delivery for ${notificationLabel(item.recipientKind ?? 'recipient')}`,
              icon: GlobalIcons.refresh, disabled: retryBusy, onClick: () => onDeliveryRetry(item),
            }]}
          />
        ) : null,
      }))}
      isSearch={false} showColumns showFullScreen showExport={false}
      isLoading={loading} isRefreshing={refreshing} error={error} onRetry={onRetry}
      noDataText="No delivery attempts or exclusions have been recorded."
      filters={filters}
      onServerFilter={(criteria) => onStatusChange(String(criteria.at(-1)?.value ?? 'all'))}
      serverSidePagination maxServerRowsPerPage={100} paginationDisabled={loading}
      totalCount={total} page={page} rowsPerPage={pageSize} onServerPagination={onPage}
      wrapperProps={{ sx: { height: 1, minHeight: 0 } }} tableContainerProps={{ sx: { height: 1, minHeight: 0 } }} />
  );
}

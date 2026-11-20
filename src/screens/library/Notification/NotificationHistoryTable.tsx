import type {
  LibraryNotificationHistory,
  LibraryNotificationSettings,
} from 'src/redux/library/library-adapters';

import CustomizableTable from 'src/components/customizabaleTable';

import { notificationHistoryColumns } from './notification-history-columns';
import { historyFilterValues, historyColumnFilters } from './notification-history-filters';

import type { DeliveryActions } from './NotificationDeliveryActions';
import type { HistoryCriteria } from './notification-history-filters';

export function NotificationHistoryTable({
  items,
  page,
  pageSize,
  totalCount,
  loading,
  refreshing,
  error,
  settings,
  criteria,
  onCriteria,
  onPage,
  onRetry,
  ...actions
}: DeliveryActions & {
  items: LibraryNotificationHistory[];
  page: number;
  pageSize: number;
  totalCount: number;
  loading: boolean;
  refreshing: boolean;
  error?: unknown;
  settings?: LibraryNotificationSettings;
  criteria: HistoryCriteria;
  onCriteria: (values: HistoryCriteria) => void;
  onPage: (page: number, size: number) => void;
  onRetry: () => void;
}) {
  return (
    <CustomizableTable
      tableId="library-notification-history"
      data={items}
      columns={notificationHistoryColumns(settings, actions)}
      serverSidePagination
      serverSideFilter
      page={page - 1}
      rowsPerPage={pageSize}
      totalCount={totalCount}
      maxServerRowsPerPage={100}
      onServerPagination={onPage}
      filters={historyColumnFilters(criteria)}
      onServerFilter={(filters) => onCriteria(historyFilterValues(filters))}
      isLoading={loading}
      isRefreshing={refreshing}
      error={error}
      onRetry={onRetry}
      isSearch={false}
      isFilter
      showExport={false}
      noDataText="No deliveries match these filters."
      wrapperProps={{ sx: { height: 1 } }}
      tableContainerProps={{ sx: { height: 1 } }}
      getRowAction={(row) => ({
        label: `View delivery ${row.subject}`,
        onClick: () => actions.onOpen(row as LibraryNotificationHistory),
      })}
    />
  );
}

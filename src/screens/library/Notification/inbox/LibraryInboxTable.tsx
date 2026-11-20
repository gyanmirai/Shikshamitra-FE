import type { IColumn } from 'src/components/customizabaleTable/types';
import type { LibraryInboxItem } from 'src/redux/library/notification-types';

import { Label } from 'src/components/label';
import { fDateTime } from 'src/utils/format-time';
import CustomizableTable from 'src/components/customizabaleTable';

export function LibraryInboxTable({
  items,
  page,
  pageSize,
  totalCount,
  loading,
  refreshing,
  error,
  onRetry,
  onPage,
  onOpen,
}: {
  items: LibraryInboxItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  loading: boolean;
  refreshing: boolean;
  error?: unknown;
  onRetry: () => void;
  onPage: (page: number, size: number) => void;
  onOpen: (id: string) => void;
}) {
  const columns: IColumn[] = [
    { id: 'subject', label: 'Subject', rowHeader: true },
    { id: 'memberName', label: 'For', render: (value) => value || 'Your school account' },
    { id: 'sentAt', label: 'Sent', render: (value) => fDateTime(value) },
    {
      id: 'readAt',
      label: 'Read status',
      render: (value) => (
        <Label color={value ? 'default' : 'info'}>{value ? 'Read' : 'Unread'}</Label>
      ),
    },
  ];
  return (
    <CustomizableTable
      tableId="personal-library-inbox"
      data={items}
      columns={columns.map((column) => ({ ...column, isSort: false, isFilter: false }))}
      serverSidePagination
      page={page - 1}
      rowsPerPage={pageSize}
      totalCount={totalCount}
      onServerPagination={onPage}
      isLoading={loading}
      isRefreshing={refreshing}
      error={error}
      onRetry={onRetry}
      isSearch={false}
      isFilter={false}
      showExport={false}
      noDataText="No Library messages in this view."
      wrapperProps={{ sx: { height: 1 } }}
      tableContainerProps={{ sx: { height: 1 } }}
      getRowAction={(row) => ({ label: `Read ${row.subject}`, onClick: () => onOpen(row.id) })}
    />
  );
}

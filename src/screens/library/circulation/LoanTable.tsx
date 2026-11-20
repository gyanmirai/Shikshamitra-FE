import type { IColumn } from 'src/components/customizabaleTable/types';

import CustomizableTable from 'src/components/customizabaleTable';

import { LoanActions } from './LoanActions';
import { LoanStatusCell } from './LoanStatusCell';
import { loanReadColumns } from './loan-read-columns';

import type { LibraryLoanRow } from './loan-types';

export function LoanTable({
  id,
  rows,
  page,
  pageSize,
  totalCount,
  loading,
  refreshing,
  error,
  onRetry,
  onPage,
  onReturn,
  onRenew,
  onReviewDates,
  emptyMessage,
  title = 'Borrowing Records',
}: {
  id: string;
  rows: LibraryLoanRow[];
  page: number;
  pageSize: number;
  totalCount: number;
  loading: boolean;
  refreshing: boolean;
  error?: unknown;
  onRetry: () => void;
  onPage: (page: number, pageSize: number) => void;
  onReturn?: (row: LibraryLoanRow) => void;
  onRenew?: (row: LibraryLoanRow) => void;
  onReviewDates?: (row: LibraryLoanRow) => void;
  emptyMessage: string;
  title?: string;
}) {
  const columns: IColumn[] = [
    ...loanReadColumns(),
    {
      id: 'storedStatus',
      label: 'Status',
      sticky: true,
      stickyPosition: 'right',
      render: (_, row) => <LoanStatusCell row={row as LibraryLoanRow} />,
    },
  ];
  if (onReturn || onRenew || onReviewDates)
    columns.push({
      id: 'actions',
      label: 'Actions',
      sticky: true,
      stickyPosition: 'right',
      excludeFromExport: true,
      render: (_, row) => (
        <LoanActions
          row={row as LibraryLoanRow}
          onReturn={onReturn}
          onRenew={onRenew}
          onReviewDates={onReviewDates}
        />
      ),
    });
  // The read contract supports year/as-of filters; column operators cannot filter the full result set.
  const supportedColumns = columns.map((column) => ({
    ...column,
    align: 'left' as const,
    isSort: false,
    isFilter: false,
  }));
  return (
    <CustomizableTable
      tableId={id}
      tableTitle={title}
      columns={supportedColumns}
      data={rows}
      wrapperProps={{ sx: { height: 1 } }}
      tableContainerProps={{ sx: { height: 1 } }}
      page={page - 1}
      rowsPerPage={pageSize}
      totalCount={totalCount}
      serverSidePagination
      onServerPagination={onPage}
      isLoading={loading}
      isRefreshing={refreshing}
      error={error}
      onRetry={onRetry}
      noDataText={emptyMessage}
      isSearch={false}
      isFilter
      showExport={false}
    />
  );
}

import type { HrReportField } from 'src/redux/hr/hrReportsApi';
import type { TableExportRequest } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';

import { reportFieldColumn } from '../report-table-query';
import { displayReportValue } from '../reporting-workspace-utils';
import { useReportTableState } from '../hooks/useReportTableState';

export function ReportResultTable({
  columns,
  tableState: controlledTableState,
  rows,
  count,
  loading,
  timezone,
  page = 1,
  pageSize = 50,
  onPage,
  onExport,
  exportDisabled,
  empty = 'No records match this report.',
}: {
  columns: HrReportField[];
  tableState?: ReturnType<typeof useReportTableState>;
  rows: Record<string, unknown>[];
  count: number;
  loading?: boolean;
  timezone?: string;
  page?: number;
  pageSize?: number;
  onPage?: (page: number, pageSize: number) => void;
  onExport?: (request: TableExportRequest) => Promise<void>;
  exportDisabled?: boolean;
  empty?: string;
}) {
  const localTableState = useReportTableState(onPage ? '' : 'preview-');
  const tableState = controlledTableState ?? localTableState;
  const tableColumns = useMemo(
    () =>
      columns.map((f, index) => ({
        id: f.id,
        label: f.label,
        minWidth: '150px',
        sticky: index === 0,
        align: f.type === 'number' || f.type === 'money' ? ('right' as const) : ('left' as const),
        stickyOnMobile: false,
        ...reportFieldColumn(f),
        render: (value: unknown) => displayReportValue(value, f.type, timezone),
      })),
    [columns, timezone]
  );
  const data = useMemo(
    () => rows.map((row, index) => ({ ...row, id: `${page}-${index}` })),
    [rows, page]
  );
  return (
    <CustomizableTable
      showColumns
      showExport
      showFullScreen
      exportScope="all"
      tableId="hr-generated-report"
      tableTitle={onPage ? 'Report result' : 'Report preview sample'}
      onExport={onExport}
      exportDisabled={exportDisabled}
      columns={tableColumns}
      data={data}
      isLoading={loading}
      totalCount={onPage ? count : rows.length}
      {...tableState}
      serverSideSearch={!!onPage}
      serverSideSort={!!onPage}
      serverSideFilter={!!onPage}
      searchFieldProps={{
        placeholder: onPage ? 'Search report rows' : 'Search preview sample',
        inputProps: { 'aria-label': onPage ? 'Search report rows' : 'Search preview sample' },
      }}
      serverSidePagination={!!onPage}
      isPagination={!!onPage}
      page={page - 1}
      rowsPerPage={pageSize}
      rowsPerPageOptions={[10, 25, 50, 100]}
      maxServerRowsPerPage={200}
      onServerPagination={onPage}
      noDataText={empty}
      wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
      tableContainerProps={{ sx: { height: 1, overflowX: 'auto' } }}
    />
  );
}

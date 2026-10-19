import type { HrReportField } from 'src/redux/hr/hrReportsApi';
import type { TableExportRequest } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';

import { displayReportValue } from '../reporting-workspace-utils';

export function ReportResultTable({
  columns,
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
  const tableColumns = useMemo(
    () =>
      columns.map((f, index) => ({
        id: f.id,
        label: f.label,
        minWidth: '150px',
        sticky: index === 0,
        align: f.type === 'number' || f.type === 'money' ? ('right' as const) : ('left' as const),
        isSort: false,
        isFilter: false,
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
      tableTitle="Report result"
      onExport={onExport}
      exportDisabled={exportDisabled}
      columns={tableColumns}
      data={data}
      isLoading={loading}
      totalCount={count}
      isSearch={false}
      isFilter={false}
      serverSidePagination={!!onPage}
      isPagination={!!onPage}
      page={page - 1}
      rowsPerPage={pageSize}
      maxServerRowsPerPage={200}
      onServerPagination={onPage}
      noDataText={empty}
      wrapperProps={{ sx: { height: 1, minHeight: 0 } }}
      tableContainerProps={{ sx: { height: 1, overflowX: 'auto' } }}
    />
  );
}

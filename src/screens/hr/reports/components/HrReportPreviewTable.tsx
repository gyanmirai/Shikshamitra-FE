import type { ReactNode } from 'react';
import type { HrReportSort, HrReportPreview } from 'src/redux/hr/hrReportsApi';
import type { TableExportRequest } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

type HrReportPreviewTableProps = {
  preview?: HrReportPreview;
  reportName: string;
  sourceLabel?: string;
  isLoading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  sortableFields?: string[];
  sorts?: HrReportSort[];
  onSortChange?: (sorts: HrReportSort[]) => void;
  emptyMessage?: string;
  headerAction?: ReactNode;
  onExport?: (request: TableExportRequest) => Promise<void>;
};

export function HrReportPreviewTable({
  preview,
  reportName,
  sourceLabel,
  isLoading,
  onPageChange,
  sortableFields,
  sorts,
  onSortChange,
  emptyMessage,
  headerAction,
  onExport,
}: HrReportPreviewTableProps) {
  const previewColumns = useMemo(
    () =>
      (preview?.columns ?? []).map((column) => ({
        id: column.id,
        label: column.label,
        isSort: sortableFields ? sortableFields.includes(column.id) : undefined,
        minWidth: '12vw',
        align: 'left' as const,
        filterType: 'string' as const,
        render: (value: unknown) =>
          value == null
            ? preview?.dataSource.startsWith('payroll_')
              ? 'Unavailable'
              : '-'
            : String(value),
      })),
    [preview?.columns, preview?.dataSource, sortableFields]
  );

  const previewRows = useMemo(
    () =>
      (preview?.rows ?? []).map((row, index) => {
        const values = { ...row };
        if (preview?.dataSource.startsWith('payroll_'))
          preview.columns.forEach(({ id }) => {
            if (values[id] == null) values[id] = 'Unavailable';
          });
        return { id: `${preview?.page ?? 1}-${index}`, ...values };
      }),
    [preview?.page, preview?.rows, preview?.columns, preview?.dataSource]
  );

  return (
    <Box sx={{ flex: 1, minHeight: 320, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        useFlexGap
        flexWrap="wrap"
        spacing={1}
        sx={{ mb: 1 }}
      >
        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
          <Typography variant="subtitle1">Preview</Typography>
          {headerAction}
        </Stack>
        {preview ? (
          <Typography variant="body2" color="text.secondary">
            {preview.totalCount} rows - {sourceLabel ?? preview.dataSource}
          </Typography>
        ) : null}
      </Stack>
      <CustomizableTable
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        tableId="hr-report-preview"
        onExport={onExport}
        tableTitle={`${reportName} Preview`}
        columns={previewColumns}
        data={previewRows}
        isLoading={isLoading}
        totalCount={preview?.totalCount ?? 0}
        serverSidePagination
        serverSideFilter
        serverSideSort
        serverSideSortMode={onSortChange ? 'single' : 'multiple'}
        sorts={sorts?.map(({ field, direction }) => ({
          column: field,
          direction: direction === 'desc' ? 'desc' : 'asc',
        }))}
        onServerSort={
          onSortChange
            ? (_, selected) =>
                onSortChange(
                  selected.map(({ column, direction }) => ({ field: column, direction }))
                )
            : undefined
        }
        isSearch={false}
        isFilter={false}
        maxServerRowsPerPage={200}
        noDataText={emptyMessage ?? 'Build a report and generate a preview.'}
        onServerPagination={onPageChange}
        page={preview ? Math.max(0, preview.page - 1) : undefined}
        rowsPerPage={preview?.pageSize}
        wrapperProps={{ sx: { minHeight: 0 } }}
        tableContainerProps={{ sx: { overflowX: 'auto' } }}
      />
    </Box>
  );
}

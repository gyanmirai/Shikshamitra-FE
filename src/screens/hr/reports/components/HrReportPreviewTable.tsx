import type { HrReportSort, HrReportPreview } from 'src/redux/hr/hrReportsApi';

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
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="subtitle1">Preview</Typography>
        {preview ? (
          <Typography variant="body2" color="text.secondary">
            {preview.totalCount} rows - {sourceLabel ?? preview.dataSource}
          </Typography>
        ) : null}
      </Stack>
      <CustomizableTable
        tableId="hr-report-preview"
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

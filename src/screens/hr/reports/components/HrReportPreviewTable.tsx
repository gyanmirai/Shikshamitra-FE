import type { ReactNode } from 'react';
import type { HrReportSort, HrReportPreview } from 'src/redux/hr/hrReportsApi';
import type {
  TableExportRequest,
  ICustomizableTableProps,
} from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
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
  operationalProps?: Partial<ICustomizableTableProps>;
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
  operationalProps,
}: HrReportPreviewTableProps) {
  const columnTypes = operationalProps?.serverColumnTypes;
  const previewColumns = useMemo(
    () =>
      (preview?.columns ?? []).map((column) => {
        const statement = preview?.dataSource === 'payroll_statement';
        const money = statement && columnTypes?.[column.id] === 'money';
        return {
          id: column.id,
          label: column.label,
          isSort: sortableFields ? sortableFields.includes(column.id) : undefined,
          minWidth: statement ? (column.id === 'employeeName' ? 180 : 115) : '12vw',
          align: money ? ('right' as const) : ('left' as const),
          filterType: 'string' as const,
          render: (value: unknown) =>
            value == null
              ? preview?.dataSource.startsWith('payroll_')
                ? 'Unavailable'
                : '-'
              : statement &&
                  column.id === 'month' &&
                  typeof value === 'string' &&
                  /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
                ? dayjs(`${value}-01`).format('MMM YYYY')
                : money && value !== '' && Number.isFinite(Number(value))
                  ? formatNumber(String(value), 'INR', { fractionDigits: 2 })
                  : String(value),
        };
      }),
    [preview?.columns, preview?.dataSource, sortableFields, columnTypes]
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

  const { headerContent, ...tableOptions } = operationalProps ?? {};
  const previewHeader = (!headerContent || headerAction || preview) && (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      useFlexGap
      flexWrap="wrap"
      spacing={1}
      sx={headerContent ? { px: 2, pb: 1 } : { mb: 1 }}
    >
      <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
        {!headerContent && <Typography variant="subtitle1">Preview</Typography>}
        {headerAction}
      </Stack>
      {preview ? (
        <Typography variant="body2" color="text.secondary">
          {preview.totalCount} rows - {sourceLabel ?? preview.dataSource}
        </Typography>
      ) : null}
    </Stack>
  );

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: headerContent ? 0 : 320,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {!headerContent && previewHeader}
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
        headerContent={
          headerContent && (
            <Box sx={{ flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ p: 2 }}>{headerContent}</Box>
              {previewHeader}
            </Box>
          )
        }
        wrapperProps={{ sx: { minHeight: 0 } }}
        tableContainerProps={{ sx: { overflowX: 'auto' } }}
        {...tableOptions}
      />
    </Box>
  );
}

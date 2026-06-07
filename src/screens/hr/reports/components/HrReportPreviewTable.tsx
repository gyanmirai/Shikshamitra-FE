import type { HrReportPreview } from 'src/redux/hr/hrReportsApi';

import { useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

type HrReportPreviewTableProps = {
  preview?: HrReportPreview;
  reportName: string;
  sourceLabel?: string;
  isLoading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
};

export function HrReportPreviewTable({
  preview,
  reportName,
  sourceLabel,
  isLoading,
  onPageChange,
}: HrReportPreviewTableProps) {
  const previewColumns = useMemo(
    () =>
      (preview?.columns ?? []).map((column) => ({
        id: column.id,
        label: column.label,
        minWidth: '12vw',
        align: 'left' as const,
        filterType: 'string' as const,
      })),
    [preview?.columns]
  );

  const previewRows = useMemo(
    () =>
      (preview?.rows ?? []).map((row, index) => ({
        id: `${preview?.page ?? 1}-${index}`,
        ...row,
      })),
    [preview?.page, preview?.rows]
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
        isSearch={false}
        isFilter={false}
        maxServerRowsPerPage={200}
        noDataText="Build a report and generate a preview."
        onServerPagination={onPageChange}
        wrapperProps={{ sx: { minHeight: 0 } }}
        tableContainerProps={{ sx: { overflowX: 'auto' } }}
      />
    </Box>
  );
}

import type { HrReportExportJob } from 'src/redux/hr/hrReportsApi';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Chip, Stack, Tooltip, IconButton, Typography, LinearProgress } from '@mui/material';

import { formatHrReportDateTime, getHrReportExportFileName } from '../hr-report-utils';

type HrReportExportHistoryProps = {
  exportJobs: HrReportExportJob[];
  isFetching: boolean;
  isDownloading: boolean;
  canExport?: boolean;
  onDownload: (jobId: string, fileName?: string) => void;
  onAction?: (action: 'cancel' | 'retry' | 'regenerate', jobId: string) => void;
};

export function HrReportExportHistory({
  exportJobs,
  isFetching,
  isDownloading,
  canExport = true,
  onDownload,
  onAction,
}: HrReportExportHistoryProps) {
  const historyColumns = useMemo<IColumn[]>(
    () => [
      { id: 'reportType', label: 'Report', minWidth: '14vw', align: 'left' as const },
      { id: 'format', label: 'Format', minWidth: '7vw', align: 'left' as const },
      {
        id: 'status',
        label: 'Status',
        minWidth: '12vw',
        align: 'left' as const,
        render: (_value: any, row: any) => (
          <Stack spacing={0.5}>
            <Chip
              size="small"
              label={row.isExpired ? 'Expired' : row.status}
              color={
                row.isExpired
                  ? 'warning'
                  : row.status === 'Completed'
                    ? 'success'
                    : row.status === 'Failed'
                      ? 'error'
                      : row.status === 'Cancelled'
                        ? 'default'
                        : 'info'
              }
              variant="soft"
            />
            {row.status === 'Queued' || row.status === 'Running' ? (
              <LinearProgress
                variant="determinate"
                value={row.progressPercent ?? (row.status === 'Queued' ? 5 : 35)}
                sx={{ height: 4, borderRadius: 1 }}
              />
            ) : null}
          </Stack>
        ),
      },
      {
        id: 'rowCount',
        label: 'Rows',
        minWidth: '7vw',
        align: 'left' as const,
        render: (value: number) => (value ? value.toLocaleString() : '-'),
      },
      {
        id: 'creationTime',
        label: 'Requested',
        minWidth: '13vw',
        align: 'left' as const,
        render: (value: string) => formatHrReportDateTime(value),
      },
      {
        id: 'action',
        label: '',
        minWidth: '7vw',
        align: 'left' as const,
        isFilter: false,
        isSort: false,
        render: (_value: any, row: any) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Download">
              <span>
                <IconButton
                  size="small"
                  disabled={
                    !canExport || row.status !== 'Completed' || row.isExpired || isDownloading
                  }
                  onClick={() => onDownload(row.id, getHrReportExportFileName(row))}
                >
                  <Iconify icon={GlobalIcons.download} />
                </IconButton>
              </span>
            </Tooltip>
            {canExport && (row.status === 'Queued' || row.status === 'Running') ? (
              <Tooltip title="Cancel export">
                <IconButton size="small" onClick={() => onAction?.('cancel', row.id)}>
                  <Iconify icon="solar:close-circle-bold" />
                </IconButton>
              </Tooltip>
            ) : null}
            {canExport && (row.status === 'Failed' || row.status === 'Cancelled') ? (
              <Tooltip title="Retry export">
                <IconButton size="small" onClick={() => onAction?.('retry', row.id)}>
                  <Iconify icon="solar:refresh-bold" />
                </IconButton>
              </Tooltip>
            ) : null}
            {canExport && row.status === 'Completed' && row.isExpired ? (
              <Tooltip title="Regenerate export">
                <IconButton size="small" onClick={() => onAction?.('regenerate', row.id)}>
                  <Iconify icon="solar:restart-bold" />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
        ),
      },
    ],
    [canExport, isDownloading, onAction, onDownload]
  );

  return (
    <Box sx={{ minHeight: 240, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Export History
      </Typography>
      <CustomizableTable
        tableId="hr-report-export-history"
        tableTitle="HR Report Export History"
        columns={historyColumns}
        data={exportJobs}
        isLoading={isFetching}
        isSearch={false}
        noDataText="No export jobs found."
      />
    </Box>
  );
}

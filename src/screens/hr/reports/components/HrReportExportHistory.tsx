import type { HrReportExportJob } from 'src/redux/hr/hrReportsApi';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, IconButton, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { formatHrReportDateTime, getHrReportExportFileName } from '../hr-report-utils';

type HrReportExportHistoryProps = {
  exportJobs: HrReportExportJob[];
  isFetching: boolean;
  isDownloading: boolean;
  onDownload: (jobId: string, fileName?: string) => void;
};

export function HrReportExportHistory({
  exportJobs,
  isFetching,
  isDownloading,
  onDownload,
}: HrReportExportHistoryProps) {
  const historyColumns = useMemo<IColumn[]>(
    () => [
      { id: 'reportType', label: 'Report', minWidth: '14vw', align: 'left' as const },
      { id: 'format', label: 'Format', minWidth: '7vw', align: 'left' as const },
      {
        id: 'status',
        label: 'Status',
        minWidth: '9vw',
        align: 'left' as const,
        render: (_value: any, row: any) => (
          <Chip
            size="small"
            label={row.status}
            color={
              row.status === 'Completed' ? 'success' : row.status === 'Failed' ? 'error' : 'info'
            }
            variant="soft"
          />
        ),
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
          <IconButton
            size="small"
            disabled={row.status !== 'Completed' || isDownloading}
            onClick={() => onDownload(row.id, getHrReportExportFileName(row))}
          >
            <Iconify icon={GlobalIcons.download} />
          </IconButton>
        ),
      },
    ],
    [isDownloading, onDownload]
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

import type { HrReportExportJob } from 'src/redux/hr/hrReportsApi';

import { useMemo } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Stack,
  Drawer,
  Button,
  Divider,
  Tooltip,
  IconButton,
  Typography,
} from '@mui/material';

import {
  formatHrReportDateTime,
  getHrReportFormatLabel,
  getHrReportExportFileName,
} from '../../hr-report-utils';
import {
  countHrReportFilters,
  formatHrReportFileSize,
  formatHrReportRowCount,
  canDownloadHrReportExport,
  getHrReportExportLineageLabel,
  getHrReportExportDisplayStatus,
  isHrReportExportOwnedByCurrentUser,
} from '../../hr-report-center-utils';

import type { HrReportExportAction } from '../../hr-report-types';
import type { HrReportPermissions } from '../../hr-report-permissions';

type HrReportExportDetailsDrawerProps = {
  job: HrReportExportJob | null;
  isDownloading: boolean;
  currentUserId?: string | null;
  permissions: HrReportPermissions;
  onClose: () => void;
  onDownload: (jobId: string, fileName?: string) => void;
  onExportAction: (action: HrReportExportAction, jobId: string) => void;
};

const detailRows = (job: HrReportExportJob) => [
  { id: 'status', label: 'Status', value: getHrReportExportDisplayStatus(job) },
  { id: 'format', label: 'Format', value: getHrReportFormatLabel(job.format) },
  { id: 'rows', label: 'Rows', value: formatHrReportRowCount(job.rowCount) },
  { id: 'file-size', label: 'File Size', value: formatHrReportFileSize(job.fileSizeBytes) },
  { id: 'requested', label: 'Requested', value: formatHrReportDateTime(job.creationTime) },
  { id: 'started', label: 'Started', value: formatHrReportDateTime(job.startedAt) },
  { id: 'completed', label: 'Completed', value: formatHrReportDateTime(job.completedAt) },
  { id: 'expires', label: 'Expires', value: formatHrReportDateTime(job.expiresAt) },
];

export function HrReportExportDetailsDrawer({
  job,
  isDownloading,
  currentUserId,
  permissions,
  onClose,
  onDownload,
  onExportAction,
}: HrReportExportDetailsDrawerProps) {
  const isOwnedByCurrentUser = job ? isHrReportExportOwnedByCurrentUser(job, currentUserId) : false;
  const isDownloadable = job ? canDownloadHrReportExport(job) : false;
  const requestSummary = useMemo(() => {
    const request = job?.requestSnapshot;
    if (!request) return [];

    return [
      { id: 'data-source', label: 'Data Source', value: request.dataSource || '-' },
      {
        id: 'columns',
        label: 'Columns',
        value: request.columns?.length ? `${request.columns.length} selected` : '-',
      },
      { id: 'filters', label: 'Filters', value: countHrReportFilters(request.filters) || '-' },
      {
        id: 'groups',
        label: 'Groups',
        value: request.groups?.length ? request.groups.join(', ') : '-',
      },
      {
        id: 'summaries',
        label: 'Summaries',
        value: request.summaries?.length ? `${request.summaries.length}` : '-',
      },
      {
        id: 'chart',
        label: 'Chart',
        value: request.chart?.type && request.chart.type !== 'none' ? request.chart.type : '-',
      },
    ];
  }, [job?.requestSnapshot]);

  return (
    <Drawer
      anchor="right"
      open={Boolean(job)}
      onClose={onClose}
      PaperProps={{ sx: { width: 420 } }}
    >
      {job ? (
        <Stack spacing={2} sx={{ p: 2, height: '100%' }}>
          <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
            <Box>
              <Typography variant="h6">{job.reportType}</Typography>
              <Typography variant="body2" color="text.secondary">
                {getHrReportExportLineageLabel(job)}
              </Typography>
            </Box>
            <IconButton size="small" onClick={onClose}>
              <Iconify icon="solar:close-circle-bold" />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={getHrReportExportDisplayStatus(job)} variant="soft" />
            <Chip size="small" label={getHrReportFormatLabel(job.format)} variant="outlined" />
          </Stack>

          <Divider />

          <Stack spacing={1}>
            {detailRows(job).map((row) => (
              <Stack
                key={row.id}
                direction="row"
                spacing={2}
                justifyContent="space-between"
                data-testid={`hr-report-export-detail-${row.id}`}
              >
                <Typography variant="body2" color="text.secondary">
                  {row.label}
                </Typography>
                <Typography variant="body2" textAlign="right">
                  {row.value}
                </Typography>
              </Stack>
            ))}
          </Stack>

          {job.errorMessage ? (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" color="error">
                  Failure Reason
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {job.errorMessage}
                </Typography>
              </Box>
            </>
          ) : null}

          {requestSummary.length ? (
            <>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2">Request Snapshot</Typography>
                {requestSummary.map((row) => (
                  <Stack
                    key={row.id}
                    direction="row"
                    spacing={2}
                    justifyContent="space-between"
                    data-testid={`hr-report-export-request-${row.id}`}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {row.label}
                    </Typography>
                    <Typography variant="body2" textAlign="right">
                      {row.value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          ) : null}

          <Box sx={{ flex: 1 }} />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" variant="outlined" color="inherit" onClick={onClose}>
              Close
            </Button>
            <Tooltip title="Download export">
              <span>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon={GlobalIcons.download} />}
                  disabled={!isDownloadable || isDownloading}
                  onClick={() => onDownload(job.id, getHrReportExportFileName(job))}
                >
                  Download
                </Button>
              </span>
            </Tooltip>
            {permissions.canExport &&
            isOwnedByCurrentUser &&
            (job.status === 'Queued' || job.status === 'Running') ? (
              <Button size="small" color="error" onClick={() => onExportAction('cancel', job.id)}>
                Cancel
              </Button>
            ) : null}
            {permissions.canExport &&
            isOwnedByCurrentUser &&
            (job.status === 'Failed' || job.status === 'Cancelled') ? (
              <Button size="small" onClick={() => onExportAction('retry', job.id)}>
                Retry
              </Button>
            ) : null}
            {permissions.canExport && job.status === 'Completed' && job.isExpired ? (
              <Button size="small" onClick={() => onExportAction('regenerate', job.id)}>
                Regenerate
              </Button>
            ) : null}
            {permissions.canShare && isOwnedByCurrentUser ? (
              <Button size="small" onClick={() => onExportAction('share', job.id)}>
                Share
              </Button>
            ) : null}
          </Stack>
        </Stack>
      ) : null}
    </Drawer>
  );
}

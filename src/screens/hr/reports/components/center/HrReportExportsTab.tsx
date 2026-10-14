import type { HrReportExportJob } from 'src/redux/hr/hrReportsApi';
import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Chip,
  Stack,
  Tooltip,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';

import { HrReportCenterEmptyState } from './HrReportCenterEmptyState';
import { HrReportExportDetailsDrawer } from './HrReportExportDetailsDrawer';
import {
  formatHrReportDateTime,
  getHrReportFormatLabel,
  getHrReportExportFileName,
} from '../../hr-report-utils';
import {
  formatHrReportRowCount,
  canDownloadHrReportExport,
  sortHrReportExportsForCenter,
  getHrReportExportDisplayStatus,
  isHrReportExportOwnedByCurrentUser,
} from '../../hr-report-center-utils';

import type { HrReportPermissions } from '../../hr-report-permissions';
import type { HrReportExportAction, HrReportExportDateFilter } from '../../hr-report-types';

type HrReportExportsTabProps = {
  exportJobs: HrReportExportJob[];
  highlightedExportId?: string | null;
  isLoading: boolean;
  isDownloading: boolean;
  actionsDisabled?: boolean;
  currentUserId?: string | null;
  permissions: HrReportPermissions;
  dateFilter?: HrReportExportDateFilter;
  onDateFilterChange?: (filter: HrReportExportDateFilter) => void;
  onDownload: (jobId: string, fileName?: string) => void;
  onExportAction: (action: HrReportExportAction, jobId: string) => void;
};

type ExportRow = HrReportExportJob & IData;

const asExportRow = (row: IData) => row as ExportRow;

const exportStatusColor = (job: HrReportExportJob) => {
  if (job.isExpired) return 'warning';
  if (job.status === 'Completed') return 'success';
  if (job.status === 'Failed') return 'error';
  if (job.status === 'Cancelled') return 'default';
  return 'info';
};

export function HrReportExportsTab({
  exportJobs,
  highlightedExportId,
  isLoading,
  isDownloading,
  actionsDisabled = false,
  currentUserId,
  permissions,
  dateFilter = { preset: 'all', fromDate: '', toDate: '' },
  onDateFilterChange = () => {},
  onDownload,
  onExportAction,
}: HrReportExportsTabProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const rows = useMemo<ExportRow[]>(
    () => sortHrReportExportsForCenter(exportJobs).map((job) => ({ ...job, id: job.id })),
    [exportJobs]
  );
  const selectedJob = useMemo(
    () => exportJobs.find((job) => job.id === selectedJobId) ?? null,
    [exportJobs, selectedJobId]
  );

  useEffect(() => {
    setSelectedJobId(null);
  }, [dateFilter.fromDate, dateFilter.preset, dateFilter.toDate]);

  const columns = useMemo<IColumn[]>(
    () => [
      { id: 'reportType', label: 'Report', minWidth: '16vw', align: 'left' as const },
      {
        id: 'format',
        label: 'Format',
        minWidth: '8vw',
        align: 'left' as const,
        render: (value: HrReportExportJob['format']) => getHrReportFormatLabel(value),
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: '12vw',
        align: 'left' as const,
        render: (_value, rawRow) => {
          const row = asExportRow(rawRow);
          return (
            <Stack spacing={0.5}>
              <Chip
                size="small"
                label={getHrReportExportDisplayStatus(row)}
                color={exportStatusColor(row)}
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
          );
        },
      },
      {
        id: 'rowCount',
        label: 'Rows',
        minWidth: '7vw',
        align: 'left' as const,
        render: (value?: number | null) => formatHrReportRowCount(value),
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
        label: 'Action',
        minWidth: '10vw',
        align: 'left' as const,
        isFilter: false,
        isSort: false,
        render: (_value, rawRow) => {
          const row = asExportRow(rawRow);
          const isOwnedByCurrentUser = isHrReportExportOwnedByCurrentUser(row, currentUserId);
          const isDownloadable = canDownloadHrReportExport(row);
          return (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Download export">
                <span>
                  <IconButton
                    data-testid="hr-report-export-download-button"
                    aria-label={`Download ${getHrReportExportFileName(row)}`}
                    size="small"
                    disabled={actionsDisabled || !isDownloadable || isDownloading}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (actionsDisabled) return;
                      onDownload(row.id, getHrReportExportFileName(row));
                    }}
                  >
                    <Iconify icon={GlobalIcons.download} />
                  </IconButton>
                </span>
              </Tooltip>
              {permissions.canExport &&
              isOwnedByCurrentUser &&
              (row.status === 'Queued' || row.status === 'Running') ? (
                <Tooltip title="Cancel export">
                  <span>
                    <IconButton
                      data-testid="hr-report-export-cancel-button"
                      aria-label="Cancel export"
                      size="small"
                      disabled={actionsDisabled}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (actionsDisabled) return;
                        onExportAction('cancel', row.id);
                      }}
                    >
                      <Iconify icon="solar:close-circle-bold" />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}
              {permissions.canDelete && isOwnedByCurrentUser && row.status === 'Failed' ? (
                <Tooltip title="Remove failed export">
                  <span>
                    <IconButton
                      data-testid="hr-report-export-delete-button"
                      aria-label="Remove failed export"
                      size="small"
                      color="error"
                      disabled={actionsDisabled}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (actionsDisabled) return;
                        onExportAction('delete', row.id);
                      }}
                    >
                      <Iconify icon={GlobalIcons.delete} />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}
              {permissions.canExport &&
              isOwnedByCurrentUser &&
              (row.status === 'Failed' || row.status === 'Cancelled') ? (
                <Tooltip title="Retry export">
                  <span>
                    <IconButton
                      data-testid="hr-report-export-retry-button"
                      aria-label="Retry export"
                      size="small"
                      disabled={actionsDisabled}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (actionsDisabled) return;
                        onExportAction('retry', row.id);
                      }}
                    >
                      <Iconify icon="solar:refresh-bold" />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}
              {permissions.canExport && row.status === 'Completed' && row.isExpired ? (
                <Tooltip title="Regenerate export">
                  <span>
                    <IconButton
                      data-testid="hr-report-export-regenerate-button"
                      aria-label="Regenerate export"
                      size="small"
                      disabled={actionsDisabled}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (actionsDisabled) return;
                        onExportAction('regenerate', row.id);
                      }}
                    >
                      <Iconify icon="solar:restart-bold" />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}
              {permissions.canShare && isOwnedByCurrentUser ? (
                <Tooltip title="Share export">
                  <span>
                    <IconButton
                      data-testid="hr-report-export-share-button"
                      aria-label="Share export"
                      size="small"
                      disabled={actionsDisabled}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (actionsDisabled) return;
                        onExportAction('share', row.id);
                      }}
                    >
                      <Iconify icon="solar:share-bold" />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}
              <Tooltip title="View export details">
                <span>
                  <IconButton
                    data-testid="hr-report-export-details-button"
                    aria-label="View export details"
                    size="small"
                    disabled={actionsDisabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (actionsDisabled) return;
                      setSelectedJobId(row.id);
                    }}
                  >
                    <Iconify icon="solar:info-circle-bold" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [
      currentUserId,
      actionsDisabled,
      isDownloading,
      onDownload,
      onExportAction,
      permissions.canExport,
      permissions.canDelete,
      permissions.canShare,
    ]
  );

  return (
    <>
      <Box
        sx={{
          mb: 1.5,
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          <Typography variant="subtitle2" sx={{ minWidth: 110 }}>
            Requested date
          </Typography>
          <TextField
            select
            size="small"
            label="Date range"
            value={dateFilter.preset}
            onChange={(event) =>
              onDateFilterChange({
                ...dateFilter,
                preset: event.target.value as HrReportExportDateFilter['preset'],
              })
            }
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All dates</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="last7Days">Last 7 days</MenuItem>
            <MenuItem value="last30Days">Last 30 days</MenuItem>
            <MenuItem value="custom">Custom range</MenuItem>
          </TextField>
          {dateFilter.preset === 'custom' ? (
            <>
              <TextField
                size="small"
                type="date"
                label="From"
                value={dateFilter.fromDate}
                onChange={(event) =>
                  onDateFilterChange({ ...dateFilter, fromDate: event.target.value })
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                size="small"
                type="date"
                label="To"
                value={dateFilter.toDate}
                onChange={(event) =>
                  onDateFilterChange({ ...dateFilter, toDate: event.target.value })
                }
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(
                  dateFilter.fromDate &&
                  dateFilter.toDate &&
                  dateFilter.toDate < dateFilter.fromDate
                )}
                helperText={
                  dateFilter.fromDate &&
                  dateFilter.toDate &&
                  dateFilter.toDate < dateFilter.fromDate
                    ? 'To date must be on or after from date.'
                    : undefined
                }
              />
            </>
          ) : null}
        </Stack>
      </Box>
      <CustomizableTable
        tableId="hr-report-exports"
        tableTitle="Exports"
        columns={columns}
        data={rows}
        isLoading={isLoading}
        isSearch
        noDataText={
          <HrReportCenterEmptyState
            icon="solar:file-download-bold"
            title="No exports yet"
            description="Generate an HR report and choose Excel or PDF to queue the first export."
          />
        }
        rowProps={(row) => ({
          onClick: () => {
            if (!actionsDisabled) setSelectedJobId(row.id);
          },
          sx: {
            cursor: 'pointer',
            ...(row.id === highlightedExportId
              ? {
                  '& td': {
                    bgcolor: 'action.hover',
                  },
                }
              : {}),
          },
        })}
      />
      <HrReportExportDetailsDrawer
        job={selectedJob}
        isDownloading={isDownloading}
        actionsDisabled={actionsDisabled}
        currentUserId={currentUserId}
        permissions={permissions}
        onClose={() => setSelectedJobId(null)}
        onDownload={onDownload}
        onExportAction={onExportAction}
      />
    </>
  );
}

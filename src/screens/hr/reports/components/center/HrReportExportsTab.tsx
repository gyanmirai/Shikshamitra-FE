import type { HrReportExportJob } from 'src/redux/hr/hrReportsApi';
import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { useMemo, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { Chip, Stack, Tooltip, IconButton, LinearProgress } from '@mui/material';

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

import type { HrReportExportAction } from '../../hr-report-types';
import type { HrReportPermissions } from '../../hr-report-permissions';

type HrReportExportsTabProps = {
  exportJobs: HrReportExportJob[];
  highlightedExportId?: string | null;
  isLoading: boolean;
  isDownloading: boolean;
  currentUserId?: string | null;
  permissions: HrReportPermissions;
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
  currentUserId,
  permissions,
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
                    size="small"
                    disabled={!isDownloadable || isDownloading}
                    onClick={(event) => {
                      event.stopPropagation();
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
                  <IconButton
                    data-testid="hr-report-export-cancel-button"
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      onExportAction('cancel', row.id);
                    }}
                  >
                    <Iconify icon="solar:close-circle-bold" />
                  </IconButton>
                </Tooltip>
              ) : null}
              {permissions.canExport &&
              isOwnedByCurrentUser &&
              (row.status === 'Failed' || row.status === 'Cancelled') ? (
                <Tooltip title="Retry export">
                  <IconButton
                    data-testid="hr-report-export-retry-button"
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      onExportAction('retry', row.id);
                    }}
                  >
                    <Iconify icon="solar:refresh-bold" />
                  </IconButton>
                </Tooltip>
              ) : null}
              {permissions.canExport && row.status === 'Completed' && row.isExpired ? (
                <Tooltip title="Regenerate export">
                  <IconButton
                    data-testid="hr-report-export-regenerate-button"
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      onExportAction('regenerate', row.id);
                    }}
                  >
                    <Iconify icon="solar:restart-bold" />
                  </IconButton>
                </Tooltip>
              ) : null}
              {permissions.canShare && isOwnedByCurrentUser ? (
                <Tooltip title="Share export">
                  <IconButton
                    data-testid="hr-report-export-share-button"
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      onExportAction('share', row.id);
                    }}
                  >
                    <Iconify icon="solar:share-bold" />
                  </IconButton>
                </Tooltip>
              ) : null}
              <Tooltip title="View export details">
                <IconButton
                  data-testid="hr-report-export-details-button"
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedJobId(row.id);
                  }}
                >
                  <Iconify icon="solar:info-circle-bold" />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [
      currentUserId,
      isDownloading,
      onDownload,
      onExportAction,
      permissions.canExport,
      permissions.canShare,
    ]
  );

  return (
    <>
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
          onClick: () => setSelectedJobId(row.id),
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
        currentUserId={currentUserId}
        permissions={permissions}
        onClose={() => setSelectedJobId(null)}
        onDownload={onDownload}
        onExportAction={onExportAction}
      />
    </>
  );
}

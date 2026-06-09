import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  HrReportSchedule,
  HrReportTemplate,
  HrReportExportJob,
} from 'src/redux/hr/hrReportsApi';

import { useMemo } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Chip, Stack, Button, Tooltip, IconButton, Typography } from '@mui/material';

import { formatHrReportDateTime, getHrReportExportFileName } from '../hr-report-utils';

import type { HrReportPermissions } from '../hr-report-permissions';

type HrReportsLandingTableProps = {
  templates: HrReportTemplate[];
  schedules: HrReportSchedule[];
  exportJobs: HrReportExportJob[];
  isLoading: boolean;
  isDownloading: boolean;
  onGenerateReport: () => void;
  onDownload: (jobId: string, fileName?: string) => void;
  onScheduleAction: (action: 'pause' | 'resume' | 'runNow', scheduleId: string) => void;
  permissions: HrReportPermissions;
};

type LandingRow = {
  id: string;
  name: string;
  category: string;
  type: 'Template' | 'Export';
  status: string;
  date?: string;
  format?: string;
  job?: HrReportExportJob;
};

export function HrReportsLandingTable({
  templates,
  schedules,
  exportJobs,
  isLoading,
  isDownloading,
  onGenerateReport,
  onDownload,
  onScheduleAction,
  permissions,
}: HrReportsLandingTableProps) {
  const completedExports = exportJobs.filter((job) => job.status === 'Completed').length;
  const activeSchedules = schedules.filter((schedule) => schedule.status === 'Active').length;

  const rows = useMemo<LandingRow[]>(
    () => [
      ...exportJobs.map((job) => ({
        id: `export-${job.id}`,
        name: job.reportType,
        category: job.format.toUpperCase(),
        type: 'Export' as const,
        status: job.status,
        date: job.creationTime,
        format: job.format,
        job,
      })),
      ...templates.map((template) => ({
        id: `template-${template.id}`,
        name: template.name,
        category: template.category,
        type: 'Template' as const,
        status: template.status,
        date: template.lastModificationTime || template.creationTime,
      })),
    ],
    [exportJobs, templates]
  );

  const columns = useMemo<IColumn[]>(
    () => [
      { id: 'name', label: 'Report Name', minWidth: '16vw', align: 'left' as const, sticky: true },
      { id: 'type', label: 'Type', minWidth: '8vw', align: 'left' as const },
      { id: 'category', label: 'Category / Format', minWidth: '10vw', align: 'left' as const },
      {
        id: 'status',
        label: 'Status',
        minWidth: '10vw',
        align: 'left' as const,
        render: (value: string, row: any) => (
          <Chip
            size="small"
            label={value}
            variant="soft"
            color={
              value === 'Completed' || value === 'Published'
                ? 'success'
                : value === 'Failed'
                  ? 'error'
                  : row.type === 'Template'
                    ? 'default'
                    : 'info'
            }
          />
        ),
      },
      {
        id: 'date',
        label: 'Updated / Requested',
        minWidth: '13vw',
        align: 'left' as const,
        render: (value: string) => formatHrReportDateTime(value),
      },
      {
        id: 'action',
        label: 'Action',
        minWidth: '8vw',
        align: 'left' as const,
        isFilter: false,
        isSort: false,
        render: (_value: any, row: any) =>
          row.job ? (
            <Tooltip title="Download export">
              <span>
                <IconButton
                  size="small"
                  disabled={
                    !permissions.canExport ||
                    row.job.status !== 'Completed' ||
                    row.job.isExpired ||
                    isDownloading
                  }
                  onClick={() => onDownload(row.job!.id, getHrReportExportFileName(row.job!))}
                >
                  <Iconify icon={GlobalIcons.download} />
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <Button
              data-testid="hr-report-open-template-button"
              size="small"
              variant="text"
              startIcon={<Iconify icon={GlobalIcons.report} />}
              onClick={onGenerateReport}
            >
              Open
            </Button>
          ),
      },
    ],
    [isDownloading, onDownload, onGenerateReport, permissions.canExport]
  );

  const scheduleColumns = useMemo<IColumn[]>(
    () => [
      { id: 'name', label: 'Schedule', minWidth: '16vw', align: 'left' as const },
      { id: 'frequency', label: 'Frequency', minWidth: '8vw', align: 'left' as const },
      {
        id: 'deliveryMode',
        label: 'Delivery',
        minWidth: '10vw',
        align: 'left' as const,
        render: (value: string) => (value === 'inAppAndEmail' ? 'In-app + email' : 'In-app'),
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: '8vw',
        align: 'left' as const,
        render: (value: string) => (
          <Chip
            size="small"
            label={value}
            color={value === 'Active' ? 'success' : 'default'}
            variant="soft"
          />
        ),
      },
      {
        id: 'nextRunAt',
        label: 'Next Run',
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
        render: (_value: any, row: any) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Run now">
              <span>
                <IconButton
                  data-testid="hr-report-schedule-run-now-button"
                  size="small"
                  disabled={!permissions.canSchedule}
                  onClick={() => onScheduleAction('runNow', row.id)}
                >
                  <Iconify icon="solar:play-circle-bold" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={row.status === 'Active' ? 'Pause schedule' : 'Resume schedule'}>
              <span>
                <IconButton
                  data-testid="hr-report-schedule-toggle-button"
                  size="small"
                  disabled={!permissions.canSchedule}
                  onClick={() =>
                    onScheduleAction(row.status === 'Active' ? 'pause' : 'resume', row.id)
                  }
                >
                  <Iconify
                    icon={
                      row.status === 'Active' ? 'solar:pause-circle-bold' : 'solar:restart-bold'
                    }
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [onScheduleAction, permissions.canSchedule]
  );

  return (
    <Stack spacing={2} data-testid="hr-reports-center">
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, minmax(0, 1fr))' },
        }}
      >
        {[
          ['Templates', templates.length],
          ['Completed Exports', completedExports],
          ['Active Schedules', activeSchedules],
          ['Recent Jobs', exportJobs.length],
        ].map(([label, value]) => (
          <Box
            key={label}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      <CustomizableTable
        tableId="hr-reports-landing"
        tableTitle="Reports Center"
        columns={columns}
        data={rows}
        isLoading={isLoading}
        isSearch
        noDataText="No saved templates or export jobs found."
      />

      <CustomizableTable
        tableId="hr-report-schedules"
        tableTitle="Scheduled Reports"
        columns={scheduleColumns}
        data={schedules}
        isLoading={isLoading}
        isSearch={false}
        noDataText="No scheduled reports found."
      />
    </Stack>
  );
}

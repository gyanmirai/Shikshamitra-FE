import type { HrReportSchedule } from 'src/redux/hr/hrReportsApi';
import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { useMemo } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Chip, Stack, Tooltip, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

import { formatHrReportDateTime } from '../../hr-report-utils';
import { HrReportCenterEmptyState } from './HrReportCenterEmptyState';
import { getHrReportRecipientLabel } from '../../hr-report-center-utils';

import type { HrReportScheduleAction } from '../../hr-report-types';
import type { HrReportPermissions } from '../../hr-report-permissions';

type HrReportSchedulesTabProps = {
  schedules: HrReportSchedule[];
  isLoading: boolean;
  permissions: HrReportPermissions;
  onScheduleAction: (action: HrReportScheduleAction, schedule: HrReportSchedule) => void;
};

type ScheduleRow = HrReportSchedule & IData;

const asScheduleRow = (row: IData) => row as ScheduleRow;

export function HrReportSchedulesTab({
  schedules,
  isLoading,
  permissions,
  onScheduleAction,
}: HrReportSchedulesTabProps) {
  const rows = useMemo<ScheduleRow[]>(
    () =>
      [...schedules].sort(
        (left, right) => new Date(left.nextRunAt).getTime() - new Date(right.nextRunAt).getTime()
      ),
    [schedules]
  );

  const columns = useMemo<IColumn[]>(
    () => [
      { id: 'name', label: 'Schedule', minWidth: '16vw', align: 'left' as const, sticky: true },
      { id: 'frequency', label: 'Frequency', minWidth: '8vw', align: 'left' as const },
      {
        id: 'deliveryMode',
        label: 'Delivery',
        minWidth: '10vw',
        align: 'left' as const,
        render: (value: string) => (value === 'inAppAndEmail' ? 'In-app + email' : 'In-app'),
      },
      {
        id: 'recipientUserIds',
        label: 'Recipients',
        minWidth: '9vw',
        align: 'left' as const,
        render: (_value, rawRow) => {
          const row = asScheduleRow(rawRow);
          return <Chip size="small" label={getHrReportRecipientLabel(row)} variant="soft" />;
        },
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
        id: 'lastRunAt',
        label: 'Last Run',
        minWidth: '13vw',
        align: 'left' as const,
        render: (value?: string) => (value ? formatHrReportDateTime(value) : '-'),
      },
      {
        id: 'action',
        label: 'Action',
        minWidth: '12vw',
        align: 'left' as const,
        isFilter: false,
        isSort: false,
        render: (_value, rawRow) => {
          const row = asScheduleRow(rawRow);
          return (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Run now">
                <span>
                  <IconButton
                    data-testid="hr-report-schedule-run-now-button"
                    size="small"
                    disabled={!permissions.canSchedule}
                    onClick={() => onScheduleAction('runNow', row)}
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
                      onScheduleAction(row.status === 'Active' ? 'pause' : 'resume', row)
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
              {permissions.canSchedule ? (
                <Tooltip title="Delete schedule">
                  <IconButton
                    data-testid="hr-report-schedule-delete-button"
                    size="small"
                    onClick={() => onScheduleAction('delete', row)}
                  >
                    <Iconify icon={GlobalIcons.delete} />
                  </IconButton>
                </Tooltip>
              ) : null}
            </Stack>
          );
        },
      },
    ],
    [onScheduleAction, permissions.canSchedule]
  );

  return (
    <CustomizableTable
      tableId="hr-report-schedules"
      tableTitle="Schedules"
      columns={columns}
      data={rows}
      isLoading={isLoading}
      isSearch
      noDataText={
        <HrReportCenterEmptyState
          icon="solar:calendar-add-bold"
          title="No scheduled reports"
          description="Schedule a report from the builder to automate recurring HR exports."
        />
      }
    />
  );
}

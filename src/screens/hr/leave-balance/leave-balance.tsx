'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmployeeLeaveStatusOptions } from 'src/enums/employee-leave-status';
import {
  Box,
  Card,
  Grid,
  Chip,
  Stack,
  Alert,
  Tooltip,
  Skeleton,
  Typography,
  LinearProgress,
} from '@mui/material';

import { useLeaveOverview } from '../leave-request/use-leave-overview';
import { getLeaveStatusColor, getLeaveStatusLabel } from '../leave-request/leave-status.utils';

import type { LeaveOverviewData, LeaveTypeBreakdown } from '../leave-request/leave-overview.utils';

// -----------------------------------------------------------------------

const formatLeaveDays = (value: number) => `${value} ${value === 1 ? 'day' : 'days'}`;

const BalanceSummaryStrip = ({
  overview,
  isLoading,
}: {
  overview: LeaveOverviewData;
  isLoading: boolean;
}) => {
  const usagePct =
    overview.totalLeaves > 0
      ? Math.min(100, Math.round((overview.usedLeaves / overview.totalLeaves) * 100))
      : 0;

  return (
    <Card
      variant="outlined"
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 2,
        boxShadow: 'none',
        bgcolor: 'background.paper',
      }}
    >
      {isLoading ? (
        <Stack spacing={1.5}>
          <Skeleton width="28%" height={22} />
          <Skeleton variant="rounded" height={72} sx={{ borderRadius: 2 }} />
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'success.main',
                  bgcolor: 'success.lighter',
                }}
              >
                <Iconify icon="solar:calendar-add-bold-duotone" width={24} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Available balance
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={0.75}>
                  <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                    {overview.remainingLeaves}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    / {formatLeaveDays(overview.totalLeaves)}
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ alignItems: 'center' }}
            >
              <Chip
                size="small"
                color="warning"
                variant="soft"
                label={`${formatLeaveDays(overview.usedLeaves)} used`}
                sx={{ fontWeight: 700 }}
              />
              <Chip
                size="small"
                color="info"
                variant="soft"
                label={`${overview.pendingLeaves} pending`}
                sx={{ fontWeight: 700 }}
              />
              <Chip
                size="small"
                color="primary"
                variant="soft"
                label={`${usagePct}% utilized`}
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={usagePct}
            color={usagePct >= 80 ? 'error' : usagePct >= 50 ? 'warning' : 'success'}
            sx={{ height: 8, borderRadius: 999, bgcolor: 'background.neutral' }}
          />
        </Stack>
      )}
    </Card>
  );
};

const LeaveTypeSummaryCard = ({ row }: { row: LeaveTypeBreakdown }) => {
  const usagePct = row.total > 0 ? Math.min(100, Math.round((row.used / row.total) * 100)) : 0;
  const progressColor: 'success' | 'warning' | 'error' =
    usagePct >= 80 ? 'error' : usagePct >= 50 ? 'warning' : 'success';
  const isLowBalance = row.remaining <= 2 && row.total > 0;

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        height: 1,
        borderRadius: 2,
        borderColor: isLowBalance ? 'error.light' : 'divider',
        bgcolor: isLowBalance ? 'error.lighter' : 'background.paper',
      }}
    >
      <Stack spacing={1.75} sx={{ height: 1 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isLowBalance ? 'error.main' : 'primary.main',
                bgcolor: isLowBalance ? 'error.light' : 'primary.lighter',
              }}
            >
              <Iconify icon="solar:calendar-mark-bold-duotone" width={20} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                title={row.leaveTypeName}
                sx={{
                  fontWeight: 700,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {row.leaveTypeName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {usagePct}% used
              </Typography>
            </Box>
          </Stack>

          {isLowBalance && (
            <Chip
              size="small"
              color="error"
              variant="soft"
              icon={<Iconify icon="solar:danger-triangle-bold" width={14} />}
              label="Low"
              sx={{ fontWeight: 700 }}
            />
          )}
        </Stack>

        <Box>
          <Stack direction="row" alignItems="baseline" spacing={0.75}>
            <Typography variant="h4" sx={{ lineHeight: 1, fontWeight: 800 }}>
              {row.remaining}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              / {formatLeaveDays(row.total)}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            remaining balance
          </Typography>
        </Box>

        <Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              Usage
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {usagePct}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={usagePct}
            color={progressColor}
            sx={{ height: 8, borderRadius: 999 }}
          />
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mt: 'auto' }}>
          <Chip
            size="small"
            color="warning"
            variant="soft"
            label={`${formatLeaveDays(row.used)} used`}
            sx={{ fontWeight: 700 }}
          />
          <Chip
            size="small"
            color="info"
            variant="soft"
            label={`${row.pending} pending`}
            sx={{ fontWeight: 700 }}
          />
        </Stack>
      </Stack>
    </Card>
  );
};

type LeaveBalanceProps = {
  mode?: 'hr' | 'self';
  showBreadcrumbs?: boolean;
  showSummaryCards?: boolean;
  showSelfAccessError?: boolean;
  overviewState?: ReturnType<typeof useLeaveOverview>;
  /** When provided, displays leave data for this specific employee instead of the logged-in user. */
  employeeId?: string;
};

const LeaveBalance = ({
  mode = 'hr',
  showBreadcrumbs = true,
  showSummaryCards = true,
  showSelfAccessError = true,
  overviewState,
  employeeId,
}: LeaveBalanceProps) => {
  const isSelfMode = mode === 'self';
  const isEmployeeProfileMode = Boolean(employeeId);
  const internalOverviewState = useLeaveOverview({
    mode,
    employeeId,
    enabled: !overviewState,
  });
  const leaveOverviewState = overviewState ?? internalOverviewState;
  const { historyData, overview, isLoadingBalance, isLoadingHistory, selfAccessError } =
    leaveOverviewState;

  const breakdownRows = useMemo(() => overview.leaveTypeBreakdown, [overview.leaveTypeBreakdown]);

  const historyColumns: IColumn[] = useMemo(
    () => [
      {
        id: 'leaveType',
        label: 'Leave Type',
        align: 'left',
        minWidth: '140px',
        sticky: true,
      },
      {
        id: 'appliedDate',
        label: 'Applied Date',
        align: 'left',
        minWidth: '120px',
        filterType: 'date',
        isDateFilter: true,
        sticky: true,
      },
      {
        id: 'startDate',
        label: 'Start Date',
        align: 'left',
        minWidth: '110px',
        filterType: 'date',
        isDateFilter: true,
      },
      {
        id: 'endDate',
        label: 'End Date',
        align: 'left',
        minWidth: '110px',
        filterType: 'date',
        isDateFilter: true,
      },
      {
        id: 'totalDays',
        label: 'Days',
        align: 'center',
        filterType: 'number',
        minWidth: '70px',
      },
      {
        id: 'reason',
        label: 'Reason',
        align: 'left',
        minWidth: '180px',
        render(value) {
          return (
            <Tooltip title={value || ''} arrow placement="top">
              <Typography
                variant="body2"
                sx={{
                  maxWidth: 180,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {value || '-'}
              </Typography>
            </Tooltip>
          );
        },
      },
      {
        id: 'status',
        label: 'Status',
        align: 'left',
        filterType: 'enum',
        enumOptions: EmployeeLeaveStatusOptions,
        sticky: true,
        minWidth: '110px',
        render(value) {
          return <Label color={getLeaveStatusColor(value)}>{getLeaveStatusLabel(value)}</Label>;
        },
      },
    ],
    []
  );

  const historyRows = useMemo(
    () =>
      (historyData?.items ?? []).map((item: any) => ({
        id: item.id,
        appliedDate: item.appliedDate ? dayjs(item.appliedDate).format('DD-MM-YYYY') : '-',
        leaveType: item.leaveType ?? '-',
        startDate: item.startDate ? dayjs(item.startDate).format('DD-MM-YYYY') : '-',
        endDate: item.endDate ? dayjs(item.endDate).format('DD-MM-YYYY') : '-',
        totalDays: item.totalDays ?? '-',
        reason: item.reason ?? item.description ?? '-',
        status: item.status,
      })),
    [historyData]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <CustomBreadcrumbs
          heading={isSelfMode ? 'My Leave Balance' : 'Leave Balance'}
          links={
            isSelfMode
              ? [{ name: 'Dashboard', href: '/dashboard/' }, { name: 'My Leave Balance' }]
              : [
                  { name: 'HR/Staff', href: '/hr/dashboard/' },
                  { name: 'Leave Management', href: '/hr/leave-center/' },
                  { name: 'Leave Balance' },
                ]
          }
          description="View your leave quota, breakdown by leave type, and full leave history."
        />
      )}

      {showSelfAccessError && selfAccessError && (
        <Card sx={{ mt: 1, p: 2 }}>
          <Alert severity="warning">
            Your user is not linked to an employee profile. Contact admin/HR.
          </Alert>
        </Card>
      )}

      {/* ── Section A: Summary Stat Cards ── */}
      {showSummaryCards && !selfAccessError && (
        <BalanceSummaryStrip overview={overview} isLoading={isLoadingBalance} />
      )}

      {/* ── Section B: Leave Type Breakdown ── */}
      {!selfAccessError && (
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <Iconify
                icon="solar:pie-chart-2-bold-duotone"
                sx={{ color: 'primary.main', width: 22, height: 22 }}
              />
              <Box>
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <Typography variant="h6">Leave Type Breakdown</Typography>
                  <CustomTooltip
                    arrow
                    placement="right"
                    title="Shows allocation and usage per leave type. Red remaining balance means you are running low."
                  >
                    <Iconify
                      icon="lucide:info"
                      sx={{ cursor: 'pointer' }}
                      fontSize={15}
                      color="info.main"
                    />
                  </CustomTooltip>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Allocation and usage by leave type.
                </Typography>
              </Box>
            </Stack>

            <Chip
              size="small"
              variant="soft"
              color="primary"
              label={`${breakdownRows.length} leave type${breakdownRows.length === 1 ? '' : 's'}`}
              sx={{ fontWeight: 700 }}
            />
          </Stack>

          {isLoadingBalance ? (
            <Grid container spacing={1.5}>
              {[1, 2, 3].map((item) => (
                <Grid key={item} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
                  <Skeleton variant="rounded" height={190} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : breakdownRows.length ? (
            <Grid container spacing={1.5}>
              {breakdownRows.map((row) => (
                <Grid
                  key={row.leaveTypeId || row.leaveTypeName}
                  size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}
                >
                  <LeaveTypeSummaryCard row={row} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card
              variant="outlined"
              sx={{
                p: 4,
                minHeight: 180,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                bgcolor: 'background.paper',
              }}
            >
              <Stack spacing={1} alignItems="center">
                <Iconify
                  icon="solar:calendar-minimalistic-bold-duotone"
                  sx={{ width: 48, height: 48, color: 'text.disabled' }}
                />
                <Typography color="text.secondary">
                  No leave type allocation found for this year.
                </Typography>
              </Stack>
            </Card>
          )}
        </Stack>
      )}

      {/* ── Section C: My Leave History ── */}
      {!selfAccessError && (
        <Card variant="outlined" sx={{ mt: 2, p: 1.5, mb: 1, borderRadius: 2, boxShadow: 'none' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            sx={{ mb: 1.5 }}
          >
            <Stack direction="row" alignItems="center" gap={1}>
              <Iconify
                icon="solar:history-bold-duotone"
                sx={{ color: 'primary.main', width: 22, height: 22 }}
              />
              <Box>
                <Typography variant="h6">
                  {isEmployeeProfileMode ? 'Employee Leave History' : 'My Leave History'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Search, review, and export leave request records.
                </Typography>
              </Box>
            </Stack>
            <Chip
              size="small"
              variant="soft"
              color="info"
              label={`${historyRows.length} shown`}
              sx={{ fontWeight: 700 }}
            />
          </Stack>

          <CustomizableTable
            tableId="leave-balance-history"
            columns={historyColumns}
            data={historyRows}
            isLoading={isLoadingHistory}
            tableTitle="Leave History"
            noDataText={
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Iconify
                  icon="solar:document-bold-duotone"
                  sx={{ width: 48, height: 48, color: 'text.disabled', mb: 1 }}
                />
                <Typography color="text.secondary">
                  No leave history found for this academic year.
                </Typography>
              </Box>
            }
          />
          {historyData &&
            typeof historyData.totalCount === 'number' &&
            historyData.totalCount > (historyData.items?.length ?? 0) && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Showing {historyData.items?.length ?? 0} of {historyData.totalCount} leave requests
                for this academic year (max {100} per page).
              </Typography>
            )}
        </Card>
      )}
    </Box>
  );
};

export default LeaveBalance;

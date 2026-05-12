'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import CustomTooltip from 'src/components/custom-tooltip';
import { DashboardCard } from 'src/components/dashboard-card';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmployeeLeaveStatusOptions } from 'src/enums/employee-leave-status';
import {
  Box,
  Card,
  Grid,
  Chip,
  Tooltip,
  Skeleton,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  useGetLeaveRequestsQuery,
  useGetMyLeaveBalanceQuery,
  useGetMyLeaveRequestsQuery,
  useGetSelfLeaveBalanceQuery,
} from 'src/redux/hr/leaveApi';

import {
  getLeaveStatusColor,
  getLeaveStatusLabel,
  normalizeLeaveStatus,
} from '../leave-request/leave-status.utils';

// -----------------------------------------------------------------------

interface LeaveTypeBreakdown {
  leaveTypeId: string;
  leaveTypeName: string;
  total: number;
  used: number;
  pending: number;
  remaining: number;
}

interface LeaveBalanceData {
  totalLeaves: number;
  usedLeaves: number;
  remainingLeaves: number;
  pendingLeaves: number;
  leaveTypeBreakdown: LeaveTypeBreakdown[];
}

// -----------------------------------------------------------------------

const SUMMARY_CARDS = (data?: LeaveBalanceData) => [
  {
    title: 'Total Leaves',
    value: data?.totalLeaves ?? 0,
    icon: 'solar:calendar-bold-duotone',
    color: 'primary.main',
    bgColor: 'primary.lighter',
  },
  {
    title: 'Used Leaves',
    value: data?.usedLeaves ?? 0,
    icon: 'solar:check-circle-bold-duotone',
    color: 'warning.main',
    bgColor: 'warning.lighter',
  },
  {
    title: 'Remaining Leaves',
    value: data?.remainingLeaves ?? 0,
    icon: 'solar:calendar-add-bold-duotone',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    title: 'Pending Requests',
    value: data?.pendingLeaves ?? 0,
    icon: 'solar:clock-circle-bold-duotone',
    color: 'info.main',
    bgColor: 'info.lighter',
  },
];

// -----------------------------------------------------------------------

const BREAKDOWN_COLUMNS: IColumn[] = [
  {
    id: 'leaveTypeName',
    label: 'Leave Type',
    align: 'left',
    sticky: true,
    minWidth: '160px',
    render(value, row) {
      return (
        <Tooltip title={`${value} – ${row.total} days allocated this year`} arrow placement="top">
          <Chip
            label={value}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, cursor: 'help' }}
          />
        </Tooltip>
      );
    },
  },
  {
    id: 'total',
    label: 'Total',
    filterType: 'number',
    minWidth: '80px',
  },
  {
    id: 'used',
    label: 'Used',
    filterType: 'number',
    minWidth: '80px',
    render(value) {
      return (
        <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600 }}>
          {value}
        </Typography>
      );
    },
  },
  {
    id: 'pending',
    label: 'Pending',
    filterType: 'number',
    minWidth: '80px',
    render(value) {
      return (
        <Typography variant="body2" sx={{ color: 'info.main', fontWeight: 600 }}>
          {value}
        </Typography>
      );
    },
  },
  {
    id: 'remaining',
    label: 'Remaining',
    filterType: 'number',
    minWidth: '100px',
    render(value, row) {
      const isLow = value <= 2 && row.total > 0;
      return (
        <Tooltip
          title={isLow ? 'Low balance! Only a few days left.' : ''}
          arrow
          placement="top"
          disableHoverListener={!isLow}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: isLow ? 'error.main' : 'success.main' }}
            >
              {value}
            </Typography>
            {isLow && (
              <Iconify
                icon="solar:danger-bold"
                sx={{ color: 'error.main', width: 14, height: 14 }}
              />
            )}
          </Box>
        </Tooltip>
      );
    },
  },
  {
    id: 'progress',
    label: 'Usage',
    isFilter: false,
    isSort: false,
    minWidth: '140px',
    render(_value, row) {
      const pct = row.total > 0 ? Math.round((row.used / row.total) * 100) : 0;
      const color = pct >= 80 ? 'error' : pct >= 50 ? 'warning' : 'success';
      return (
        <Box sx={{ width: '100%', minWidth: 100 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {pct}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pct}
            color={color}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      );
    },
  },
];

// -----------------------------------------------------------------------

type LeaveBalanceProps = {
  mode?: 'hr' | 'self';
  showBreadcrumbs?: boolean;
  /** When provided, displays leave data for this specific employee instead of the logged-in user. */
  employeeId?: string;
};

const LeaveBalance = ({ mode = 'hr', showBreadcrumbs = true, employeeId }: LeaveBalanceProps) => {
  const isSelfMode = mode === 'self';
  const isEmployeeProfileMode = Boolean(employeeId);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { employee } = useSelector((state: any) => state.auth);

  // When viewing a specific employee's profile, always use HR endpoints with the given employeeId.
  // Fall back to the authenticated employee's ID for the standard HR global view.
  const resolvedEmployeeId = isEmployeeProfileMode ? employeeId : employee?.id;

  const {
    data: balanceDataForHr,
    isLoading: isBalanceLoadingForHr,
    isFetching: isBalanceFetchingForHr,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMyLeaveBalanceQuery,
    params: { academicYearId: currentYear?.id, employeeId: resolvedEmployeeId },
    options: { skip: !currentYear?.id || isSelfMode },
  });
  const {
    data: balanceDataForSelf,
    isLoading: isBalanceLoadingForSelf,
    isFetching: isBalanceFetchingForSelf,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSelfLeaveBalanceQuery,
    params: { academicYearId: currentYear?.id },
    options: { skip: !currentYear?.id || !isSelfMode },
  });

  const {
    data: historyDataForHr,
    isLoading: isHistoryLoadingForHr,
    isFetching: isHistoryFetchingForHr,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLeaveRequestsQuery,
    params: {
      academicYearId: currentYear?.id,
      page: 1,
      pageSize: 100,
      ...(isEmployeeProfileMode ? { employeeId } : {}),
    },
    options: { skip: !currentYear?.id || isSelfMode || (isEmployeeProfileMode && !employeeId) },
  });
  const {
    data: historyDataForSelf,
    isLoading: isHistoryLoadingForSelf,
    isFetching: isHistoryFetchingForSelf,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMyLeaveRequestsQuery,
    params: { academicYearId: currentYear?.id, page: 1, pageSize: 100 },
    options: { skip: !currentYear?.id || !isSelfMode },
  });
  const balanceData = isSelfMode ? balanceDataForSelf : balanceDataForHr;
  const historyData = isSelfMode ? historyDataForSelf : historyDataForHr;
  const isHistoryLoading = isSelfMode ? isHistoryLoadingForSelf : isHistoryLoadingForHr;
  const isHistoryFetching = isSelfMode ? isHistoryFetchingForSelf : isHistoryFetchingForHr;

  const mergedBalance: LeaveBalanceData = useMemo(() => {
    if (!balanceData?.items?.length) {
      return {
        totalLeaves: 0,
        usedLeaves: 0,
        remainingLeaves: 0,
        pendingLeaves: 0,
        leaveTypeBreakdown: [],
      };
    }
    const { items } = balanceData;
    const totalLeaves = items.reduce((sum: number, i: any) => sum + (i.entitledDays ?? 0), 0);
    const usedLeaves = items.reduce((sum: number, i: any) => sum + (i.usedDays ?? 0), 0);
    const remainingLeaves = items.reduce((sum: number, i: any) => sum + (i.remainingDays ?? 0), 0);
    const pendingLeaves = (historyData?.items ?? []).filter(
      (item: any) => normalizeLeaveStatus(item?.status) === 'PENDING'
    ).length;
    return {
      totalLeaves,
      usedLeaves,
      remainingLeaves,
      pendingLeaves,
      leaveTypeBreakdown: items.map((i: any) => ({
        leaveTypeId: i.leaveTypeMasterId,
        leaveTypeName: i.leaveTypeName ?? i.policyName ?? '-',
        total: i.entitledDays ?? 0,
        used: i.usedDays ?? 0,
        pending: (historyData?.items ?? []).filter((item: any) => {
          const matchesLeaveType = String(item?.leaveType ?? '') === String(i?.leaveTypeName ?? '');
          return matchesLeaveType && normalizeLeaveStatus(item?.status) === 'PENDING';
        }).length,
        remaining: i.remainingDays ?? 0,
      })),
    };
  }, [balanceData, historyData?.items]);

  const summaryCards = useMemo(() => SUMMARY_CARDS(mergedBalance), [mergedBalance]);

  const breakdownRows: LeaveTypeBreakdown[] = useMemo(
    () => mergedBalance.leaveTypeBreakdown,
    [mergedBalance]
  );

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

  const isLoadingBalance = isSelfMode
    ? isBalanceLoadingForSelf || isBalanceFetchingForSelf
    : isBalanceLoadingForHr || isBalanceFetchingForHr;

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
                  { name: 'Leave Management', href: hrPaths.leaveManagement.applyLeave },
                  { name: 'Leave Balance' },
                ]
          }
          description="View your leave quota, breakdown by leave type, and full leave history."
        />
      )}

      {/* ── Section A: Summary Stat Cards ── */}
      <Grid container spacing={1} sx={{ mt: 0.5 }}>
        {summaryCards.map((card) =>
          isLoadingBalance ? (
            <Grid size={{ xs: 6, sm: 3 }} key={card.title}>
              <Skeleton variant="rounded" height={82} sx={{ borderRadius: 2 }} />
            </Grid>
          ) : (
            <Grid size={{ xs: 6, sm: 3 }} key={card.title}>
              <DashboardCard
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
                bgColor={card.bgColor}
              />
            </Grid>
          )
        )}
      </Grid>

      {/* ── Section B: Leave Type Breakdown ── */}
      <Card sx={{ mt: 1, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Iconify
            icon="solar:pie-chart-2-bold-duotone"
            sx={{ color: 'primary.main', width: 22, height: 22 }}
          />
          <Typography variant="h6">Leave Type Breakdown</Typography>
          <CustomTooltip
            arrow
            placement="right"
            title="Shows allocation and usage per leave type. Red remaining balance means you are running low."
          >
            <Iconify
              icon="lucide:info"
              sx={{ cursor: 'pointer', ml: 0.5 }}
              fontSize={15}
              color="info.main"
            />
          </CustomTooltip>
        </Box>

        <CustomizableTable
          tableId="leave-balance-breakdown"
          columns={BREAKDOWN_COLUMNS}
          data={breakdownRows}
          isLoading={isLoadingBalance}
          isPagination={false}
          isSearch={false}
          isFilter={false}
          tableTitle="Leave Type Breakdown"
          noDataText={
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Iconify
                icon="solar:calendar-minimalistic-bold-duotone"
                sx={{ width: 48, height: 48, color: 'text.disabled', mb: 1 }}
              />
              <Typography color="text.secondary">
                No leave type allocation found for this year.
              </Typography>
            </Box>
          }
          wrapperProps={{ sx: { mt: 0 } }}
        />
      </Card>

      {/* ── Section C: My Leave History ── */}
      <Card sx={{ mt: 1, p: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Iconify
            icon="solar:history-bold-duotone"
            sx={{ color: 'primary.main', width: 22, height: 22 }}
          />
          <Typography variant="h6">
            {isEmployeeProfileMode ? 'Employee Leave History' : 'My Leave History'}
          </Typography>
        </Box>

        <CustomizableTable
          tableId="leave-balance-history"
          columns={historyColumns}
          data={historyRows}
          isLoading={isHistoryLoading || isHistoryFetching}
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
    </Box>
  );
};

export default LeaveBalance;

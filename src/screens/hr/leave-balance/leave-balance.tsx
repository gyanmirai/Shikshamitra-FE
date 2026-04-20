'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
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
import { useGetLeaveRequestsQuery, useGetMyLeaveBalanceQuery } from 'src/redux/hr/leaveApi';
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
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusOptions,
  EmployeeLeaveStatusTypeColor,
} from 'src/enums/employee-leave-status';

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

const DUMMY_BALANCE_DATA: LeaveBalanceData = {
  totalLeaves: 40,
  usedLeaves: 13,
  remainingLeaves: 25,
  pendingLeaves: 2,
  leaveTypeBreakdown: [
    {
      leaveTypeId: 'cl',
      leaveTypeName: 'Casual Leave (CL)',
      total: 12,
      used: 5,
      pending: 1,
      remaining: 6,
    },
    {
      leaveTypeId: 'sl',
      leaveTypeName: 'Sick Leave (SL)',
      total: 10,
      used: 2,
      pending: 0,
      remaining: 8,
    },
    {
      leaveTypeId: 'el',
      leaveTypeName: 'Earned Leave (EL)',
      total: 18,
      used: 6,
      pending: 1,
      remaining: 11,
    },
  ],
};

const DUMMY_HISTORY_ROWS = [
  {
    id: 'd1',
    appliedDate: '05-01-2026',
    leaveType: 'Casual Leave (CL)',
    startDate: '10-01-2026',
    endDate: '11-01-2026',
    totalDays: 2,
    reason: 'Personal work at home',
    status: EmployeeLeaveStatusType.Approved,
  },
  {
    id: 'd2',
    appliedDate: '01-02-2026',
    leaveType: 'Sick Leave (SL)',
    startDate: '02-02-2026',
    endDate: '02-02-2026',
    totalDays: 1,
    reason: 'Fever and cold',
    status: EmployeeLeaveStatusType.Pending,
  },
  {
    id: 'd3',
    appliedDate: '10-02-2026',
    leaveType: 'Earned Leave (EL)',
    startDate: '15-02-2026',
    endDate: '17-02-2026',
    totalDays: 3,
    reason: 'Family function out of city',
    status: EmployeeLeaveStatusType.Rejected,
  },
  {
    id: 'd4',
    appliedDate: '01-03-2026',
    leaveType: 'Casual Leave (CL)',
    startDate: '05-03-2026',
    endDate: '05-03-2026',
    totalDays: 1,
    reason: 'Bank related work',
    status: EmployeeLeaveStatusType.Approved,
  },
  {
    id: 'd5',
    appliedDate: '14-03-2026',
    leaveType: 'Earned Leave (EL)',
    startDate: '20-03-2026',
    endDate: '22-03-2026',
    totalDays: 3,
    reason: 'Vacation trip',
    status: EmployeeLeaveStatusType.Approved,
  },
  {
    id: 'd6',
    appliedDate: '01-04-2026',
    leaveType: 'Sick Leave (SL)',
    startDate: '03-04-2026',
    endDate: '03-04-2026',
    totalDays: 1,
    reason: 'Doctor appointment',
    status: EmployeeLeaveStatusType.Pending,
  },
];

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

const LeaveBalance = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    isFetching: isBalanceFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMyLeaveBalanceQuery,
    params: { academicYearId: currentYear?.id },
  });

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isFetching: isHistoryFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLeaveRequestsQuery,
    params: { academicYearId: currentYear?.id, page: 1, pageSize: 100 },
  });

  const mergedBalance: LeaveBalanceData = useMemo(
    () => balanceData ?? DUMMY_BALANCE_DATA,
    [balanceData]
  );

  const summaryCards = useMemo(() => SUMMARY_CARDS(mergedBalance), [mergedBalance]);

  const breakdownRows: LeaveTypeBreakdown[] = useMemo(
    () =>
      mergedBalance.leaveTypeBreakdown.length > 0
        ? mergedBalance.leaveTypeBreakdown
        : DUMMY_BALANCE_DATA.leaveTypeBreakdown,
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
          const color = EmployeeLeaveStatusTypeColor[
            value as EmployeeLeaveStatusType
          ] as LabelColor;
          return <Label color={color}>{EmployeeLeaveStatusType[value]}</Label>;
        },
      },
    ],
    []
  );

  const historyRows = useMemo(() => {
    const apiRows = (historyData?.items ?? []).map((item: any) => ({
      id: item.id,
      appliedDate: item.appliedDate ? dayjs(item.appliedDate).format('DD-MM-YYYY') : '-',
      leaveType: item.leaveType ?? '-',
      startDate: item.startDate ? dayjs(item.startDate).format('DD-MM-YYYY') : '-',
      endDate: item.endDate ? dayjs(item.endDate).format('DD-MM-YYYY') : '-',
      totalDays: item.totalDays ?? '-',
      reason: item.reason ?? item.description ?? '-',
      status: item.status,
    }));
    return [...apiRows, ...DUMMY_HISTORY_ROWS];
  }, [historyData]);

  const isLoadingBalance = isBalanceLoading || isBalanceFetching;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* Breadcrumbs */}
      <CustomBreadcrumbs
        heading="Leave Balance"
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Leave Management', href: hrPaths.leaveManagement.applyLeave },
          { name: 'Leave Balance' },
        ]}
        description="View your leave quota, breakdown by leave type, and full leave history."
      />

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
          <Typography variant="h6">My Leave History</Typography>
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
      </Card>
    </Box>
  );
};

export default LeaveBalance;

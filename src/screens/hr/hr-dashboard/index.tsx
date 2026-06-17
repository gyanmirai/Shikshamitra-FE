'use client';

import type { RootState } from 'src/redux/store';
import type { Theme, SxProps } from '@mui/material/styles';

import dayjs from 'dayjs';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import {
  useRejectLeaveRequestMutation,
  useApproveLeaveRequestMutation,
} from 'src/redux/hr/leaveApi';
import {
  Box,
  Card,
  Chip,
  Grid,
  Alert,
  Stack,
  Button,
  Avatar,
  Dialog,
  Divider,
  Skeleton,
  TextField,
  CardHeader,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  type HRDashboardSummary,
  type HRDashboardInsight,
  parseHRDashboardPayload,
  sanitizeHRDashboardSummary,
  type HRDashboardCelebration,
  type HRDashboardLeaveRequest,
  useGetHRDashboardPreviewQuery,
  useRefreshHRDashboardPreviewMutation,
} from 'src/redux/hr/hrDashboardApi';

import { HrDashboardPreviewShell } from './components/HrDashboardPreviewShell';
import { shouldShowDashboardSnapshotSkeleton } from './hr-dashboard-preview-state';
import { HrDashboardSnapshotEmptyState } from './components/HrDashboardSnapshotEmptyState';

const EmployeeProfileDashboard = dynamic(() => import('../employee/employee-dashboard'));

const hasRole = (role: unknown, expectedRole: string) => {
  if (Array.isArray(role)) {
    return role.some((item) => String(item).toLowerCase() === expectedRole);
  }

  return String(role || '').toLowerCase() === expectedRole;
};

const formatCount = (value?: number | null) => new Intl.NumberFormat('en-IN').format(value || 0);

type DashboardCardDimension = number | string | Record<string, number | string>;

const neutralStatusLabel = (payroll: HRDashboardSummary['payroll']) => {
  if (payroll.canLock) return 'Ready to lock';
  if (payroll.canPreview) return 'Review setup';
  return 'Setup required';
};

const insightIcon = (severity: string) =>
  severity === 'critical' || severity === 'warning'
    ? 'solar:info-circle-bold'
    : severity === 'success'
      ? 'solar:check-circle-bold'
      : 'solar:lightbulb-bold';

const dashboardSurfaceSx = {
  bgcolor: 'background.paper',
  boxShadow: (theme: Theme) => `0 8px 20px ${alpha(theme.palette.common.black, 0.08)}`,
  border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
};

const DashboardSectionCard = ({
  title,
  subheader,
  action,
  minHeight,
  height,
  contentSx,
  children,
}: {
  title: string;
  subheader?: string;
  action?: React.ReactNode;
  minHeight?: DashboardCardDimension;
  height?: DashboardCardDimension;
  contentSx?: SxProps<Theme>;
  children: React.ReactNode;
}) => (
  <Card
    sx={{
      height,
      minHeight,
      p: 2,
      overflow: 'visible',
      position: 'relative',
      ...dashboardSurfaceSx,
    }}
  >
    <CardHeader sx={{ p: 0, mb: 1.5 }} title={title} subheader={subheader} action={action} />
    <Box sx={contentSx}>{children}</Box>
  </Card>
);

const DashboardEmptyRow = ({
  icon = 'solar:check-circle-bold',
  children,
}: {
  icon?: string;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 1,
      bgcolor: 'background.neutral',
      border: (theme) => `1px solid ${theme.palette.divider}`,
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center">
      <Iconify icon={icon} width={20} sx={{ color: 'text.secondary', flexShrink: 0 }} />
      <Typography variant="body2" color="text.secondary">
        {children}
      </Typography>
    </Stack>
  </Box>
);

const DashboardSkeleton = () => (
  <Stack spacing={1.5}>
    <Grid container spacing={1.5}>
      {Array.from({ length: 8 }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
          <Skeleton variant="rounded" height={96} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Skeleton variant="rounded" height={340} />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Skeleton variant="rounded" height={340} />
      </Grid>
    </Grid>
  </Stack>
);

type TopSummaryTone = 'primary' | 'success' | 'info' | 'warning' | 'secondary';

const getToneMain = (theme: Theme, tone: TopSummaryTone) => theme.palette[tone].main;

const getToneContrast = (theme: Theme, tone: TopSummaryTone) =>
  theme.palette[tone].dark || theme.palette[tone].main;

const getPercent = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

const TopMetricTile = ({
  label,
  value,
  icon,
  helper,
  tone = 'primary',
  href,
  onClick,
}: {
  label: string;
  value: string | number;
  icon: string;
  helper?: string;
  tone?: TopSummaryTone;
  href?: string;
  onClick?: () => void;
}) => {
  const tileSx: SxProps<Theme> = {
    width: '100%',
    p: 1.25,
    minHeight: 86,
    borderRadius: 1,
    textAlign: 'left',
    color: 'text.primary',
    textDecoration: 'none',
    bgcolor: (theme: Theme) => alpha(getToneMain(theme, tone), 0.06),
    border: (theme: Theme) => `1px solid ${alpha(getToneMain(theme, tone), 0.18)}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    cursor: href || onClick ? 'pointer' : 'default',
    transition: (theme: Theme) =>
      theme.transitions.create(['background-color', 'border-color', 'transform'], {
        duration: theme.transitions.duration.shorter,
      }),
    ...(href || onClick
      ? {
          '&:hover': {
            transform: 'translateY(-1px)',
            bgcolor: (theme: Theme) => alpha(getToneMain(theme, tone), 0.1),
            borderColor: (theme: Theme) => alpha(getToneMain(theme, tone), 0.28),
          },
        }
      : {}),
  };

  const content = (
    <>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', fontWeight: 700, lineHeight: 1.2 }}
          noWrap
        >
          {label}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.25, lineHeight: 1.08 }}>
          {value}
        </Typography>
        {helper ? (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {helper}
          </Typography>
        ) : null}
      </Box>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          color: (theme) => getToneMain(theme, tone),
          bgcolor: (theme) => alpha(getToneMain(theme, tone), 0.1),
        }}
      >
        <Iconify icon={icon} width={19} />
      </Box>
    </>
  );

  if (href) {
    return (
      <Box component={Link} href={href} sx={tileSx}>
        {content}
      </Box>
    );
  }

  if (onClick) {
    return (
      <Box component="button" type="button" onClick={onClick} sx={tileSx}>
        {content}
      </Box>
    );
  }

  return <Box sx={tileSx}>{content}</Box>;
};

const CommandMetricRow = ({
  label,
  value,
  icon,
  tone = 'primary',
  helper,
  emphasis = false,
}: {
  label: string;
  value: string | number;
  icon: string;
  tone?: TopSummaryTone;
  helper?: string;
  emphasis?: boolean;
}) => (
  <Box
    sx={{
      px: 1.25,
      py: 1,
      borderRadius: 1,
      bgcolor: (theme) => alpha(getToneMain(theme, tone), emphasis ? 0.1 : 0.045),
      border: (theme) => `1px solid ${alpha(getToneMain(theme, tone), emphasis ? 0.26 : 0.14)}`,
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          color: (theme) => getToneMain(theme, tone),
          bgcolor: (theme) => alpha(getToneMain(theme, tone), 0.1),
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={17} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: emphasis ? 700 : 600 }} noWrap>
          {label}
        </Typography>
        {helper ? (
          <Typography variant="caption" color="text.secondary" noWrap>
            {helper}
          </Typography>
        ) : null}
      </Box>
      <Typography
        variant="h6"
        sx={{ lineHeight: 1, color: (theme) => getToneContrast(theme, tone) }}
      >
        {value}
      </Typography>
    </Stack>
  </Box>
);

const WorkforceSnapshotCard = ({
  data,
  onOpenCelebrations,
}: {
  data: HRDashboardSummary;
  onOpenCelebrations: () => void;
}) => {
  const theme = useTheme();
  const teachingCount = data.workforce.teachingStaff;
  const nonTeachingCount = data.workforce.nonTeachingStaff;
  const totalStaff = data.workforce.totalActiveStaff;
  const celebrationCount = data.celebrations.today.length + data.celebrations.upcoming.length;
  const workforceChartOptions = useChart({
    labels: ['Teaching', 'Non-Teaching'],
    colors: [theme.palette.primary.main, theme.palette.info.main],
    stroke: { width: 0 },
    legend: { show: false },
    tooltip: { y: { formatter: (value: number) => `${formatCount(value)} staff` } },
    plotOptions: {
      pie: {
        donut: {
          size: '74%',
          labels: {
            show: false,
          },
        },
      },
    },
  });

  return (
    <DashboardSectionCard
      title="Workforce Snapshot"
      subheader="Staff composition"
      height="100%"
      minHeight={236}
      action={
        <Button component={Link} href={hrPaths.employee.list} size="small">
          Directory
        </Button>
      }
    >
      <Stack spacing={1.25}>
        <Stack
          direction={{ xs: 'column', sm: 'row', lg: 'column', xl: 'row' }}
          spacing={1.25}
          alignItems="center"
        >
          <Box
            component={Link}
            href={hrPaths.employee.list}
            sx={{
              width: { xs: '100%', sm: 170, lg: '100%', xl: 170 },
              height: 158,
              position: 'relative',
              color: 'text.primary',
              textDecoration: 'none',
              display: 'grid',
              placeItems: 'center',
              borderRadius: 1,
              bgcolor: (muiTheme) => alpha(muiTheme.palette.primary.main, 0.035),
              border: (muiTheme) => `1px solid ${alpha(muiTheme.palette.primary.main, 0.14)}`,
            }}
          >
            <Chart
              type="donut"
              series={[teachingCount, nonTeachingCount]}
              options={workforceChartOptions}
              sx={{ width: 138, height: 138 }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ lineHeight: 1 }}>
                  {formatCount(totalStaff)}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Total Staff
                </Typography>
              </Box>
            </Box>
          </Box>

          <Stack spacing={1} sx={{ width: 1, minWidth: 0 }}>
            <CommandMetricRow
              label="Teaching"
              value={formatCount(teachingCount)}
              helper={`${getPercent(teachingCount, totalStaff)}% of staff`}
              icon="solar:square-academic-cap-bold"
              tone="primary"
            />
            <CommandMetricRow
              label="Non-Teaching"
              value={formatCount(nonTeachingCount)}
              helper={`${getPercent(nonTeachingCount, totalStaff)}% of staff`}
              icon="solar:case-round-bold"
              tone="info"
            />
          </Stack>
        </Stack>

        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TopMetricTile
              label="New Joiners"
              value={formatCount(data.workforce.newJoinersThisMonth)}
              helper="This month"
              icon="solar:user-plus-bold"
              tone="info"
              href={hrPaths.employee.list}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TopMetricTile
              label="Celebrations"
              value={formatCount(celebrationCount)}
              helper="Next 30 days"
              icon="solar:confetti-minimalistic-bold"
              tone="secondary"
              onClick={onOpenCelebrations}
            />
          </Grid>
        </Grid>
      </Stack>
    </DashboardSectionCard>
  );
};

const AttendancePulseCard = ({ data }: { data: HRDashboardSummary }) => {
  const latestLeaveCount = data.attendanceTrend.at(-1)?.leave || 0;
  const attendanceRate = Math.min(100, Math.max(0, data.attendanceToday.attendanceRate || 0));

  return (
    <DashboardSectionCard
      title="Today Attendance Pulse"
      subheader="Attendance Command Center"
      height="100%"
      minHeight={236}
      action={
        <Button
          component={Link}
          href={hrPaths.attendance.markAttendance}
          size="small"
          startIcon={<Iconify icon="solar:calendar-mark-linear" />}
        >
          Mark
        </Button>
      }
    >
      <Stack spacing={1.25}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.07),
            border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Attendance Marked
              </Typography>
              <Typography variant="h2" sx={{ lineHeight: 1 }}>
                {attendanceRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCount(data.attendanceToday.present)} present today
              </Typography>
            </Box>
            <Button
              component={Link}
              href={hrPaths.attendance.markAttendance}
              variant="contained"
              size="small"
              startIcon={<Iconify icon="solar:calendar-mark-bold" />}
              sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}
            >
              Mark Attendance
            </Button>
          </Stack>

          <Box sx={{ mt: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography variant="caption" color="text.secondary">
                Completion progress
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {attendanceRate}%
              </Typography>
            </Stack>
            <Box
              sx={{
                height: 10,
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.14),
              }}
            >
              <Box sx={{ width: `${attendanceRate}%`, height: 1, bgcolor: 'success.main' }} />
            </Box>
          </Box>
        </Box>

        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <CommandMetricRow
              label="Present"
              value={formatCount(data.attendanceToday.present)}
              icon="solar:user-check-bold"
              tone="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <CommandMetricRow
              label="Missing"
              value={formatCount(data.attendanceToday.missingAttendance)}
              helper="Needs marking"
              icon="solar:user-cross-bold"
              tone="warning"
              emphasis={data.attendanceToday.missingAttendance > 0}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 4 }}>
            <CommandMetricRow
              label="On Leave"
              value={formatCount(latestLeaveCount)}
              icon="solar:calendar-mark-bold"
              tone="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, xl: 6 }}>
            <CommandMetricRow
              label="Pending Leave"
              value={formatCount(data.leave.pending)}
              helper={`${formatCount(data.leave.approved)} approved`}
              icon="solar:clipboard-list-bold"
              tone="secondary"
              emphasis={data.leave.pending > 0}
            />
          </Grid>
          <Grid size={{ xs: 12, xl: 6 }}>
            <CommandMetricRow
              label="Exceptions"
              value={formatCount(data.attendanceToday.lateOrException)}
              helper="Late or irregular"
              icon="solar:clock-circle-bold"
              tone="warning"
              emphasis={data.attendanceToday.lateOrException > 0}
            />
          </Grid>
        </Grid>
      </Stack>
    </DashboardSectionCard>
  );
};

const PayrollSnapshotCard = ({ data }: { data: HRDashboardSummary }) => {
  const { payroll } = data;
  const reviewedPct = payroll.employeeCount
    ? Math.round(((payroll.reviewedCount + payroll.lockedCount) / payroll.employeeCount) * 100)
    : 0;
  const tone: TopSummaryTone = payroll.canLock
    ? 'success'
    : payroll.canPreview
      ? 'warning'
      : 'info';

  return (
    <DashboardSectionCard
      title="Payroll Readiness"
      subheader="Admin cycle status"
      height="100%"
      minHeight={236}
      action={
        <Chip
          size="small"
          variant="outlined"
          label={neutralStatusLabel(payroll)}
          sx={{
            color: (theme) => getToneMain(theme, tone),
            borderColor: (theme) => alpha(getToneMain(theme, tone), 0.32),
            bgcolor: (theme) => alpha(getToneMain(theme, tone), 0.06),
            fontWeight: 700,
          }}
        />
      }
    >
      <Stack spacing={1.25}>
        <Box
          component={Link}
          href={hrPaths.payroll.runPayroll}
          sx={{
            p: 1.5,
            borderRadius: 1,
            color: 'text.primary',
            textDecoration: 'none',
            bgcolor: (theme) => alpha(getToneMain(theme, tone), 0.06),
            border: (theme) => `1px solid ${alpha(getToneMain(theme, tone), 0.18)}`,
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  {payroll.month || data.month}
                </Typography>
                <Typography variant="h3" sx={{ lineHeight: 1.05 }}>
                  {payroll.canLock ? 'Ready' : payroll.canPreview ? 'Review' : 'Setup'}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  color: (theme) => getToneMain(theme, tone),
                  bgcolor: (theme) => alpha(getToneMain(theme, tone), 0.1),
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:wallet-money-bold" width={24} />
              </Box>
            </Stack>

            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Review Progress
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  {reviewedPct}%
                </Typography>
              </Stack>
              <Box
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: (theme) => alpha(getToneMain(theme, tone), 0.13),
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: `${reviewedPct}%`,
                    height: 1,
                    bgcolor: (theme) => getToneMain(theme, tone),
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </Box>

        <Grid container spacing={1}>
          <Grid size={{ xs: 6 }}>
            <TopMetricTile
              label="Reviewed"
              value={formatCount(payroll.reviewedCount + payroll.lockedCount)}
              icon="solar:check-circle-bold"
              tone="success"
              href={hrPaths.payroll.runPayroll}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TopMetricTile
              label="Pending"
              value={formatCount(payroll.pendingCount)}
              icon="solar:clipboard-list-bold"
              tone={payroll.pendingCount > 0 ? 'warning' : 'info'}
              href={hrPaths.payroll.runPayroll}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TopMetricTile
              label="Setup Gaps"
              value={formatCount(
                payroll.missingAttendanceCount + payroll.missingSalaryStructureCount
              )}
              helper="Attendance or salary setup"
              icon="solar:danger-triangle-bold"
              tone="warning"
              href={hrPaths.payroll.runPayroll}
            />
          </Grid>
        </Grid>
      </Stack>
    </DashboardSectionCard>
  );
};

const AttendanceTrendCard = ({ data }: { data: HRDashboardSummary }) => {
  const theme = useTheme();
  const totalStaff = data.workforce.totalActiveStaff;
  const categories = data.attendanceTrend.map((point) => dayjs(point.date).format('ddd'));
  const latestTrend = data.attendanceTrend.at(-1);
  const latestRate =
    data.attendanceToday.attendanceRate || getPercent(latestTrend?.present || 0, totalStaff);
  const trendPercent = (value: number) => getPercent(value, totalStaff);
  const chartOptions = useChart({
    colors: [
      alpha(theme.palette.success.main, 0.82),
      alpha(theme.palette.warning.main, 0.72),
      alpha(theme.palette.info.main, 0.68),
    ],
    stroke: { width: 2.5, curve: 'smooth' },
    markers: { size: 4, hover: { size: 6 } },
    xaxis: { categories },
    yaxis: {
      min: 0,
      max: 100,
      labels: { formatter: (value: number) => `${Math.round(value)}%` },
    },
    tooltip: { y: { formatter: (value: number) => `${value}%` } },
    legend: { show: true, position: 'top', horizontalAlign: 'right' },
    grid: { padding: { top: 0, right: 8, bottom: 0, left: 0 } },
    highcharts: {
      xAxis: {
        labels: {
          enabled: true,
          reserveSpace: true,
        },
      },
    },
  });

  return (
    <DashboardSectionCard
      title="Attendance Trend"
      subheader={`${data.range}-Day Attendance Overview`}
      height="100%"
      minHeight={{ xs: 340, md: 360, lg: 380 }}
      action={
        <Button
          component={Link}
          href={hrPaths.attendance.markAttendance}
          size="small"
          startIcon={<Iconify icon="solar:calendar-mark-linear" />}
        >
          Mark
        </Button>
      }
    >
      <Stack spacing={1.25}>
        {data.attendanceTrend.length ? (
          <Chart
            type="line"
            height="100%"
            series={[
              {
                name: 'Present',
                data: data.attendanceTrend.map((point) => trendPercent(point.present)),
              },
              {
                name: 'Absent',
                data: data.attendanceTrend.map((point) => trendPercent(point.absent)),
              },
              {
                name: 'On Leave',
                data: data.attendanceTrend.map((point) => trendPercent(point.leave)),
              },
            ]}
            options={chartOptions}
            sx={{ height: { xs: 210, md: 230, lg: 250 } }}
          />
        ) : (
          <Alert severity="info">No attendance trend data is available for this range.</Alert>
        )}

        <Box
          sx={{
            p: 1.25,
            borderRadius: 1,
            bgcolor: (muiTheme) =>
              alpha(
                latestRate < 60 || data.attendanceToday.missingAttendance > 0
                  ? muiTheme.palette.warning.main
                  : muiTheme.palette.success.main,
                0.07
              ),
            border: (muiTheme) =>
              `1px solid ${alpha(
                latestRate < 60 || data.attendanceToday.missingAttendance > 0
                  ? muiTheme.palette.warning.main
                  : muiTheme.palette.success.main,
                0.18
              )}`,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={0.75}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify
                icon={
                  latestRate < 60 || data.attendanceToday.missingAttendance > 0
                    ? 'solar:danger-triangle-bold'
                    : 'solar:check-circle-bold'
                }
                width={19}
                sx={{
                  color:
                    latestRate < 60 || data.attendanceToday.missingAttendance > 0
                      ? 'warning.main'
                      : 'success.main',
                }}
              />
              <Typography variant="subtitle2">
                Latest day: {latestTrend ? dayjs(latestTrend.date).format('DD MMM') : 'Today'}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {latestRate}% marked / {formatCount(data.attendanceToday.missingAttendance)} missing
            </Typography>
          </Stack>
        </Box>

        <Grid container spacing={1}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <CommandMetricRow
              label="Present"
              value={formatCount(data.attendanceToday.present)}
              icon="solar:user-check-bold"
              tone="success"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <CommandMetricRow
              label="Missing"
              value={formatCount(data.attendanceToday.missingAttendance)}
              icon="solar:user-cross-bold"
              tone="warning"
              emphasis={data.attendanceToday.missingAttendance > 0}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <CommandMetricRow
              label="Exceptions"
              value={formatCount(data.attendanceToday.lateOrException)}
              icon="solar:clock-circle-bold"
              tone="warning"
              emphasis={data.attendanceToday.lateOrException > 0}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <CommandMetricRow
              label="On leave"
              value={formatCount(latestTrend?.leave || 0)}
              icon="solar:calendar-mark-bold"
              tone="info"
            />
          </Grid>
        </Grid>
      </Stack>
    </DashboardSectionCard>
  );
};

const PayrollReadinessCard = ({ data }: { data: HRDashboardSummary }) => {
  const { payroll } = data;
  const reviewedPct = payroll.employeeCount
    ? Math.round(((payroll.reviewedCount + payroll.lockedCount) / payroll.employeeCount) * 100)
    : 0;
  const tone: TopSummaryTone = payroll.canLock
    ? 'success'
    : payroll.canPreview
      ? 'warning'
      : 'info';
  const advisoryText = payroll.blockingIssues.length
    ? 'Payroll setup needs review before locking this month.'
    : payroll.recommendedActions[0] || 'Payroll setup needs review before locking this month.';

  return (
    <DashboardSectionCard
      title="Payroll Readiness"
      subheader={payroll.month || data.month}
      height="100%"
      action={
        <Chip
          size="small"
          variant="outlined"
          label={neutralStatusLabel(payroll)}
          sx={{
            color: (theme) => getToneMain(theme, tone),
            borderColor: (theme) => alpha(getToneMain(theme, tone), 0.32),
            bgcolor: (theme) => alpha(getToneMain(theme, tone), 0.06),
            fontWeight: 700,
          }}
        />
      }
    >
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label={`${formatCount(payroll.reviewedCount)} reviewed`}
            variant="outlined"
            sx={{
              color: 'success.main',
              borderColor: (theme) => alpha(theme.palette.success.main, 0.28),
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.045),
            }}
          />
          <Chip
            label={`${formatCount(payroll.lockedCount)} locked`}
            variant="outlined"
            sx={{
              color: 'info.main',
              borderColor: (theme) => alpha(theme.palette.info.main, 0.28),
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.045),
            }}
          />
          <Chip
            label={`${formatCount(payroll.pendingCount)} pending`}
            variant="outlined"
            sx={{
              color: payroll.pendingCount > 0 ? 'warning.main' : 'text.secondary',
              borderColor: (theme) =>
                alpha(
                  payroll.pendingCount > 0 ? theme.palette.warning.main : theme.palette.grey[500],
                  0.24
                ),
              bgcolor: (theme) =>
                alpha(
                  payroll.pendingCount > 0 ? theme.palette.warning.main : theme.palette.grey[500],
                  0.045
                ),
            }}
          />
        </Stack>
        <Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Payroll review progress
            </Typography>
            <Typography variant="caption" fontWeight={700}>
              {reviewedPct}%
            </Typography>
          </Stack>
          <Box
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: (theme) => alpha(getToneMain(theme, tone), 0.12),
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${reviewedPct}%`,
                height: 1,
                bgcolor: (theme) => getToneMain(theme, tone),
              }}
            />
          </Box>
        </Box>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
            <CommandMetricRow
              label="Missing attendance"
              value={formatCount(payroll.missingAttendanceCount)}
              icon="solar:calendar-remove-bold"
              tone="warning"
              emphasis={payroll.missingAttendanceCount > 0}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
            <CommandMetricRow
              label="Missing salary setup"
              value={formatCount(payroll.missingSalaryStructureCount)}
              icon="solar:wallet-money-bold"
              tone="warning"
              emphasis={payroll.missingSalaryStructureCount > 0}
            />
          </Grid>
        </Grid>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: (theme) => alpha(getToneMain(theme, tone), 0.055),
            border: (theme) => `1px solid ${alpha(getToneMain(theme, tone), 0.18)}`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Iconify
              icon="solar:info-circle-bold"
              width={20}
              sx={{ color: (theme) => getToneMain(theme, tone), mt: 0.25, flexShrink: 0 }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2">{neutralStatusLabel(payroll)}</Typography>
              <Typography variant="body2" color="text.secondary">
                {payroll.canLock ? 'Payroll is ready for the current cycle.' : advisoryText}
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            component={Link}
            href={hrPaths.payroll.runPayroll}
            variant="contained"
            size="small"
            startIcon={<Iconify icon="solar:play-circle-bold" />}
          >
            Open payroll
          </Button>
          <Button
            component={Link}
            href={hrPaths.payroll.structure}
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="solar:settings-linear" />}
          >
            Salary structures
          </Button>
        </Stack>
      </Stack>
    </DashboardSectionCard>
  );
};

const LeaveActionCenter = ({ requests }: { requests: HRDashboardLeaveRequest[] }) => {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canApprove = hasGrantedPermission(permissions, hrPermissions.leaveManagement.approvals);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<{
    request: HRDashboardLeaveRequest;
    action: 'approve' | 'reject';
  } | null>(null);
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState('');
  const [approveLeave] = useApproveLeaveRequestMutation();
  const [rejectLeave] = useRejectLeaveRequestMutation();

  const openReviewAction = (request: HRDashboardLeaveRequest, action: 'approve' | 'reject') => {
    setRemarks('');
    setRemarksError('');
    setReviewAction({ request, action });
  };

  const resetReviewAction = () => {
    setReviewAction(null);
    setRemarks('');
    setRemarksError('');
  };

  const closeReviewAction = () => {
    if (busyId) return;
    resetReviewAction();
  };

  const runAction = async () => {
    if (!reviewAction) return;

    if (reviewAction.action === 'reject' && !remarks.trim()) {
      setRemarksError('Remarks are required to reject the leave request.');
      return;
    }

    setBusyId(`${reviewAction.action}-${reviewAction.request.id}`);
    try {
      if (reviewAction.action === 'approve') {
        await approveLeave({
          id: reviewAction.request.id,
          body: { remarks: remarks.trim() },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Leave approved.' });
      } else {
        await rejectLeave({
          id: reviewAction.request.id,
          body: { remarks: remarks.trim() },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Leave rejected.' });
      }
      resetReviewAction();
    } catch (error: any) {
      shikshaMitraToast.error({ message: error?.data?.message || 'Leave action failed.' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardSectionCard
      title="Pending Leave Approvals"
      subheader={`${requests.length} recent requests`}
      height="100%"
      minHeight={260}
      action={
        <Button component={Link} href={hrPaths.leaveManagement.approvals} size="small">
          View all
        </Button>
      }
    >
      {requests.length ? (
        <Scrollbar sx={{ maxHeight: 260 }}>
          <Stack spacing={1}>
            {requests.map((request) => (
              <Box
                key={request.id}
                sx={{ p: 1.25, borderRadius: 1, bgcolor: 'background.neutral' }}
              >
                <Stack spacing={0.75}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {request.employeeName.charAt(0)}
                      </Avatar>
                      <Typography variant="subtitle2" noWrap>
                        {request.employeeName}
                      </Typography>
                    </Stack>
                    {canApprove ? (
                      <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                        <LoadingButton
                          size="small"
                          color="success"
                          variant="outlined"
                          loading={busyId === `approve-${request.id}`}
                          onClick={() => openReviewAction(request, 'approve')}
                          sx={{ height: 26, fontSize: '0.75rem', px: 1 }}
                        >
                          Approve
                        </LoadingButton>
                        <LoadingButton
                          size="small"
                          color="error"
                          variant="outlined"
                          loading={busyId === `reject-${request.id}`}
                          onClick={() => openReviewAction(request, 'reject')}
                          sx={{ height: 26, fontSize: '0.75rem', px: 1 }}
                        >
                          Reject
                        </LoadingButton>
                      </Stack>
                    ) : null}
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ pl: '40px', display: 'block' }}
                  >
                    {request.paidType ?? request.leaveType} • {request.totalDays} day(s) •{' '}
                    {dayjs(request.startDate).format('DD MMM')} -{' '}
                    {dayjs(request.endDate).format('DD MMM')}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Scrollbar>
      ) : (
        <DashboardEmptyRow>No pending leave approvals.</DashboardEmptyRow>
      )}
      <Dialog open={!!reviewAction} onClose={() => closeReviewAction()} fullWidth maxWidth="sm">
        <DialogTitle>
          {reviewAction?.action === 'reject' ? 'Reject Leave Request' : 'Approve Leave Request'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            {reviewAction ? (
              <Alert severity={reviewAction.action === 'reject' ? 'warning' : 'info'}>
                {reviewAction.request.employeeName} •{' '}
                {reviewAction.request.paidType ?? reviewAction.request.leaveType} •{' '}
                {dayjs(reviewAction.request.startDate).format('DD MMM')} -{' '}
                {dayjs(reviewAction.request.endDate).format('DD MMM')}
              </Alert>
            ) : null}
            <TextField
              fullWidth
              multiline
              minRows={4}
              name="remarks"
              label={reviewAction?.action === 'reject' ? 'Remarks *' : 'Remarks'}
              value={remarks}
              onChange={(event) => {
                setRemarks(event.target.value);
                if (remarksError) setRemarksError('');
              }}
              error={!!remarksError}
              helperText={remarksError || ' '}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeReviewAction()} disabled={!!busyId}>
            Cancel
          </Button>
          <LoadingButton
            color={reviewAction?.action === 'reject' ? 'error' : 'success'}
            variant="contained"
            loading={!!busyId}
            onClick={runAction}
          >
            {reviewAction?.action === 'reject' ? 'Reject' : 'Approve'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </DashboardSectionCard>
  );
};

const InsightRow = ({ insight }: { insight: HRDashboardInsight }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 1,
      bgcolor: 'background.neutral',
      border: (theme) => `1px solid ${theme.palette.divider}`,
    }}
  >
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'flex-start' }}
      justifyContent="space-between"
      spacing={1}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            color: 'text.secondary',
            bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.08),
            flexShrink: 0,
          }}
        >
          <Iconify icon={insightIcon(insight.severity)} width={18} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2">{insight.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {insight.summary}
          </Typography>
        </Box>
      </Stack>
      {insight.actionHref ? (
        <Button
          component={Link}
          href={insight.actionHref}
          size="small"
          variant="text"
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}
        >
          {insight.actionLabel || 'Open'}
        </Button>
      ) : null}
    </Stack>
  </Box>
);

const InsightCenter = ({ insights }: { insights: HRDashboardInsight[] }) => (
  <DashboardSectionCard
    title="Smart HR Insights"
    subheader="Deterministic recommendations"
    height="100%"
    minHeight={220}
  >
    {insights.length ? (
      <Stack spacing={1}>
        {insights.map((insight, index) => (
          <InsightRow key={`${insight.source}-${index}`} insight={insight} />
        ))}
      </Stack>
    ) : (
      <DashboardEmptyRow>No urgent HR actions detected.</DashboardEmptyRow>
    )}
  </DashboardSectionCard>
);

const CelebrationsCard = ({
  celebrations,
  dashboardDate,
}: {
  celebrations: { today: HRDashboardCelebration[]; upcoming: HRDashboardCelebration[] };
  dashboardDate: string;
}) => {
  const items = [...celebrations.today, ...celebrations.upcoming].slice(0, 8);
  return (
    <DashboardSectionCard
      title="Celebrations"
      subheader="Birthdays and work anniversaries"
      height="100%"
      minHeight={260}
    >
      {items.length ? (
        <Stack spacing={1}>
          {items.map((item) => (
            <Stack
              key={`${item.employeeId}-${item.type}-${item.date}`}
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Avatar sx={{ width: 34, height: 34 }}>{item.employeeName.charAt(0)}</Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" noWrap>
                  {item.employeeName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.type}
                  {item.years ? ` • ${item.years} years` : ''} • {dayjs(item.date).format('DD MMM')}
                </Typography>
              </Box>
              <Chip
                size="small"
                label={dayjs(item.date).isSame(dayjs(dashboardDate), 'day') ? 'Today' : 'Upcoming'}
                variant="outlined"
              />
            </Stack>
          ))}
        </Stack>
      ) : (
        <DashboardEmptyRow icon="solar:calendar-linear">
          No upcoming celebrations in the next 30 days.
        </DashboardEmptyRow>
      )}
    </DashboardSectionCard>
  );
};

const UpcomingCelebrationsDialog = ({
  open,
  onClose,
  celebrations,
  dashboardDate,
}: {
  open: boolean;
  onClose: () => void;
  celebrations: { today: HRDashboardCelebration[]; upcoming: HRDashboardCelebration[] };
  dashboardDate: string;
}) => {
  const items = [...celebrations.today, ...celebrations.upcoming];
  const visibleItems = items.slice(0, 4);
  const hiddenCount = Math.max(items.length - visibleItems.length, 0);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Upcoming Celebrations</DialogTitle>
      <DialogContent>
        {visibleItems.length ? (
          <Stack spacing={1.25} sx={{ pt: 0.5 }}>
            {visibleItems.map((item) => {
              const isToday = dayjs(item.date).isSame(dayjs(dashboardDate), 'day');

              return (
                <Box
                  key={`${item.employeeId}-${item.type}-${item.date}`}
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: (theme) =>
                      alpha(isToday ? theme.palette.secondary.main : theme.palette.info.main, 0.06),
                    border: (theme) =>
                      `1px solid ${alpha(
                        isToday ? theme.palette.secondary.main : theme.palette.info.main,
                        0.18
                      )}`,
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: (theme) =>
                          alpha(
                            isToday ? theme.palette.secondary.main : theme.palette.info.main,
                            0.16
                          ),
                        color: isToday ? 'secondary.dark' : 'info.dark',
                      }}
                    >
                      {item.employeeName.charAt(0)}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle2" noWrap>
                        {item.employeeName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.employeeIdentifier} - {item.type}
                        {item.years ? ` - ${item.years} years` : ''} -{' '}
                        {dayjs(item.date).format('DD MMM')}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={isToday ? 'Today' : 'Upcoming'}
                      variant="outlined"
                      sx={{
                        flexShrink: 0,
                        borderColor: (theme) =>
                          alpha(
                            isToday ? theme.palette.secondary.main : theme.palette.info.main,
                            0.36
                          ),
                        color: isToday ? 'secondary.main' : 'info.main',
                        bgcolor: (theme) =>
                          alpha(
                            isToday ? theme.palette.secondary.main : theme.palette.info.main,
                            0.06
                          ),
                      }}
                    />
                  </Stack>
                </Box>
              );
            })}

            {hiddenCount ? (
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                  border: (theme) => `1px dashed ${theme.palette.divider}`,
                }}
              >
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  +{formatCount(hiddenCount)} more in the next 30 days
                </Typography>
              </Box>
            ) : null}
          </Stack>
        ) : (
          <DashboardEmptyRow icon="solar:calendar-linear">
            No upcoming celebrations in the next 30 days.
          </DashboardEmptyRow>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const StaffSnapshotCard = ({
  employees,
}: {
  employees: HRDashboardSummary['workforce']['recentEmployees'];
}) => (
  <DashboardSectionCard
    title="Staff Snapshot"
    subheader="Recently added active staff"
    height="100%"
    minHeight={260}
    action={
      <Button component={Link} href={hrPaths.employee.list} size="small">
        Directory
      </Button>
    }
  >
    {employees.length ? (
      <Stack divider={<Divider flexItem />} spacing={1}>
        {employees.map((employee) => (
          <Stack key={employee.id} direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ width: 34, height: 34 }}>{employee.name.charAt(0)}</Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {employee.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {employee.employeeIdentifier} •{' '}
                {employee.roleName ||
                  employee.department ||
                  (employee.isTeaching ? 'Teaching' : 'Non-teaching')}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    ) : (
      <DashboardEmptyRow icon="solar:user-linear">No active staff records found.</DashboardEmptyRow>
    )}
  </DashboardSectionCard>
);

const AdminDashboard = () => {
  const [isCelebrationsDialogOpen, setIsCelebrationsDialogOpen] = useState(false);
  const {
    data: preview,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetHRDashboardPreviewQuery('Main', { pollingInterval: 0 });
  const [refreshPreview, { isLoading: isRefreshStarting }] = useRefreshHRDashboardPreviewMutation();
  const data = useMemo(
    () => sanitizeHRDashboardSummary(parseHRDashboardPayload<HRDashboardSummary>(preview)),
    [preview]
  );

  useEffect(() => {
    if (preview?.status !== 'Refreshing') return undefined;
    const id = window.setInterval(() => refetch(), 5000);
    return () => window.clearInterval(id);
  }, [preview?.status, refetch]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      >
        HR dashboard data could not be loaded.
      </Alert>
    );
  }

  if (!data) {
    const shouldShowSkeleton = shouldShowDashboardSnapshotSkeleton({
      status: preview?.status,
      isFetching,
      hasPreview: Boolean(preview),
    });

    return (
      <HrDashboardPreviewShell
        title="HR Dashboard"
        preview={preview}
        isFetching={isFetching}
        isRefreshing={isRefreshStarting}
        onRefresh={() => refreshPreview('Main')}
      >
        {shouldShowSkeleton ? (
          <DashboardSkeleton />
        ) : (
          <HrDashboardSnapshotEmptyState
            status={preview?.status}
            isRefreshing={isRefreshStarting}
          />
        )}
      </HrDashboardPreviewShell>
    );
  }

  return (
    <HrDashboardPreviewShell
      title="HR Dashboard"
      subtitle={`Stored staff operations preview for ${dayjs(data.date).format('DD MMM YYYY')}`}
      preview={preview}
      isFetching={isFetching}
      isRefreshing={isRefreshStarting}
      onRefresh={() => refreshPreview('Main')}
      actions={
        <>
          <Button
            component={Link}
            href={hrPaths.employee.list}
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="solar:user-plus-linear" />}
            sx={{ minHeight: 34 }}
          >
            Add employee
          </Button>
          <Button
            component={Link}
            href={hrPaths.reports}
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="solar:chart-2-linear" />}
            sx={{ minHeight: 34 }}
          >
            Reports
          </Button>
        </>
      }
    >
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <WorkforceSnapshotCard
            data={data}
            onOpenCelebrations={() => setIsCelebrationsDialogOpen(true)}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <AttendancePulseCard data={data} />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <PayrollSnapshotCard data={data} />
        </Grid>
      </Grid>

      <Grid container spacing={1.5} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 6 }}>
          <AttendanceTrendCard data={data} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <PayrollReadinessCard data={data} />
        </Grid>
      </Grid>

      <Grid container spacing={1.5} alignItems="stretch">
        <Grid size={{ xs: 12 }}>
          <InsightCenter insights={data.insights} />
        </Grid>
      </Grid>

      <Grid container spacing={1.5} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 4 }}>
          <LeaveActionCenter requests={data.leave.recentPendingRequests} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <CelebrationsCard celebrations={data.celebrations} dashboardDate={data.date} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StaffSnapshotCard employees={data.workforce.recentEmployees} />
        </Grid>
      </Grid>

      <UpcomingCelebrationsDialog
        open={isCelebrationsDialogOpen}
        onClose={() => setIsCelebrationsDialogOpen(false)}
        celebrations={data.celebrations}
        dashboardDate={data.date}
      />
    </HrDashboardPreviewShell>
  );
};

const HRDashboardScreen = () => {
  const { data: session } = useSession() as any;
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const isAdminUser = hasRole(session?.profile?.role, 'admin');
  const canViewHRDashboard = hasGrantedPermission(permissions, hrPermissions.dashboard);

  if (!isAdminUser && !canViewHRDashboard) {
    return <EmployeeProfileDashboard editData={{}} />;
  }

  return <AdminDashboard />;
};

export default HRDashboardScreen;

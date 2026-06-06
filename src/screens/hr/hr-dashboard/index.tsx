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
import { RouterLink } from 'src/routes/components';
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

type DashboardMetric = {
  title: string;
  value: string | number;
  icon: string;
  href?: string;
  helper?: string;
};

type DashboardCardDimension = number | string | Record<string, number | string>;

const neutralStatusLabel = (payroll: HRDashboardSummary['payroll']) => {
  if (payroll.canLock) return 'Ready to lock';
  if (payroll.canPreview) return 'Review setup';
  return 'Setup required';
};

const payrollReadinessValue = (payroll: HRDashboardSummary['payroll']) => {
  if (payroll.canLock) return 'Ready';
  if (payroll.canPreview) return 'Review';
  return 'Setup';
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

const MetricCard = ({
  title,
  value,
  icon,
  href,
  helper,
}: {
  title: string;
  value: string | number;
  icon: string;
  href?: string;
  helper?: string;
}) => (
  <Card
    component={href ? RouterLink : 'div'}
    href={href || undefined}
    sx={{
      p: 0,
      minHeight: 92,
      textDecoration: 'none',
      color: 'text.primary',
      overflow: 'hidden',
      display: 'block',
      ...dashboardSurfaceSx,
      transition: (theme) =>
        theme.transitions.create(['border-color', 'box-shadow', 'transform'], {
          duration: theme.transitions.duration.shorter,
        }),
      '&:hover': href
        ? {
            transform: 'translateY(-2px)',
            borderColor: (theme) => alpha(theme.palette.text.secondary, 0.36),
            boxShadow: (theme) => `0 10px 22px ${alpha(theme.palette.common.black, 0.1)}`,
          }
        : undefined,
    }}
  >
    <Box
      sx={{
        p: 1.5,
        gap: 1.25,
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700, lineHeight: 1.2, display: 'block' }}
          noWrap
        >
          {title}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.25, mb: 0.25, lineHeight: 1.05 }}>
          {value}
        </Typography>
        {helper ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
            {helper}
          </Typography>
        ) : null}
      </Box>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          color: 'text.secondary',
          bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.08),
          border: (theme) => `1px solid ${alpha(theme.palette.text.secondary, 0.14)}`,
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={22} />
      </Box>
    </Box>
  </Card>
);

const DashboardStatTile = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: string;
}) => (
  <Box
    sx={{
      p: 1.25,
      borderRadius: 1,
      bgcolor: 'background.neutral',
      border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.9)}`,
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center">
      {icon ? (
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            display: 'grid',
            flexShrink: 0,
            placeItems: 'center',
            color: 'text.secondary',
            bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.08),
          }}
        >
          <Iconify icon={icon} width={16} />
        </Box>
      ) : null}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" noWrap>
          {label}
        </Typography>
        <Typography variant="subtitle1" sx={{ lineHeight: 1.15 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  </Box>
);

const AttendanceTrendCard = ({ data }: { data: HRDashboardSummary }) => {
  const theme = useTheme();
  const categories = data.attendanceTrend.map((point) => dayjs(point.date).format('DD MMM'));
  const latestTrend = data.attendanceTrend.at(-1);
  const chartOptions = useChart({
    colors: [
      alpha(theme.palette.info.main, 0.72),
      alpha(theme.palette.text.secondary, 0.58),
      alpha(theme.palette.text.primary, 0.36),
    ],
    stroke: { width: 2.5, curve: 'smooth' },
    markers: { size: 3 },
    xaxis: { categories },
    yaxis: { min: 0 },
    tooltip: { y: { formatter: (value: number) => `${value} staff` } },
    legend: { position: 'top', horizontalAlign: 'right' },
  });

  return (
    <DashboardSectionCard
      title="Attendance Trend"
      subheader={`${data.range}-day staff attendance view`}
      height="100%"
      minHeight={{ xs: 280, md: 290, lg: 300 }}
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
              { name: 'Present', data: data.attendanceTrend.map((point) => point.present) },
              { name: 'Absent', data: data.attendanceTrend.map((point) => point.absent) },
              { name: 'On Leave', data: data.attendanceTrend.map((point) => point.leave) },
            ]}
            options={chartOptions}
            sx={{ height: { xs: 190, md: 205, lg: 215 } }}
          />
        ) : (
          <Alert severity="info">No attendance trend data is available for this range.</Alert>
        )}
        <Grid container spacing={1}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DashboardStatTile
              label="Present"
              value={formatCount(data.attendanceToday.present)}
              icon="solar:user-check-bold"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DashboardStatTile
              label="Missing"
              value={formatCount(data.attendanceToday.missingAttendance)}
              icon="solar:user-cross-bold"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DashboardStatTile
              label="Exceptions"
              value={formatCount(data.attendanceToday.lateOrException)}
              icon="solar:clock-circle-bold"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DashboardStatTile
              label="On leave"
              value={formatCount(latestTrend?.leave || 0)}
              icon="solar:calendar-mark-bold"
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
            color: 'text.secondary',
            borderColor: 'divider',
            bgcolor: 'background.neutral',
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
            sx={{ color: 'text.secondary', borderColor: 'divider' }}
          />
          <Chip
            label={`${formatCount(payroll.lockedCount)} locked`}
            variant="outlined"
            sx={{ color: 'text.secondary', borderColor: 'divider' }}
          />
          <Chip
            label={`${formatCount(payroll.pendingCount)} pending`}
            variant="outlined"
            sx={{ color: 'text.secondary', borderColor: 'divider' }}
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
            sx={{ height: 8, borderRadius: 1, bgcolor: 'background.neutral', overflow: 'hidden' }}
          >
            <Box
              sx={{
                width: `${reviewedPct}%`,
                height: 1,
                bgcolor: 'text.secondary',
              }}
            />
          </Box>
        </Box>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
            <DashboardStatTile
              label="Missing attendance"
              value={formatCount(payroll.missingAttendanceCount)}
              icon="solar:calendar-remove-bold"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
            <DashboardStatTile
              label="Missing salary setup"
              value={formatCount(payroll.missingSalaryStructureCount)}
              icon="solar:wallet-money-bold"
            />
          </Grid>
        </Grid>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: 'background.neutral',
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Iconify
              icon="solar:info-circle-bold"
              width={20}
              sx={{ color: 'text.secondary', mt: 0.25, flexShrink: 0 }}
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

const TodayOperationsCard = ({ data }: { data: HRDashboardSummary }) => (
  <DashboardSectionCard
    title="Today's Operations"
    subheader="Compact staff operations pulse"
    height="100%"
    minHeight={220}
  >
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DashboardStatTile
          label="Attendance rate"
          value={`${data.attendanceToday.attendanceRate}%`}
          icon="solar:chart-bold"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DashboardStatTile
          label="Pending leave"
          value={formatCount(data.leave.pending)}
          icon="solar:clipboard-list-bold"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DashboardStatTile
          label="Teaching staff"
          value={formatCount(data.workforce.teachingStaff)}
          icon="solar:users-group-rounded-bold"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DashboardStatTile
          label="New joiners"
          value={formatCount(data.workforce.newJoinersThisMonth)}
          icon="solar:user-plus-bold"
        />
      </Grid>
    </Grid>
  </DashboardSectionCard>
);

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
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                    <Avatar sx={{ width: 36, height: 36 }}>{request.employeeName.charAt(0)}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap>
                        {request.employeeName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {request.leaveType} • {request.totalDays} day(s) •{' '}
                        {dayjs(request.startDate).format('DD MMM')} -{' '}
                        {dayjs(request.endDate).format('DD MMM')}
                      </Typography>
                    </Box>
                  </Stack>
                  {canApprove ? (
                    <Stack direction="row" spacing={0.5}>
                      <LoadingButton
                        size="small"
                        color="success"
                        variant="outlined"
                        loading={busyId === `approve-${request.id}`}
                        onClick={() => openReviewAction(request, 'approve')}
                      >
                        Approve
                      </LoadingButton>
                      <LoadingButton
                        size="small"
                        color="error"
                        variant="outlined"
                        loading={busyId === `reject-${request.id}`}
                        onClick={() => openReviewAction(request, 'reject')}
                      >
                        Reject
                      </LoadingButton>
                    </Stack>
                  ) : null}
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
                {reviewAction.request.employeeName} • {reviewAction.request.leaveType} •{' '}
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

  const metrics = useMemo<DashboardMetric[]>(() => {
    if (!data) return [];
    return [
      {
        title: 'Total Staff',
        value: formatCount(data.workforce.totalActiveStaff),
        icon: 'mdi:account-group-outline',
        href: hrPaths.employee.list,
        helper: `${formatCount(data.workforce.teachingStaff)} teaching`,
      },
      {
        title: 'Present Today',
        value: formatCount(data.attendanceToday.present),
        icon: 'mdi:account-check-outline',
        href: hrPaths.attendance.markAttendance,
        helper: `${data.attendanceToday.attendanceRate}% attendance`,
      },
      {
        title: 'On Leave',
        value: formatCount(data.attendanceTrend.at(-1)?.leave || 0),
        icon: 'mdi:beach',
        href: hrPaths.leaveManagement.leaveCenter,
        helper: 'Approved today',
      },
      {
        title: 'Late/Exceptions',
        value: formatCount(data.attendanceToday.lateOrException),
        icon: 'mdi:clock-alert-outline',
        href: hrPaths.attendance.attendanceTracking,
        helper: `${formatCount(data.attendanceToday.missingAttendance)} missing`,
      },
      {
        title: 'Pending Leave',
        value: formatCount(data.leave.pending),
        icon: 'mdi:clipboard-clock-outline',
        href: hrPaths.leaveManagement.approvals,
        helper: `${formatCount(data.leave.approved)} approved`,
      },
      {
        title: 'Payroll Readiness',
        value: payrollReadinessValue(data.payroll),
        icon: 'mdi:cash-multiple',
        href: hrPaths.payroll.runPayroll,
        helper: `${formatCount(data.payroll.pendingCount)} pending rows`,
      },
      {
        title: 'New Joiners',
        value: formatCount(data.workforce.newJoinersThisMonth),
        icon: 'mdi:account-plus-outline',
        href: hrPaths.employee.list,
        helper: 'This month',
      },
      {
        title: 'Celebrations',
        value: formatCount(data.celebrations.today.length + data.celebrations.upcoming.length),
        icon: 'mdi:party-popper',
        helper: 'Next 30 days',
      },
    ] satisfies DashboardMetric[];
  }, [data]);

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
        {metrics.map((metric) => (
          <Grid key={metric.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5} alignItems="stretch">
        <Grid size={{ xs: 12, lg: 6 }}>
          <AttendanceTrendCard data={data} />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <PayrollReadinessCard data={data} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <TodayOperationsCard data={data} />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
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

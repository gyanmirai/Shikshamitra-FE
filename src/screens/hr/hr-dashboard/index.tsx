'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Scrollbar } from 'src/components/scrollbar';
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
  type HRDashboardCelebration,
  type HRDashboardLeaveRequest,
  useGetHRDashboardPreviewQuery,
  useRefreshHRDashboardPreviewMutation,
} from 'src/redux/hr/hrDashboardApi';

import { HrDashboardPreviewShell } from './components/HrDashboardPreviewShell';

const EmployeeProfileDashboard = dynamic(() => import('../employee/employee-dashboard'));

const hasRole = (role: unknown, expectedRole: string) => {
  if (Array.isArray(role)) {
    return role.some((item) => String(item).toLowerCase() === expectedRole);
  }

  return String(role || '').toLowerCase() === expectedRole;
};

const formatCount = (value?: number | null) => new Intl.NumberFormat('en-IN').format(value || 0);

const metricColor = {
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  primary: '#2563EB',
};

type MetricColor = keyof typeof metricColor;

type DashboardMetric = {
  title: string;
  value: string | number;
  icon: string;
  color: MetricColor;
  href?: string;
  helper?: string;
};

const severityColor = (severity: string): 'error' | 'warning' | 'info' | 'success' =>
  severity === 'critical'
    ? 'error'
    : severity === 'warning'
      ? 'warning'
      : severity === 'success'
        ? 'success'
        : 'info';

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
  color = 'info',
  href,
  helper,
}: {
  title: string;
  value: string | number;
  icon: string;
  color?: MetricColor;
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
      display: 'flex',
      alignItems: 'center',
      border: (theme) => `1px solid ${theme.palette.divider}`,
      boxShadow: 'none',
      transition: (theme) =>
        theme.transitions.create(['border-color', 'box-shadow', 'transform'], {
          duration: theme.transitions.duration.shorter,
        }),
      '&:hover': href
        ? {
            transform: 'translateY(-2px)',
            borderColor: metricColor[color],
            boxShadow: (theme) => theme.shadows[4],
          }
        : undefined,
    }}
  >
    <Box sx={{ width: 4, alignSelf: 'stretch', bgcolor: metricColor[color], flexShrink: 0 }} />
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
          color: metricColor[color],
          bgcolor: `${metricColor[color]}14`,
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={22} />
      </Box>
    </Box>
  </Card>
);

const AttendanceTrendCard = ({ data }: { data: HRDashboardSummary }) => {
  const theme = useTheme();
  const categories = data.attendanceTrend.map((point) => dayjs(point.date).format('DD MMM'));
  const chartOptions = useChart({
    colors: [theme.palette.success.main, theme.palette.error.main, theme.palette.warning.main],
    stroke: { width: 2.5, curve: 'smooth' },
    markers: { size: 3 },
    xaxis: { categories },
    yaxis: { min: 0 },
    tooltip: { y: { formatter: (value: number) => `${value} staff` } },
    legend: { position: 'top', horizontalAlign: 'right' },
  });

  return (
    <Card
      sx={{
        height: '100%',
        p: 2,
        boxShadow: 'none',
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <CardHeader
        sx={{ p: 0, mb: 1.5 }}
        title="Attendance Trend"
        subheader={`${data.range}-day staff attendance view`}
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
      />
      {data.attendanceTrend.length ? (
        <Chart
          type="line"
          height={270}
          series={[
            { name: 'Present', data: data.attendanceTrend.map((point) => point.present) },
            { name: 'Absent', data: data.attendanceTrend.map((point) => point.absent) },
            { name: 'On Leave', data: data.attendanceTrend.map((point) => point.leave) },
          ]}
          options={chartOptions}
        />
      ) : (
        <Alert severity="info">No attendance trend data is available for this range.</Alert>
      )}
    </Card>
  );
};

const PayrollReadinessCard = ({ data }: { data: HRDashboardSummary }) => {
  const { payroll } = data;
  const reviewedPct = payroll.employeeCount
    ? Math.round(((payroll.reviewedCount + payroll.lockedCount) / payroll.employeeCount) * 100)
    : 0;

  return (
    <Card
      sx={{
        height: '100%',
        p: 2,
        boxShadow: 'none',
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <CardHeader
        sx={{ p: 0, mb: 1.5 }}
        title="Payroll Readiness"
        subheader={payroll.month || data.month}
        action={
          <Chip
            size="small"
            color={payroll.canLock ? 'success' : payroll.canPreview ? 'warning' : 'error'}
            label={
              payroll.canLock ? 'Ready to lock' : payroll.canPreview ? 'Review needed' : 'Blocked'
            }
          />
        }
      />
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1}>
          <Chip
            label={`${formatCount(payroll.reviewedCount)} reviewed`}
            color="info"
            variant="outlined"
          />
          <Chip
            label={`${formatCount(payroll.lockedCount)} locked`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`${formatCount(payroll.pendingCount)} pending`}
            color="warning"
            variant="outlined"
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
                bgcolor: payroll.canLock ? 'success.main' : 'warning.main',
              }}
            />
          </Box>
        </Box>
        <Grid container spacing={1}>
          <Grid size={6}>
            <Alert severity={payroll.missingAttendanceCount ? 'warning' : 'success'} icon={false}>
              <Typography variant="caption">Missing attendance</Typography>
              <Typography variant="h6">{formatCount(payroll.missingAttendanceCount)}</Typography>
            </Alert>
          </Grid>
          <Grid size={6}>
            <Alert
              severity={payroll.missingSalaryStructureCount ? 'error' : 'success'}
              icon={false}
            >
              <Typography variant="caption">Missing salary setup</Typography>
              <Typography variant="h6">
                {formatCount(payroll.missingSalaryStructureCount)}
              </Typography>
            </Alert>
          </Grid>
        </Grid>
        {payroll.blockingIssues.length ? (
          <Alert severity="error">{payroll.blockingIssues[0]}</Alert>
        ) : payroll.recommendedActions.length ? (
          <Alert severity="info">{payroll.recommendedActions[0]}</Alert>
        ) : null}
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
    </Card>
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
    <Card
      sx={{
        height: '100%',
        p: 2,
        boxShadow: 'none',
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <CardHeader
        sx={{ p: 0, mb: 1.5 }}
        title="Pending Leave Approvals"
        subheader={`${requests.length} recent requests`}
        action={
          <Button component={Link} href={hrPaths.leaveManagement.approvals} size="small">
            View all
          </Button>
        }
      />
      {requests.length ? (
        <Scrollbar sx={{ maxHeight: 330 }}>
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
        <Alert severity="success">No pending leave approvals.</Alert>
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
    </Card>
  );
};

const InsightCenter = ({ insights }: { insights: HRDashboardInsight[] }) => (
  <Card
    sx={{
      height: '100%',
      p: 2,
      boxShadow: 'none',
      border: (t) => `1px solid ${t.palette.divider}`,
    }}
  >
    <CardHeader
      sx={{ p: 0, mb: 1.5 }}
      title="Smart HR Insights"
      subheader="AI-ready deterministic recommendations"
    />
    {insights.length ? (
      <Stack spacing={1}>
        {insights.map((insight, index) => (
          <Alert
            key={`${insight.source}-${index}`}
            severity={severityColor(insight.severity)}
            action={
              insight.actionHref ? (
                <Button component={Link} href={insight.actionHref} size="small" color="inherit">
                  {insight.actionLabel || 'Open'}
                </Button>
              ) : null
            }
          >
            <Typography variant="subtitle2">{insight.title}</Typography>
            <Typography variant="body2">{insight.summary}</Typography>
          </Alert>
        ))}
      </Stack>
    ) : (
      <Alert severity="success">No urgent HR actions detected.</Alert>
    )}
  </Card>
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
    <Card
      sx={{
        height: '100%',
        p: 2,
        boxShadow: 'none',
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <CardHeader
        sx={{ p: 0, mb: 1.5 }}
        title="Celebrations"
        subheader="Birthdays and work anniversaries"
      />
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
        <Alert severity="info">No upcoming celebrations in the next 30 days.</Alert>
      )}
    </Card>
  );
};

const StaffSnapshotCard = ({
  employees,
}: {
  employees: HRDashboardSummary['workforce']['recentEmployees'];
}) => (
  <Card
    sx={{
      height: '100%',
      p: 2,
      boxShadow: 'none',
      border: (t) => `1px solid ${t.palette.divider}`,
    }}
  >
    <CardHeader
      sx={{ p: 0, mb: 1.5 }}
      title="Staff Snapshot"
      subheader="Recently added active staff"
      action={
        <Button component={Link} href={hrPaths.employee.list} size="small">
          Directory
        </Button>
      }
    />
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
      <Alert severity="info">No active staff records found.</Alert>
    )}
  </Card>
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
  const data = useMemo(() => parseHRDashboardPayload<HRDashboardSummary>(preview), [preview]);

  useEffect(() => {
    if (preview?.status === 'Empty') {
      refreshPreview('Main');
    }
  }, [preview?.status, refreshPreview]);

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
        color: 'primary' as const,
        href: hrPaths.employee.list,
        helper: `${formatCount(data.workforce.teachingStaff)} teaching`,
      },
      {
        title: 'Present Today',
        value: formatCount(data.attendanceToday.present),
        icon: 'mdi:account-check-outline',
        color: 'success' as const,
        href: hrPaths.attendance.markAttendance,
        helper: `${data.attendanceToday.attendanceRate}% attendance`,
      },
      {
        title: 'On Leave',
        value: formatCount(data.attendanceTrend.at(-1)?.leave || 0),
        icon: 'mdi:beach',
        color: 'warning' as const,
        href: hrPaths.leaveManagement.leaveCenter,
        helper: 'Approved today',
      },
      {
        title: 'Late/Exceptions',
        value: formatCount(data.attendanceToday.lateOrException),
        icon: 'mdi:clock-alert-outline',
        color: data.attendanceToday.lateOrException ? 'warning' : 'success',
        href: hrPaths.attendance.attendanceTracking,
        helper: `${formatCount(data.attendanceToday.missingAttendance)} missing`,
      },
      {
        title: 'Pending Leave',
        value: formatCount(data.leave.pending),
        icon: 'mdi:clipboard-clock-outline',
        color: data.leave.pending ? 'warning' : 'success',
        href: hrPaths.leaveManagement.approvals,
        helper: `${formatCount(data.leave.approved)} approved`,
      },
      {
        title: 'Payroll Readiness',
        value: data.payroll.canLock ? 'Ready' : data.payroll.canPreview ? 'Review' : 'Blocked',
        icon: 'mdi:cash-multiple',
        color: data.payroll.canLock ? 'success' : data.payroll.canPreview ? 'warning' : 'error',
        href: hrPaths.payroll.runPayroll,
        helper: `${formatCount(data.payroll.pendingCount)} pending rows`,
      },
      {
        title: 'New Joiners',
        value: formatCount(data.workforce.newJoinersThisMonth),
        icon: 'mdi:account-plus-outline',
        color: 'info' as const,
        href: hrPaths.employee.list,
        helper: 'This month',
      },
      {
        title: 'Celebrations',
        value: formatCount(data.celebrations.today.length + data.celebrations.upcoming.length),
        icon: 'mdi:party-popper',
        color: 'info' as const,
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
    return (
      <HrDashboardPreviewShell
        title="HR Dashboard"
        preview={preview}
        isFetching={isFetching}
        isRefreshing={isRefreshStarting}
        onRefresh={() => refreshPreview('Main')}
      >
        <DashboardSkeleton />
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
            variant="contained"
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

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <AttendanceTrendCard data={data} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <PayrollReadinessCard data={data} />
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <LeaveActionCenter requests={data.leave.recentPendingRequests} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InsightCenter insights={data.insights} />
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <CelebrationsCard celebrations={data.celebrations} dashboardDate={data.date} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StaffSnapshotCard employees={data.workforce.recentEmployees} />
        </Grid>
      </Grid>
    </HrDashboardPreviewShell>
  );
};

const HRDashboardScreen = () => {
  const { data: session } = useSession() as any;
  const isAdminUser = hasRole(session?.profile?.role, 'admin');

  if (!isAdminUser) {
    return <EmployeeProfileDashboard editData={{}} />;
  }

  return <AdminDashboard />;
};

export default HRDashboardScreen;

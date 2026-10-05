'use client';

import type {
  HRDashboardSummary,
  HRDashboardInsight,
  HRDashboardCelebration,
  HRDashboardLeaveRequest,
  HRDashboardEmployeeSnapshot,
} from 'src/redux/hr/hrDashboardApi';

import Link from 'next/link';
import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { fDate } from 'src/utils/format-time';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { Chart, useChart } from 'src/components/chart';
import { shikshaMitraToast } from 'src/components/toast';
import { fNumber, fPercent } from 'src/utils/format-number';
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
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';

import {
  getPercentage,
  getPayrollStatus,
  getPayrollProgress,
  buildHrDashboardMetrics,
} from '../hr-dashboard-view-model';

import type { HrDashboardDisplayPermissions } from '../hr-dashboard-view-model';

type Props = {
  data: HRDashboardSummary;
  permissions: HrDashboardDisplayPermissions;
};

const surfaceSx = {
  height: 1,
  minWidth: 0,
  border: 0,
  borderRadius: 2,
  boxShadow: 1,
  bgcolor: 'background.paper',
  backgroundImage: 'none',
};

const focusVisibleSx = {
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'primary.main',
    outlineOffset: 2,
  },
};

const SectionCard = ({
  title,
  subheader,
  action,
  children,
}: {
  title: string;
  subheader?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Card component="section" sx={surfaceSx}>
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      spacing={1}
      sx={{ px: 2, pt: 2 }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography component="h2" variant="h6" sx={{ textWrap: 'balance' }}>
          {title}
        </Typography>
        {subheader ? (
          <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            {subheader}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Stack>
    <Box sx={{ px: 2, pt: 1.75, pb: 2 }}>{children}</Box>
  </Card>
);

const EmptyRow = ({ children }: { children: React.ReactNode }) => (
  <Stack direction="row" spacing={1} alignItems="center" sx={{ minHeight: 44, px: 0.5, py: 0.75 }}>
    <Iconify icon="solar:check-circle-linear" width={20} color="text.secondary" aria-hidden />
    <Typography variant="body2" color="text.secondary">
      {children}
    </Typography>
  </Stack>
);

const SummaryMetrics = ({ data, permissions }: Props) => {
  const metrics = buildHrDashboardMetrics(data, {
    'active-staff': permissions.canViewEmployees ? hrPaths.employee.list : undefined,
    'attendance-rate': permissions.canViewAttendance ? hrPaths.attendance.dashboard : undefined,
    'pending-leave': permissions.canApproveLeave ? hrPaths.leaveManagement.approvals : undefined,
    'payroll-status': permissions.canRunPayroll ? hrPaths.payroll.runPayroll : undefined,
  });

  return (
    <Card component="section" sx={surfaceSx}>
      <Box sx={{ px: 2, pt: 2 }}>
        <Typography component="h2" variant="h6">
          Today&apos;s Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Workforce health and operational readiness at a glance.
        </Typography>
      </Box>
      <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ px: 1, pb: 1, mt: 0.75 }}>
        {metrics.map((metric) => {
          const content = (
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  display: 'grid',
                  borderRadius: 1,
                  placeItems: 'center',
                  color: 'primary.main',
                  bgcolor: 'background.neutral',
                }}
              >
                <Iconify icon={metric.icon} width={22} aria-hidden />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {metric.label}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ overflowWrap: 'anywhere', fontVariantNumeric: 'tabular-nums' }}
                >
                  {metric.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {metric.helper}
                </Typography>
              </Box>
            </Stack>
          );

          return (
            <Grid key={metric.id} size={{ xs: 6, md: 3 }}>
              <Box
                data-testid={`summary-metric-${metric.id}`}
                component={metric.href ? Link : 'div'}
                href={metric.href}
                aria-label={metric.href ? `${metric.label}: ${metric.value}` : undefined}
                sx={{
                  minHeight: 104,
                  px: { xs: 1, sm: 1.5 },
                  py: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.primary',
                  textDecoration: 'none',
                  borderRadius: 1.5,
                  ...(metric.href
                    ? {
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        ...focusVisibleSx,
                      }
                    : {}),
                }}
              >
                {content}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Card>
  );
};

const canOpenInsight = (href: string, permissions: HrDashboardDisplayPermissions) => {
  if (!href) return false;
  if (href.startsWith(hrPaths.leaveManagement.approvals)) return permissions.canApproveLeave;
  if (href.startsWith(hrPaths.attendance.root || '/hr/attendance'))
    return permissions.canViewAttendance;
  if (href.startsWith(hrPaths.payroll.root)) return permissions.canRunPayroll;
  if (href.startsWith(hrPaths.employee.root || '/hr/employee')) return permissions.canViewEmployees;
  if (href.startsWith(hrPaths.reports)) return permissions.canViewReports;
  return false;
};

const insightIcon = (severity: string) => {
  if (severity === 'critical' || severity === 'warning') return 'solar:danger-triangle-linear';
  if (severity === 'success') return 'solar:check-circle-linear';
  return 'solar:lightbulb-linear';
};

const InsightList = ({
  insights,
  permissions,
}: {
  insights: HRDashboardInsight[];
  permissions: HrDashboardDisplayPermissions;
}) => (
  <Stack spacing={0.5}>
    {insights.length ? (
      insights.map((insight, index) => (
        <Stack
          key={`${insight.source}-${index}`}
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          justifyContent="space-between"
          sx={{ py: 0.75 }}
        >
          <Stack direction="row" spacing={1.25} sx={{ minWidth: 0 }}>
            <Iconify
              icon={insightIcon(insight.severity)}
              width={22}
              color={insight.severity === 'critical' ? 'error.main' : 'text.secondary'}
              aria-hidden
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                {insight.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                {insight.summary}
              </Typography>
            </Box>
          </Stack>
          {canOpenInsight(insight.actionHref, permissions) ? (
            <Button
              component={Link}
              href={insight.actionHref}
              variant="text"
              sx={{ minHeight: 44, alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}
            >
              {insight.actionLabel || 'Open'}
            </Button>
          ) : null}
        </Stack>
      ))
    ) : (
      <EmptyRow>No urgent HR actions detected.</EmptyRow>
    )}
  </Stack>
);

const LeaveRequestRows = ({
  requests,
  canApprove,
}: {
  requests: HRDashboardLeaveRequest[];
  canApprove: boolean;
}) => {
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

  const closeReviewAction = () => {
    if (busyId) return;
    setReviewAction(null);
    setRemarks('');
    setRemarksError('');
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
      setReviewAction(null);
      setRemarks('');
      setRemarksError('');
    } catch (error: any) {
      shikshaMitraToast.error({ message: error?.data?.message || 'Leave action failed.' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      {requests.length ? (
        <Stack spacing={0.75}>
          {requests.map((request) => (
            <Stack key={request.id} spacing={1} sx={{ py: 0.75 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                spacing={1}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                  <Avatar sx={{ width: 36, height: 36 }}>
                    {request.employeeName?.charAt(0) || '?'}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                      {request.employeeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {request.employeeIdentifier}
                    </Typography>
                  </Box>
                </Stack>
                {canApprove ? (
                  <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                    <LoadingButton
                      color="success"
                      variant="outlined"
                      loading={busyId === `approve-${request.id}`}
                      onClick={() => openReviewAction(request, 'approve')}
                      aria-label={`Approve leave for ${request.employeeName}`}
                      sx={{ minHeight: 44 }}
                    >
                      Approve
                    </LoadingButton>
                    <LoadingButton
                      color="error"
                      variant="outlined"
                      loading={busyId === `reject-${request.id}`}
                      onClick={() => openReviewAction(request, 'reject')}
                      aria-label={`Reject leave for ${request.employeeName}`}
                      sx={{ minHeight: 44 }}
                    >
                      Reject
                    </LoadingButton>
                  </Stack>
                ) : null}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {request.paidType ?? request.leaveType} · {fNumber(request.totalDays)} day(s) ·{' '}
                {fDate(request.startDate, 'DD MMM')} - {fDate(request.endDate, 'DD MMM')}
              </Typography>
            </Stack>
          ))}
        </Stack>
      ) : (
        <EmptyRow>No pending leave approvals.</EmptyRow>
      )}

      <Dialog open={Boolean(reviewAction)} onClose={closeReviewAction} fullWidth maxWidth="sm">
        <DialogTitle>
          {reviewAction?.action === 'reject' ? 'Reject Leave Request' : 'Approve Leave Request'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            {reviewAction ? (
              <Alert severity={reviewAction.action === 'reject' ? 'warning' : 'info'}>
                {reviewAction.request.employeeName} ·{' '}
                {reviewAction.request.paidType ?? reviewAction.request.leaveType} ·{' '}
                {fDate(reviewAction.request.startDate, 'DD MMM')} -{' '}
                {fDate(reviewAction.request.endDate, 'DD MMM')}
              </Alert>
            ) : null}
            <TextField
              fullWidth
              multiline
              minRows={4}
              name="remarks"
              autoComplete="off"
              label={reviewAction?.action === 'reject' ? 'Remarks *' : 'Remarks'}
              value={remarks}
              onChange={(event) => {
                setRemarks(event.target.value);
                if (remarksError) setRemarksError('');
              }}
              error={Boolean(remarksError)}
              helperText={remarksError || ' '}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReviewAction} disabled={Boolean(busyId)} sx={{ minHeight: 44 }}>
            Cancel
          </Button>
          <LoadingButton
            color={reviewAction?.action === 'reject' ? 'error' : 'success'}
            variant="contained"
            loading={Boolean(busyId)}
            onClick={runAction}
            sx={{ minHeight: 44 }}
          >
            {reviewAction?.action === 'reject' ? 'Reject' : 'Approve'}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

const ActionCenter = ({ data, permissions }: Props) => (
  <SectionCard
    title="Action Center"
    subheader="Items that need HR attention"
    action={
      permissions.canApproveLeave ? (
        <Button component={Link} href={hrPaths.leaveManagement.approvals} sx={{ minHeight: 44 }}>
          View Leave Requests
        </Button>
      ) : null
    }
  >
    <Stack spacing={3}>
      <Box>
        <Typography component="h3" variant="subtitle2" sx={{ mb: 1 }}>
          Recommended actions
        </Typography>
        <InsightList insights={data.insights} permissions={permissions} />
      </Box>
      <Box>
        <Typography component="h3" variant="subtitle2" sx={{ mb: 1 }}>
          Pending leave approvals
        </Typography>
        <LeaveRequestRows
          requests={data.leave.recentPendingRequests}
          canApprove={permissions.canApproveLeave}
        />
      </Box>
    </Stack>
  </SectionCard>
);

const WorkforceOverview = ({ data, permissions }: Props) => {
  const theme = useTheme();
  const total = data.workforce.totalActiveStaff;
  const teaching = data.workforce.teachingStaff;
  const nonTeaching = data.workforce.nonTeachingStaff;
  const chartOptions = useChart({
    chart: { animations: { enabled: false } },
    labels: ['Teaching', 'Non-teaching'],
    colors: [theme.palette.primary.main, theme.palette.info.main],
    stroke: { width: 0 },
    legend: { show: false },
    tooltip: { y: { formatter: (value: number) => `${fNumber(value)} staff` } },
    plotOptions: { pie: { donut: { size: '72%', labels: { show: false } } } },
  });
  const chartSummary = `${fNumber(teaching)} teaching and ${fNumber(nonTeaching)} non-teaching staff out of ${fNumber(total)} active staff.`;

  return (
    <SectionCard
      title="Workforce Overview"
      subheader="Active staff composition and movement"
      action={
        permissions.canViewEmployees ? (
          <Button component={Link} href={hrPaths.employee.list} sx={{ minHeight: 44 }}>
            Directory
          </Button>
        ) : null
      }
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row', lg: 'column', xl: 'row' }}
          spacing={2}
          alignItems="center"
        >
          <Box
            role="img"
            aria-label={chartSummary}
            sx={{ width: 168, height: 168, position: 'relative', flexShrink: 0 }}
          >
            <Chart
              type="donut"
              series={[teaching, nonTeaching]}
              options={chartOptions}
              sx={{ width: 168, height: 168 }}
            />
            <Stack
              aria-hidden
              alignItems="center"
              justifyContent="center"
              sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              <Typography variant="h4" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {fNumber(total)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active staff
              </Typography>
            </Stack>
          </Box>
          <Stack spacing={1.25} sx={{ width: 1 }}>
            <WorkforceRow
              label="Teaching"
              value={teaching}
              helper={fPercent(getPercentage(teaching, total))}
              color="primary.main"
            />
            <WorkforceRow
              label="Non-teaching"
              value={nonTeaching}
              helper={fPercent(getPercentage(nonTeaching, total))}
              color="info.main"
            />
          </Stack>
        </Stack>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <StatRow label="Inactive staff" value={data.workforce.inactiveStaff} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <StatRow label="Joined this month" value={data.workforce.newJoinersThisMonth} />
          </Grid>
        </Grid>
        <Typography variant="body2" color="text.secondary">
          {chartSummary}
        </Typography>
      </Stack>
    </SectionCard>
  );
};

const WorkforceRow = ({
  label,
  value,
  helper,
  color,
}: {
  label: string;
  value: number;
  helper: string;
  color: string;
}) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    spacing={1}
    sx={{ py: 0.5 }}
  >
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: color }} />
      <Box>
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {helper} of staff
        </Typography>
      </Box>
    </Stack>
    <Typography variant="h6" sx={{ fontVariantNumeric: 'tabular-nums' }}>
      {fNumber(value)}
    </Typography>
  </Stack>
);

const StatRow = ({ label, value }: { label: string; value: number }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{ px: 1.5, py: 1.25, minHeight: 52, bgcolor: 'background.neutral', borderRadius: 1 }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="subtitle1" sx={{ fontVariantNumeric: 'tabular-nums' }}>
      {fNumber(value)}
    </Typography>
  </Stack>
);

const AttendanceOverview = ({ data, permissions }: Props) => {
  const theme = useTheme();
  const totalStaff = data.workforce.totalActiveStaff;
  const categories = data.attendanceTrend.map((point) => fDate(point.date, 'ddd') || '');
  const trendPercent = (value: number) => getPercentage(value, totalStaff);
  const chartOptions = useChart({
    chart: { animations: { enabled: false } },
    colors: [theme.palette.primary.main, theme.palette.warning.main, theme.palette.info.main],
    stroke: { width: 2.5, curve: 'smooth' },
    markers: { size: 3, hover: { size: 5 } },
    xaxis: { categories },
    yaxis: { min: 0, max: 100, labels: { formatter: (value: number) => `${Math.round(value)}%` } },
    tooltip: { y: { formatter: (value: number) => fPercent(value) } },
    legend: { show: true, position: 'top', horizontalAlign: 'right' },
    grid: { padding: { top: 0, right: 8, bottom: 0, left: 0 } },
  });
  const trendSummary = data.attendanceTrend.length
    ? data.attendanceTrend
        .map(
          (point) =>
            `${fDate(point.date, 'DD MMM')}: ${fNumber(point.present)} present, ${fNumber(point.absent)} absent, ${fNumber(point.leave)} on leave`
        )
        .join('. ')
    : 'No attendance trend data is available.';
  const todayValues = [
    ['Present', data.attendanceToday.present],
    ['Absent', data.attendanceToday.absent],
    ['Half-day', data.attendanceToday.halfDay],
    ['Missing', data.attendanceToday.missingAttendance],
    ['Exceptions', data.attendanceToday.lateOrException],
  ] as const;

  return (
    <SectionCard
      title="Attendance Overview"
      subheader={`${data.range}-day trend and today's attendance status`}
      action={
        permissions.canViewAttendance ? (
          <Button component={Link} href={hrPaths.attendance.dashboard} sx={{ minHeight: 44 }}>
            View Attendance
          </Button>
        ) : null
      }
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Today&apos;s attendance rate
            </Typography>
            <Typography variant="h3" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {fPercent(data.attendanceToday.attendanceRate)}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" textAlign="right">
            {fNumber(data.attendanceToday.present)} of {fNumber(totalStaff)} staff present
          </Typography>
        </Stack>
        {data.attendanceTrend.length ? (
          <Box role="img" aria-label={trendSummary}>
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
              sx={{ height: { xs: 230, sm: 260 } }}
            />
          </Box>
        ) : (
          <Alert severity="info">No attendance trend data is available for this range.</Alert>
        )}
        <Typography variant="body2" color="text.secondary">
          {trendSummary}
        </Typography>
        <Grid container spacing={1}>
          {todayValues.map(([label, value]) => (
            <Grid key={label} size={{ xs: 6, sm: 4, lg: 2.4 }}>
              <Stack
                sx={{
                  minHeight: 64,
                  px: 1.25,
                  py: 1,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="h6" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {fNumber(value)}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </SectionCard>
  );
};

const PayrollReadiness = ({ data, permissions }: Props) => {
  const { payroll } = data;
  const progress = getPayrollProgress(payroll);
  const setupGaps =
    payroll.missingAttendanceCount +
    payroll.missingSalaryStructureCount +
    payroll.policyConfigurationIssueCount;
  const status = getPayrollStatus(payroll);
  const chipColor = payroll.canLock ? 'success' : payroll.canPreview ? 'warning' : 'default';

  return (
    <SectionCard
      title="Payroll Readiness"
      subheader={payroll.month || data.month}
      action={<Chip size="small" color={chipColor} variant="outlined" label={status} />}
    >
      <Stack spacing={2}>
        <Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
            <Typography variant="body2" color="text.secondary">
              Reviewed progress
            </Typography>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {fPercent(progress)}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            color={payroll.canLock ? 'success' : 'primary'}
            aria-label={`Payroll reviewed progress ${fPercent(progress)}`}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6 }}>
            <StatRow label="Reviewed" value={payroll.reviewedCount + payroll.lockedCount} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <StatRow label="Pending" value={payroll.pendingCount} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <StatRow label="Setup gaps" value={setupGaps} />
          </Grid>
        </Grid>
        <PayrollNotes
          title="Blockers"
          items={payroll.blockingIssues}
          empty="No payroll blockers detected."
        />
        <PayrollNotes
          title="Recommendations"
          items={payroll.recommendedActions}
          empty="No additional recommendations for this cycle."
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {permissions.canRunPayroll ? (
            <Button
              component={Link}
              href={hrPaths.payroll.runPayroll}
              variant="contained"
              startIcon={<Iconify icon="solar:play-circle-linear" aria-hidden />}
              sx={{ minHeight: 44 }}
            >
              Run Payroll
            </Button>
          ) : null}
          {permissions.canViewSalaryStructures ? (
            <Button
              component={Link}
              href={hrPaths.payroll.structure}
              variant="outlined"
              sx={{ minHeight: 44 }}
            >
              Salary Structures
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </SectionCard>
  );
};

const PayrollNotes = ({
  title,
  items,
  empty,
}: {
  title: string;
  items: string[];
  empty: string;
}) => (
  <Box>
    <Typography component="h3" variant="subtitle2" sx={{ mb: 0.75 }}>
      {title}
    </Typography>
    {items.length ? (
      <Stack component="ul" spacing={0.75} sx={{ m: 0, pl: 2.5 }}>
        {items.slice(0, 3).map((item) => (
          <Typography component="li" variant="body2" color="text.secondary" key={item}>
            {item}
          </Typography>
        ))}
      </Stack>
    ) : (
      <Typography variant="body2" color="text.secondary">
        {empty}
      </Typography>
    )}
  </Box>
);

const EmployeeRow = ({ employee }: { employee: HRDashboardEmployeeSnapshot }) => (
  <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
    <Avatar sx={{ width: 36, height: 36 }}>{employee.name?.charAt(0) || '?'}</Avatar>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
        {employee.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
        {employee.employeeIdentifier || 'No staff code'} ·{' '}
        {employee.department ||
          employee.roleName ||
          (employee.isTeaching ? 'Teaching' : 'Non-teaching')}
      </Typography>
    </Box>
  </Stack>
);

const CelebrationRow = ({
  item,
  dashboardDate,
}: {
  item: HRDashboardCelebration;
  dashboardDate: string;
}) => (
  <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
    <Avatar sx={{ width: 36, height: 36 }}>{item.employeeName?.charAt(0) || '?'}</Avatar>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
        {item.employeeName}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {item.type}
        {item.years ? ` · ${item.years} years` : ''} · {fDate(item.date, 'DD MMM')}
      </Typography>
    </Box>
    <Chip
      size="small"
      variant="outlined"
      label={fDate(item.date) === fDate(dashboardDate) ? 'Today' : 'Upcoming'}
    />
  </Stack>
);

const PeopleUpdates = ({ data, permissions }: Props) => {
  const [newJoinersOpen, setNewJoinersOpen] = useState(false);
  const [celebrationsOpen, setCelebrationsOpen] = useState(false);
  const newJoiners = data.workforce.newJoiners || [];
  const celebrations = [...data.celebrations.today, ...data.celebrations.upcoming];

  return (
    <SectionCard title="People Updates" subheader="Recent staff, new joiners, and celebrations">
      <Grid container spacing={{ xs: 2.5, lg: 3 }}>
        <PeopleColumn
          title="Recent Staff"
          action={
            permissions.canViewEmployees ? (
              <Button component={Link} href={hrPaths.employee.list} sx={{ minHeight: 44 }}>
                Directory
              </Button>
            ) : null
          }
        >
          {data.workforce.recentEmployees.length ? (
            <Stack spacing={0.5}>
              {data.workforce.recentEmployees.slice(0, 4).map((employee) => (
                <EmployeeRow key={employee.id} employee={employee} />
              ))}
            </Stack>
          ) : (
            <EmptyRow>No recent active staff records.</EmptyRow>
          )}
        </PeopleColumn>
        <PeopleColumn
          title="New Joiners"
          action={
            <Button
              onClick={() => setNewJoinersOpen(true)}
              aria-label="View all new joiners"
              sx={{ minHeight: 44 }}
            >
              View All
            </Button>
          }
        >
          {newJoiners.length ? (
            <Stack spacing={0.5}>
              {newJoiners.slice(0, 4).map((employee) => (
                <EmployeeRow key={employee.id} employee={employee} />
              ))}
            </Stack>
          ) : (
            <EmptyRow>No staff joined during this month.</EmptyRow>
          )}
        </PeopleColumn>
        <PeopleColumn
          title="Celebrations"
          action={
            <Button
              onClick={() => setCelebrationsOpen(true)}
              aria-label="View all celebrations"
              sx={{ minHeight: 44 }}
            >
              View All
            </Button>
          }
        >
          {celebrations.length ? (
            <Stack spacing={0.5}>
              {celebrations.slice(0, 4).map((item) => (
                <CelebrationRow
                  key={`${item.employeeId}-${item.type}-${item.date}`}
                  item={item}
                  dashboardDate={data.date}
                />
              ))}
            </Stack>
          ) : (
            <EmptyRow>No celebrations in the next 30 days.</EmptyRow>
          )}
        </PeopleColumn>
      </Grid>

      <NewJoinersDialog
        open={newJoinersOpen}
        onClose={() => setNewJoinersOpen(false)}
        employees={newJoiners}
        month={data.month}
        canViewDirectory={permissions.canViewEmployees}
      />
      <CelebrationsDialog
        open={celebrationsOpen}
        onClose={() => setCelebrationsOpen(false)}
        celebrations={celebrations}
        dashboardDate={data.date}
      />
    </SectionCard>
  );
};

const PeopleColumn = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Grid size={{ xs: 12, lg: 4 }}>
    <Box
      sx={{
        minWidth: 0,
        height: 1,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 1 }}
      >
        <Typography component="h3" variant="subtitle1">
          {title}
        </Typography>
        {action}
      </Stack>
      {children}
    </Box>
  </Grid>
);

const NewJoinersDialog = ({
  open,
  onClose,
  employees,
  month,
  canViewDirectory,
}: {
  open: boolean;
  onClose: () => void;
  employees: HRDashboardEmployeeSnapshot[];
  month: string;
  canViewDirectory: boolean;
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>New Joiners · {fDate(`${month}-01`, 'MMMM YYYY')}</DialogTitle>
    <DialogContent dividers>
      {employees.length ? (
        <Stack divider={<Divider flexItem />}>
          {employees.map((employee) => (
            <EmployeeRow key={employee.id} employee={employee} />
          ))}
        </Stack>
      ) : (
        <Alert severity="info">No staff joined during the selected month.</Alert>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} sx={{ minHeight: 44 }}>
        Close
      </Button>
      {canViewDirectory ? (
        <Button
          component={Link}
          href={hrPaths.employee.list}
          variant="contained"
          sx={{ minHeight: 44 }}
        >
          Open Directory
        </Button>
      ) : null}
    </DialogActions>
  </Dialog>
);

const CelebrationsDialog = ({
  open,
  onClose,
  celebrations,
  dashboardDate,
}: {
  open: boolean;
  onClose: () => void;
  celebrations: HRDashboardCelebration[];
  dashboardDate: string;
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Upcoming Celebrations</DialogTitle>
    <DialogContent dividers>
      {celebrations.length ? (
        <Stack divider={<Divider flexItem />}>
          {celebrations.map((item) => (
            <CelebrationRow
              key={`${item.employeeId}-${item.type}-${item.date}`}
              item={item}
              dashboardDate={dashboardDate}
            />
          ))}
        </Stack>
      ) : (
        <Alert severity="info">No celebrations in the next 30 days.</Alert>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} sx={{ minHeight: 44 }}>
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export const HrDashboardContent = ({ data, permissions }: Props) => (
  <Stack spacing={2} sx={{ minWidth: 0 }}>
    <SummaryMetrics data={data} permissions={permissions} />
    <Grid container spacing={2} alignItems="stretch">
      <Grid size={{ xs: 12, lg: 7 }}>
        <ActionCenter data={data} permissions={permissions} />
      </Grid>
      <Grid size={{ xs: 12, lg: 5 }}>
        <WorkforceOverview data={data} permissions={permissions} />
      </Grid>
    </Grid>
    <Grid container spacing={2} alignItems="stretch">
      <Grid size={{ xs: 12, lg: 7 }}>
        <AttendanceOverview data={data} permissions={permissions} />
      </Grid>
      <Grid size={{ xs: 12, lg: 5 }}>
        <PayrollReadiness data={data} permissions={permissions} />
      </Grid>
    </Grid>
    <PeopleUpdates data={data} permissions={permissions} />
  </Stack>
);

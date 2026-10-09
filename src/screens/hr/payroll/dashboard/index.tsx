'use client';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import React, { useMemo, useEffect } from 'react';
import { HrDashboardPreviewShell } from 'src/screens/hr/hr-dashboard/components/HrDashboardPreviewShell';
import { shouldShowDashboardSnapshotSkeleton } from 'src/screens/hr/hr-dashboard/hr-dashboard-preview-state';
import { HrDashboardSnapshotEmptyState } from 'src/screens/hr/hr-dashboard/components/HrDashboardSnapshotEmptyState';
import {
  Box,
  Card,
  Grid,
  Alert,
  Stack,
  Button,
  Divider,
  Skeleton,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  parseHRDashboardPayload,
  useGetHRDashboardPreviewQuery,
  type HRDashboardPayrollPreview,
  useRefreshHRDashboardPreviewMutation,
} from 'src/redux/hr/hrDashboardApi';

const PayrollMetric = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) => (
  <Card
    sx={{
      p: 2,
      height: '100%',
      minHeight: 112,
      boxShadow: 'none',
      border: (theme) => `1px solid ${theme.palette.divider}`,
      fontVariantNumeric: 'tabular-nums',
    }}
  >
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
      {label}
    </Typography>
    <Typography variant="h4" sx={{ mt: 0.5 }}>
      {value}
    </Typography>
    {helper ? (
      <Typography variant="caption" color="text.secondary">
        {helper}
      </Typography>
    ) : null}
  </Card>
);

const PayrollDashboard = () => {
  const {
    data: preview,
    isLoading,
    isFetching,
    refetch,
    isError,
  } = useGetHRDashboardPreviewQuery('Payroll');
  const [refreshPreview, { isLoading: isRefreshStarting }] = useRefreshHRDashboardPreviewMutation();
  const data = useMemo(
    () => parseHRDashboardPayload<HRDashboardPayrollPreview>(preview),
    [preview]
  );

  useEffect(() => {
    if (preview?.status !== 'Refreshing') return undefined;
    const id = window.setInterval(() => refetch(), 5000);
    return () => window.clearInterval(id);
  }, [preview?.status, refetch]);

  const reviewedPercent = data?.employeeCount
    ? Math.round(((data.reviewedCount + data.lockedCount) / data.employeeCount) * 100)
    : 0;

  return (
    <Box>
      <HrDashboardPreviewShell
        title="Payroll Dashboard"
        subtitle={
          data
            ? `Stored payroll preview for ${dayjs(`${data.month}-01`).format('MMMM YYYY')}`
            : 'Review saved payroll readiness and the staff rows that need attention.'
        }
        preview={preview}
        isFetching={isFetching}
        isRefreshing={isRefreshStarting}
        onRefresh={() => refreshPreview('Payroll')}
        actions={
          <Button
            href={hrPaths.payroll.runPayroll}
            variant="contained"
            size="small"
            startIcon={<Iconify icon="solar:calculator-linear" />}
          >
            Run payroll
          </Button>
        }
      >
        {isError ? (
          <Alert severity="error">Payroll dashboard preview could not be loaded.</Alert>
        ) : null}
        {!data ? (
          isLoading ||
          shouldShowDashboardSnapshotSkeleton({
            status: preview?.status,
            isFetching,
            hasPreview: Boolean(preview),
          }) ? (
            <Skeleton variant="rounded" height={360} />
          ) : (
            <HrDashboardSnapshotEmptyState
              status={preview?.status}
              isRefreshing={isRefreshStarting}
              quickLinks={[
                {
                  label: 'Run payroll',
                  href: hrPaths.payroll.runPayroll,
                  icon: 'solar:calculator-linear',
                },
                {
                  label: 'Salary setup',
                  href: hrPaths.payroll.structure,
                  icon: 'solar:wallet-money-linear',
                },
                {
                  label: 'Attendance',
                  href: hrPaths.attendance.dashboard,
                  icon: 'solar:calendar-mark-linear',
                },
              ]}
            />
          )
        ) : (
          <>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <PayrollMetric
                  label="Staff"
                  value={data.employeeCount}
                  helper="Included in payroll"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <PayrollMetric
                  label="Reviewed"
                  value={data.reviewedCount}
                  helper={`${reviewedPercent}% complete`}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <PayrollMetric
                  label="Locked"
                  value={data.lockedCount}
                  helper={data.canLock ? 'Ready to lock' : 'Needs review'}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <PayrollMetric
                  label="Pending"
                  value={data.pendingCount}
                  helper="Rows requiring action"
                />
              </Grid>
            </Grid>

            <Card
              sx={{
                p: 2,
                boxShadow: 'none',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={1.5}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">Payroll Readiness</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {data.canLock
                      ? 'Payroll is ready to lock.'
                      : data.canPreview
                        ? 'Preview is available for review.'
                        : 'Payroll is blocked.'}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    aria-label="Payroll review progress"
                    value={reviewedPercent}
                    sx={{ mt: 2, height: 8, borderRadius: 1 }}
                  />
                </Box>
                <Stack divider={<Divider flexItem />} sx={{ minWidth: { md: 320 } }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ py: 0.75 }}>
                    <Typography variant="body2">Missing attendance</Typography>
                    <Typography variant="subtitle2">{data.missingAttendanceCount}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" sx={{ py: 0.75 }}>
                    <Typography variant="body2">Missing salary structure</Typography>
                    <Typography variant="subtitle2">{data.missingSalaryStructureCount}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" sx={{ py: 0.75 }}>
                    <Typography variant="body2">Policy issues</Typography>
                    <Typography variant="subtitle2">
                      {data.policyConfigurationIssueCount}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Card>

            {data.blockingIssues.length ? (
              <Alert severity="error">{data.blockingIssues[0]}</Alert>
            ) : null}
            {data.recommendedActions.length ? (
              <Alert severity="info">{data.recommendedActions[0]}</Alert>
            ) : null}
          </>
        )}
      </HrDashboardPreviewShell>
    </Box>
  );
};

export default PayrollDashboard;

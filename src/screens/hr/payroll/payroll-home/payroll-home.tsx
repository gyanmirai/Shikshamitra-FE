'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useMemo, useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetRunPayrollReadinessQuery } from 'src/redux/runPayroll/runPayrollApi';
import {
  Box,
  Card,
  Grid,
  Stack,
  Alert,
  Button,
  Divider,
  Typography,
  CardContent,
} from '@mui/material';

import { getSuggestedActiveStepIndex } from '../payroll-cycle/payroll-cycle-helpers';
import PayrollAdvancedRoadmapCard from '../payroll-advanced-roadmap/PayrollAdvancedRoadmapCard';

const PayrollHome = () => {
  const router = useRouter();
  const [month, setMonth] = useState<Dayjs | null>(dayjs());

  const monthKey = month?.format('YYYY-MM') ?? '';
  const { data, isLoading, isFetching, isError, refetch } = useGetRunPayrollReadinessQuery(
    { month: monthKey },
    { skip: !monthKey }
  );

  const stats = useMemo(() => {
    const total = Number(data?.employeeCount || 0);
    const locked = Number(data?.lockedCount || 0);
    const pending = Math.max(0, total - locked);
    return { total, locked, pending, netTotal: 0 };
  }, [data]);

  const issueCounts = {
    attendance_gap: Number(data?.missingAttendanceCount || 0),
    negative_net: 0,
  };
  const hasBlockers = Boolean(
    data?.missingAttendanceCount ||
    data?.missingSalaryStructureCount ||
    data?.policyConfigurationIssueCount
  );

  const { nextLabel, nextPath } = getSuggestedActiveStepIndex(undefined, isLoading || isFetching);

  const periodLabel = month ? month.format('MMMM YYYY') : '';

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Overview"
        links={[{ name: 'HR/Staff' }, { name: 'Payroll Management' }, { name: 'Overview' }]}
        description="Run payroll with a simple flow: monthly workbench, lock reviewed rows, then payslips."
      />

      {isError ? (
        <Alert severity="error" sx={{ mb: 1 }}>
          Could not load payroll readiness for this month. Please refresh and try again.
        </Alert>
      ) : null}

      <Stack
        spacing={1.5}
        sx={{
          mb: 1,
          p: 1,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <DatePicker
            label="Payroll month"
            views={['month', 'year']}
            format="MMMM YYYY"
            value={month}
            onChange={(v) => setMonth(v)}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            sx={{ width: { xs: '100%', sm: 260 } }}
          />
          <LoadingButton
            size="small"
            variant="outlined"
            loading={isLoading || isFetching}
            onClick={() => refetch()}
            startIcon={<Iconify icon="solar:refresh-bold" />}
          >
            Refresh status
          </LoadingButton>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained"
            size="small"
            onClick={() => router.push(nextPath)}
            startIcon={<Iconify icon="solar:arrow-right-up-bold" />}
          >
            {nextLabel}
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={1} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Current cycle
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>
                {periodLabel || '-'}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Employees
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {isLoading ? '...' : stats.total}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Pending lock
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="warning.main">
                    {isLoading ? '...' : stats.pending}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Locked
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="success.main">
                    {isLoading ? '...' : stats.locked}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Existing preview rows
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {isLoading ? '...' : Number(data?.snapshotCount || 0)}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{ height: '100%', borderColor: hasBlockers ? 'warning.main' : undefined }}
            variant="outlined"
          >
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Blockers
              </Typography>
              <Stack spacing={1.25} sx={{ mt: 1 }}>
                {hasBlockers ? (
                  <>
                    {issueCounts.attendance_gap > 0 && (
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Iconify
                          icon="solar:calendar-minimalistic-bold-duotone"
                          width={22}
                          color="warning.main"
                        />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Attendance or payable days look inconsistent
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {issueCounts.attendance_gap} row(s) show payable days below working
                            days. Check attendance automation before review lock.
                          </Typography>
                        </Box>
                      </Stack>
                    )}
                    {issueCounts.negative_net > 0 && (
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Iconify icon="solar:danger-triangle-bold" width={22} color="error.main" />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Negative or invalid net pay
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {issueCounts.negative_net} row(s) need deduction review before lock.
                          </Typography>
                        </Box>
                      </Stack>
                    )}
                    <Button
                      size="small"
                      color="inherit"
                      variant="outlined"
                      onClick={() => router.push(hrPaths.attendance.biometricAttendance)}
                    >
                      Open attendance module
                    </Button>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No high-severity blockers detected. Continue with the monthly workbench, lock
                    reviewed rows, then payslips.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }} variant="outlined">
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Quick actions
              </Typography>
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                <Button
                  fullWidth
                  variant="soft"
                  color="primary"
                  onClick={() => router.push(hrPaths.payroll.runPayroll)}
                  startIcon={<Iconify icon="solar:play-circle-bold" />}
                >
                  Open payroll workbench
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => router.push(hrPaths.payroll.payslipGeneration)}
                  startIcon={<Iconify icon="solar:file-send-linear" />}
                >
                  Payslips
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 1 }}>
        <PayrollAdvancedRoadmapCard />
      </Box>
    </Box>
  );
};

export default PayrollHome;

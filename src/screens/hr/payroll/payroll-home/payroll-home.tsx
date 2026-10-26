'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { RouterLink } from 'src/routes/components';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Card,
  Grid,
  Stack,
  Alert,
  Button,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material';

import { usePayrollPreviewRun } from '../run-payroll/use-payroll-preview-run';

const PayrollHome = () => {
  const [month, setMonth] = useState<Dayjs | null>(dayjs());
  const monthKey = month?.isValid() ? month.format('YYYY-MM') : '';
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const preview = usePayrollPreviewRun(monthKey, currentYear?.id || '');
  const data = preview.data?.readiness;
  const canLoad = Boolean(monthKey && currentYear?.id);
  const isLoading = canLoad && !data && !preview.error;
  const isFetching = preview.busy || preview.fetching;
  const hasCurrentReadiness = Boolean(data && preview.isCurrent);
  const issues = [
    {
      count: data?.missingAttendanceCount ?? 0,
      label: 'Missing attendance',
      description: 'Review attendance records for the selected month.',
      href: hrPaths.attendance.biometricAttendance,
      action: 'Review attendance',
      icon: 'solar:calendar-minimalistic-bold-duotone',
    },
    {
      count: data?.missingSalaryStructureCount ?? 0,
      label: 'Missing salary structure',
      description: 'Complete salary setup for the affected staff.',
      href: hrPaths.payroll.structure,
      action: 'Review salary setup',
      icon: 'solar:wallet-money-linear',
    },
    {
      count: data?.policyConfigurationIssueCount ?? 0,
      label: 'Payroll policy issues',
      description: 'Review payroll policies and staff assignments.',
      href: hrPaths.policies.payroll,
      action: 'Review payroll policies',
      icon: 'solar:settings-linear',
    },
  ].filter((issue) => issue.count > 0);
  const hasBlockers = issues.length > 0 || Boolean(data?.blockingIssues.length);
  const nextPath =
    hasCurrentReadiness && data?.employeeCount && data.lockedCount === data.employeeCount
      ? hrPaths.payroll.payslipGeneration
      : hrPaths.payroll.runPayroll;
  const nextLabel =
    nextPath === hrPaths.payroll.payslipGeneration ? 'Open payslips' : 'Open payroll workbench';
  const metrics = [
    { label: 'Staff', value: data?.employeeCount },
    {
      label: 'Pending lock',
      value: data ? Math.max(0, data.employeeCount - data.lockedCount) : undefined,
    },
    { label: 'Locked', value: data?.lockedCount },
    { label: 'Preview rows', value: data?.snapshotCount },
  ];

  return (
    <Box sx={{ minWidth: 0, pb: 2 }}>
      <CustomBreadcrumbs
        heading="Overview"
        links={[{ name: 'Overview' }]}
        description="Check monthly payroll readiness, resolve setup issues, and open the next action."
        action={
          <Button
            component={RouterLink}
            href={nextPath}
            variant="contained"
            size="small"
            startIcon={<Iconify icon="solar:arrow-right-up-bold" />}
          >
            {nextLabel}
          </Button>
        }
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{
          mb: 2,
          p: 1.5,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1.5,
          bgcolor: 'background.paper',
        }}
      >
        <DatePicker
          label="Payroll month"
          views={['month', 'year']}
          format="MMMM YYYY"
          value={month}
          onChange={setMonth}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
          sx={{ width: { xs: '100%', sm: 260 } }}
        />
        <Button
          size="small"
          variant="outlined"
          loading={isFetching}
          disabled={!canLoad}
          onClick={() => preview.loadPreview(true)}
          startIcon={<Iconify icon="solar:refresh-bold" />}
        >
          Refresh status
        </Button>
      </Stack>

      {!canLoad && (
        <HrNotice severity="info" sx={{ mb: 2 }}>
          Select an academic year and a valid payroll month to check readiness.
        </HrNotice>
      )}
      {preview.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Could not load payroll readiness for this month. Refresh status to try again.
        </Alert>
      )}
      {!preview.isCurrent && data && (
        <HrNotice severity="info" sx={{ mb: 2 }}>
          These are the last completed results. Calculate and review the current month before
          locking.
        </HrNotice>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%', p: 2, boxShadow: 'none' }}>
            <Typography variant="subtitle1">Current cycle</Typography>
            <Typography variant="h5" sx={{ mt: 0.5 }}>
              {monthKey ? month!.format('MMMM YYYY') : 'Select a month'}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1} sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {metrics.map((metric) => (
                <Stack
                  key={metric.label}
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.secondary">
                    {metric.label}
                  </Typography>
                  {isLoading ? (
                    <Skeleton width={48} />
                  ) : (
                    <Typography variant="subtitle2">{metric.value ?? 'Unavailable'}</Typography>
                  )}
                </Stack>
              ))}
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              p: 2,
              boxShadow: 'none',
              borderColor: hasBlockers ? 'warning.main' : 'divider',
            }}
          >
            <Typography variant="subtitle1">Needs attention</Typography>
            <Stack spacing={2} sx={{ mt: 1.5 }}>
              {isLoading ? (
                <Skeleton variant="rounded" height={100} />
              ) : !data ? (
                <Typography variant="body2" color="text.secondary">
                  Readiness is unavailable. Load this month before reviewing payroll.
                </Typography>
              ) : hasBlockers ? (
                <>
                  {issues.map((issue) => (
                    <Box key={issue.label}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon={issue.icon} width={20} color="warning.main" />
                        <Typography variant="subtitle2">
                          {issue.label} ({issue.count})
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                        {issue.description}
                      </Typography>
                      <Button
                        component={RouterLink}
                        href={issue.href}
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="solar:arrow-right-up-bold" />}
                      >
                        {issue.action}
                      </Button>
                    </Box>
                  ))}
                  {data.blockingIssues.map((issue) => (
                    <Typography key={issue} variant="body2" color="text.secondary">
                      {issue}
                    </Typography>
                  ))}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {hasCurrentReadiness
                    ? 'No readiness blockers detected. Review the payroll register before locking.'
                    : 'Refresh status to confirm readiness for this month.'}
                </Typography>
              )}
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%', p: 2, boxShadow: 'none' }}>
            <Typography variant="subtitle1">Quick actions</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              Review the monthly register, then generate payslips for locked payroll.
            </Typography>
            <Stack spacing={1} alignItems="flex-start">
              <Button
                component={RouterLink}
                href={hrPaths.payroll.runPayroll}
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:play-circle-bold" />}
              >
                Open payroll workbench
              </Button>
              <Button
                component={RouterLink}
                href={hrPaths.payroll.payslipGeneration}
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:file-send-linear" />}
              >
                Open payslips
              </Button>
              <Button
                component={RouterLink}
                href={hrPaths.payroll.settings.salaryTemplates}
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:wallet-money-linear" />}
              >
                Review salary templates
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PayrollHome;

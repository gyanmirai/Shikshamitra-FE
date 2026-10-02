'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useMemo, useCallback } from 'react';
import { hrPaths } from 'src/constants/hr-menus';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetHROperationalStaffQuery,
  useGetHROperationalOverviewQuery,
} from 'src/redux/hr/hrOperationalDashboardApi';
import {
  Box,
  Card,
  Stack,
  Alert,
  Button,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';

import OperationalStaffOverview from './components/OperationalStaffOverview';
import OperationalDashboardSecondary from './components/OperationalDashboardSecondary';
import {
  indiaToday,
  dailyStatus,
  formatCount,
  formatUpdatedAt,
  formatSchoolDate,
  parseDashboardState,
  dashboardPermissions,
  isDashboardAccessError,
} from './operational-dashboard-state';

const SummarySkeleton = () => (
  <Box
    aria-label="Loading staff summary"
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' },
      gap: 1.5,
    }}
  >
    {Array.from({ length: 6 }, (_, i) => (
      <Skeleton key={i} height={98} variant="rounded" />
    ))}
  </Box>
);

export default function OperationalDashboard({ cacheIdentity }: { cacheIdentity: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const state = parseDashboardState(new URLSearchParams(params.toString()));
  const granted = (permission: string) => hasGrantedPermission(permissions, permission);
  const canView = granted(dashboardPermissions.view);
  const overviewArgs = useMemo(
    () => ({
      accessKey: cacheIdentity,
      date: state.date,
      ...(state.group ? { isTeaching: state.group === 'teaching' } : {}),
      ...(state.stage ? { educationMediumStageId: state.stage } : {}),
      ...(state.department ? { department: state.department } : {}),
      ...(state.shift ? { shiftId: state.shift } : {}),
    }),
    [cacheIdentity, state.date, state.group, state.stage, state.department, state.shift]
  );
  const options = {
    skip: !canView,
    pollingInterval: 60000,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  };
  const overview = useGetHROperationalOverviewQuery(overviewArgs, options);
  const accessDenied = isDashboardAccessError(overview.error);
  const data = accessDenied ? undefined : overview.currentData;
  const capabilities = data?.capabilities;
  const canViewStaff =
    !accessDenied && granted(dashboardPermissions.staff) && capabilities?.canViewStaff !== false;
  const canViewAttendance =
    granted(dashboardPermissions.attendance) && capabilities?.canViewAttendance === true;
  const staff = useGetHROperationalStaffQuery(
    {
      ...overviewArgs,
      search: state.search || undefined,
      status: state.status || undefined,
      sorting: state.sorting,
      skipCount: (state.page - 1) * state.pageSize,
      maxResultCount: state.pageSize,
    },
    { ...options, skip: !canView || !canViewStaff }
  );

  const update = useCallback(
    (values: Record<string, string | number>, resetPage = true) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(values).forEach(([key, value]) => {
        if (value === '') next.delete(key);
        else next.set(key, String(value));
      });
      if (resetPage) next.delete('page');
      router.replace(`${hrPaths.dashboard}?${next.toString()}`, { scroll: false });
    },
    [params, router]
  );
  const selectStatus = (status: string) => {
    update({ status: state.status === status ? '' : status });
    document
      .getElementById('hr-staff-overview')
      ?.scrollIntoView({ behavior: 'instant', block: 'start' });
  };
  const refresh = () => {
    overview.refetch();
    if (canViewStaff) staff.refetch();
  };
  const initialLoading = overview.isLoading || (!data && overview.isFetching);
  const canMark =
    granted(dashboardPermissions.markAttendanceView) &&
    granted(dashboardPermissions.markAttendance) &&
    capabilities?.canMarkAttendance;
  const metrics: Array<{ key: string; label: string; value: number; status: string }> =
    data?.summary
      ? [
          {
            key: 'staffCount',
            label: 'Staff in scope',
            value: data.summary.staffCount,
            status: '',
          },
          { key: 'present', label: 'Present', value: data.summary.present, status: 'Present' },
          { key: 'absent', label: 'Absent', value: data.summary.absent, status: 'Absent' },
          { key: 'onLeave', label: 'On leave', value: data.summary.onLeave, status: 'OnLeave' },
          { key: 'halfDay', label: 'Half day', value: data.summary.halfDay, status: 'HalfDay' },
          {
            key: 'notMarked',
            label: 'Not marked',
            value: data.summary.notMarked,
            status: 'NotMarked',
          },
        ]
      : [];

  return (
    <Box
      data-testid="hr-dashboard-shell"
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minWidth: 0, pb: 3 }}
    >
      <CustomBreadcrumbs
        heading="HR Dashboard"
        headingComponent="h1"
        description="See staff attendance, resolve daily exceptions, and open the next permitted workflow."
        links={[{ name: 'HR/Staff', href: hrPaths.dashboard }, { name: 'HR Dashboard' }]}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {canMark ? (
              <Button
                component={RouterLink}
                href={`${hrPaths.attendance.markAttendance}?date=${state.date}`}
                size="small"
                variant="outlined"
              >
                Mark attendance
              </Button>
            ) : null}
            {canView ? (
              <Button
                size="small"
                variant="contained"
                onClick={refresh}
                disabled={overview.isFetching || staff.isFetching}
                startIcon={<Iconify icon="mdi:refresh" />}
                aria-label="Refresh HR dashboard"
              >
                Refresh
              </Button>
            ) : null}
          </Stack>
        }
      />
      {!canView ? (
        <Alert severity="info">Your account does not have HR dashboard access.</Alert>
      ) : (
        <>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Box>
              <Typography variant="subtitle2">{formatSchoolDate(state.date)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {data?.scopeLabel || 'Authorized staff scope'}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color={overview.isError ? 'warning.main' : 'text.secondary'}
              role="status"
            >
              {overview.isError && data ? 'Stale data · ' : ''}
              {data
                ? `Updated ${formatUpdatedAt(data.generatedAt)} IST`
                : initialLoading
                  ? 'Loading current data...'
                  : 'Data unavailable'}
            </Typography>
          </Stack>
          {overview.isFetching && !initialLoading ? (
            <LinearProgress aria-label="Refreshing dashboard" />
          ) : null}
          {overview.isError ? (
            <Alert
              severity="warning"
              action={
                <Button onClick={refresh} color="inherit">
                  Retry
                </Button>
              }
            >
              {accessDenied
                ? 'Dashboard access has changed. Reload to update your access.'
                : data
                  ? 'The dashboard could not refresh. Displayed data may be stale.'
                  : 'The dashboard could not be loaded.'}
            </Alert>
          ) : null}
          {initialLoading ? <SummarySkeleton /> : null}
          {!initialLoading &&
          !accessDenied &&
          granted(dashboardPermissions.attendance) &&
          capabilities?.canViewAttendance !== false &&
          data?.attendanceState !== 'Available' ? (
            <Box
              aria-label="Staff summary unavailable"
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(6, minmax(0, 1fr))',
                },
                gap: 1.5,
              }}
            >
              {['Staff in scope', 'Present', 'Absent', 'On leave', 'Half day', 'Not marked'].map(
                (label) => (
                  <Card
                    key={label}
                    sx={{ p: 2, boxShadow: 'none', border: 1, borderColor: 'divider' }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography sx={{ mt: 0.75 }} variant="subtitle2">
                      Unavailable
                    </Typography>
                  </Card>
                )
              )}
            </Box>
          ) : null}
          {canViewAttendance && data?.attendanceState === 'Available' ? (
            <>
              <Box
                aria-label="Staff summary"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(6, minmax(0, 1fr))',
                  },
                  gap: 1.5,
                }}
              >
                {metrics.map((metric) => (
                  <Card
                    key={metric.key}
                    sx={{
                      border: 1,
                      borderColor: state.status === metric.status ? 'primary.main' : 'divider',
                      boxShadow: 'none',
                    }}
                  >
                    <Box
                      component="button"
                      disabled={!canViewStaff}
                      onClick={() => selectStatus(metric.status)}
                      aria-pressed={state.status === metric.status}
                      aria-label={`${metric.label}: ${formatCount(metric.value)}`}
                      sx={{
                        width: 1,
                        p: 2,
                        textAlign: 'left',
                        border: 0,
                        bgcolor: 'transparent',
                        color: 'text.primary',
                        cursor: canViewStaff ? 'pointer' : 'default',
                        '&:focus-visible': {
                          outline: '2px solid',
                          outlineColor: 'primary.main',
                          outlineOffset: -3,
                        },
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {metric.label}
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 0.75 }}>
                        {formatCount(metric.value)}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Attendance still being collected is shown as Not marked.
                </Typography>
                <Button
                  size="small"
                  disabled={!canViewStaff}
                  onClick={() => selectStatus('NotScheduled')}
                >
                  {data.summary?.notScheduled} not scheduled
                </Button>
                <Button
                  size="small"
                  disabled={!canViewStaff}
                  onClick={() => selectStatus('NeedsSetup')}
                >
                  {data.summary?.needsSetup} need setup
                </Button>
              </Stack>
            </>
          ) : data ? (
            <Alert severity={data.attendanceState === 'Failed' ? 'warning' : 'info'}>
              {data.attendanceState === 'Failed'
                ? 'Attendance summary is unavailable. Refresh to try again.'
                : 'Attendance summary is not included in your current access.'}
              {data.workforceState === 'Available' && data.staffCount != null
                ? ` Staff in scope: ${formatCount(data.staffCount)}.`
                : ''}
            </Alert>
          ) : null}
          <Card component="section" aria-label="Dashboard filters" sx={{ p: 2 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(5, minmax(0, 1fr))',
                },
                gap: 1.5,
              }}
            >
              <TextField
                type="date"
                label="Attendance date"
                size="small"
                value={state.date}
                onChange={(event) => {
                  if (event.target.value && event.target.value <= indiaToday())
                    update({ date: event.target.value });
                }}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: indiaToday() } }}
              />
              <TextField
                select
                size="small"
                label="Staff group"
                slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
                value={state.group}
                onChange={(event) => update({ group: event.target.value })}
              >
                <MenuItem value="">All staff groups</MenuItem>
                <MenuItem value="teaching">Teaching</MenuItem>
                <MenuItem value="nonTeaching">Non-teaching</MenuItem>
              </TextField>
              <TextField
                select
                size="small"
                label="Medium / stage"
                slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
                value={state.stage}
                onChange={(event) => update({ stage: event.target.value })}
              >
                <MenuItem value="">All authorized stages</MenuItem>
                {data?.filters.stages.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Department"
                slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
                value={state.department}
                onChange={(event) => update({ department: event.target.value })}
              >
                <MenuItem value="">All departments</MenuItem>
                {data?.filters.departments.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Shift"
                slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
                value={state.shift}
                onChange={(event) => update({ shift: event.target.value })}
              >
                <MenuItem value="">All shifts</MenuItem>
                {data?.filters.shifts.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            {state.group ||
            state.stage ||
            state.department ||
            state.shift ||
            state.status ||
            state.search ? (
              <Button
                size="small"
                sx={{ mt: 1 }}
                onClick={() =>
                  update({
                    group: '',
                    stage: '',
                    department: '',
                    shift: '',
                    status: '',
                    search: '',
                  })
                }
              >
                Clear filters
              </Button>
            ) : null}
          </Card>
          <Box id="hr-staff-overview" sx={{ scrollMarginTop: 24, minWidth: 0 }}>
            {canViewStaff ? (
              <>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Staff attendance status"
                  slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
                  value={state.status}
                  sx={{ mb: 1.5, maxWidth: { sm: 320 } }}
                  onChange={(event) => update({ status: event.target.value })}
                >
                  <MenuItem value="">All staff</MenuItem>
                  {Object.entries(dailyStatus).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value.label}
                    </MenuItem>
                  ))}
                  <MenuItem value="Review">Needs review</MenuItem>
                </TextField>
                <OperationalStaffOverview
                  data={isDashboardAccessError(staff.error) ? undefined : staff.currentData}
                  loading={staff.isLoading || (!staff.currentData && staff.isFetching)}
                  fetching={staff.isFetching}
                  error={staff.isError}
                  onRetry={() => {
                    staff.refetch();
                  }}
                  page={state.page}
                  pageSize={state.pageSize}
                  search={state.search}
                  status={state.status}
                  sorting={state.sorting}
                  date={state.date}
                  canViewEmployees={
                    granted(dashboardPermissions.employees) &&
                    capabilities?.canViewEmployees === true
                  }
                  onSearch={(search) => {
                    if (search !== state.search) update({ search });
                  }}
                  onPage={(page, pageSize) => update({ page, pageSize }, false)}
                  onSort={(sort) => update({ sort })}
                />
              </>
            ) : data ? (
              <Card sx={{ p: 2.5 }}>
                <Typography variant="h6" component="h2">
                  Staff overview
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Staff attendance details require Attendance Tracking access.
                </Typography>
              </Card>
            ) : null}
          </Box>
          {data ? (
            <OperationalDashboardSecondary
              data={data}
              canViewStaff={canViewStaff}
              canViewAttendance={canViewAttendance}
              canViewLeave={
                granted(dashboardPermissions.leave) && capabilities?.canViewLeave === true
              }
              canViewPayroll={
                granted(dashboardPermissions.payroll) && capabilities?.canViewPayroll === true
              }
              canOpenPayroll={
                granted(dashboardPermissions.openPayroll) && capabilities?.canOpenPayroll === true
              }
              onStatus={selectStatus}
              onDate={(date) => update({ date })}
            />
          ) : null}
        </>
      )}
    </Box>
  );
}

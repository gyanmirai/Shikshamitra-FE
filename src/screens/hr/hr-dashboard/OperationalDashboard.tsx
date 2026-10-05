'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hrPaths } from 'src/constants/hr-menus';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useMemo, useState, useEffect, useCallback } from 'react';
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
  Tooltip,
  Skeleton,
  TextField,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';

import OperationalStaffOverview from './components/OperationalStaffOverview';
import OperationalAttentionStrip from './components/OperationalAttentionStrip';
import OperationalDashboardFilters from './components/OperationalDashboardFilters';
import OperationalDashboardSecondary from './components/OperationalDashboardSecondary';
import {
  indiaToday,
  formatCount,
  formatUpdatedAt,
  previousSchoolDay,
  parseDashboardState,
  dashboardPermissions,
  isDashboardAccessError,
} from './operational-dashboard-state';

const SummarySkeleton = () => (
  <Box
    aria-label="Loading staff summary"
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
      gap: 1.5,
    }}
  >
    {Array.from({ length: 6 }, (_, i) => (
      <Skeleton key={i} height={76} variant="rounded" />
    ))}
  </Box>
);

export default function OperationalDashboard({ cacheIdentity }: { cacheIdentity: string }) {
  const [announcement, setAnnouncement] = useState('');
  const [pendingSelectionURL, setPendingSelectionURL] = useState<string | null>(null);
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
      setAnnouncement('');
      setPendingSelectionURL(next.toString());
    },
    [params, router]
  );
  useEffect(() => {
    if (
      pendingSelectionURL === null ||
      params.toString() !== pendingSelectionURL ||
      overview.isFetching ||
      (canViewStaff && staff.isFetching)
    )
      return;
    setAnnouncement(
      overview.isError || (canViewStaff && staff.isError)
        ? 'Selection updated. Some data is unavailable.'
        : `Selection updated.${canViewStaff && staff.currentData ? ` ${formatCount(staff.currentData.totalCount)} matching staff.` : ''}`
    );
    setPendingSelectionURL(null);
  }, [
    pendingSelectionURL,
    params,
    overview.isFetching,
    overview.isError,
    canViewStaff,
    staff.isFetching,
    staff.isError,
    staff.currentData,
  ]);
  const selectStatus = (status: string) =>
    update({ status: state.status === status ? '' : status });
  const applyAttentionStatus = (status: string) => {
    update({ status });
    const heading = document.getElementById('hr-staff-heading');
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ behavior: 'instant', block: 'start' });
  };
  const refresh = async () => {
    setAnnouncement('');
    const results = await Promise.all([
      overview.refetch(),
      ...(canViewStaff ? [staff.refetch()] : []),
    ]);
    setAnnouncement(
      results.some((result) => result.error)
        ? 'Refresh failed. Check the displayed data state.'
        : 'Dashboard refreshed.'
    );
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
      sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 }, minWidth: 0, pb: 3 }}
    >
      <CustomBreadcrumbs
        heading="HR Dashboard"
        headingComponent="h1"
        description="Daily staff visibility and permitted actions."
        links={[{ name: 'HR/Staff', href: hrPaths.dashboard }, { name: 'HR Dashboard' }]}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {canMark ? (
              <Button
                component={RouterLink}
                href={`${hrPaths.attendance.markAttendance}?date=${state.date}`}
                size="small"
                variant="contained"
              >
                Mark attendance
              </Button>
            ) : null}
            {canView ? (
              <Button
                size="small"
                variant="outlined"
                onClick={refresh}
                disabled={overview.isFetching || staff.isFetching}
                startIcon={<Iconify icon="mdi:refresh" />}
                aria-label="Refresh HR dashboard"
                sx={{ minWidth: 110 }}
              >
                {overview.isFetching || staff.isFetching ? 'Refreshing...' : 'Refresh'}
              </Button>
            ) : null}
          </Stack>
        }
      />
      {!canView ? (
        <Alert severity="info">Your account does not have HR dashboard access.</Alert>
      ) : (
        <>
          <Stack component="section" aria-label="Dashboard context" spacing={0.5} sx={{ px: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
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
                sx={{ width: 160 }}
              />
              <Button
                size="small"
                onClick={() => update({ date: previousSchoolDay(state.date) })}
                aria-label="Previous day"
                startIcon={<Iconify icon="mdi:chevron-left" />}
                sx={{ display: { xs: 'none', md: 'inline-flex' } }}
              >
                Previous day
              </Button>
              <Tooltip title="Previous day">
                <IconButton
                  aria-label="Previous day"
                  onClick={() => update({ date: previousSchoolDay(state.date) })}
                  sx={{ display: { xs: 'inline-flex', md: 'none' }, width: 44, height: 44 }}
                >
                  <Iconify icon="mdi:chevron-left" />
                </IconButton>
              </Tooltip>
              <Button
                size="small"
                disabled={state.date === indiaToday()}
                onClick={() => update({ date: indiaToday() })}
              >
                Today
              </Button>
            </Stack>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              spacing={0.25}
            >
              <Typography variant="caption" color="text.secondary">
                {data?.scopeLabel || 'Authorized staff scope'}
              </Typography>
              <Typography
                variant="caption"
                color={overview.isError ? 'warning.main' : 'text.secondary'}
              >
                {overview.isError && data ? 'Stale data · ' : ''}
                {data
                  ? `Updated ${formatUpdatedAt(data.generatedAt)} IST`
                  : initialLoading
                    ? 'Loading current data...'
                    : 'Data unavailable'}
              </Typography>
            </Stack>
            <Box sx={{ height: 4 }}>
              {overview.isFetching && !initialLoading ? (
                <LinearProgress aria-label="Refreshing dashboard" />
              ) : null}
            </Box>
          </Stack>
          <Box
            role="status"
            aria-live="polite"
            aria-atomic="true"
            sx={{
              position: 'absolute',
              width: 1,
              height: 1,
              p: 0,
              m: -1,
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
            }}
          >
            {announcement}
          </Box>
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
                  xs: 'repeat(3, minmax(0, 1fr))',
                  md: 'repeat(6, minmax(0, 1fr))',
                },
                gap: 1.5,
              }}
            >
              {['Staff in scope', 'Present', 'Absent', 'On leave', 'Half day', 'Not marked'].map(
                (label) => (
                  <Card
                    key={label}
                    sx={{ p: 1.25, boxShadow: 'none', border: 1, borderColor: 'divider' }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography
                      sx={{ mt: 0.75, display: 'block', fontWeight: 600 }}
                      variant="caption"
                    >
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
                    xs: 'repeat(3, minmax(0, 1fr))',
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
                        p: { xs: 1, md: 1.5 },
                        minHeight: 76,
                        '&:hover': canViewStaff ? { bgcolor: 'action.hover' } : undefined,
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
                      <Typography variant="caption" color="text.secondary">
                        {metric.label}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{
                          mt: 0.25,
                          fontSize: { xs: 24, md: 30 },
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
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
                {data.summary?.notScheduled ? (
                  <Button
                    size="small"
                    disabled={!canViewStaff}
                    onClick={() => selectStatus('NotScheduled')}
                  >
                    {formatCount(data.summary?.notScheduled || 0)} not scheduled
                  </Button>
                ) : null}
                {data.summary?.needsSetup ? (
                  <Button
                    size="small"
                    disabled={!canViewStaff}
                    onClick={() => selectStatus('NeedsSetup')}
                  >
                    {formatCount(data.summary?.needsSetup || 0)} need setup
                  </Button>
                ) : null}
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
          {data ? (
            <OperationalAttentionStrip
              data={data}
              canViewStaff={canViewStaff}
              canViewAttendance={canViewAttendance}
              canViewLeave={
                granted(dashboardPermissions.leave) && capabilities?.canViewLeave === true
              }
              onStatus={applyAttentionStatus}
            />
          ) : null}
          <OperationalDashboardFilters value={state} options={data?.filters} onChange={update} />
          <Box id="hr-staff-overview" sx={{ scrollMarginTop: 24, minWidth: 0 }}>
            {canViewStaff ? (
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
                selectedStage={state.stage}
                onStatus={(status) => update({ status })}
                sorting={state.sorting}
                date={state.date}
                canViewEmployees={
                  granted(dashboardPermissions.employees) && capabilities?.canViewEmployees === true
                }
                onSearch={(search) => {
                  if (search !== state.search) update({ search });
                }}
                onPage={(page, pageSize) => update({ page, pageSize }, false)}
                onSort={(sort) => update({ sort })}
              />
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
              canViewAttendance={canViewAttendance}
              canViewPayroll={
                granted(dashboardPermissions.payroll) && capabilities?.canViewPayroll === true
              }
              canOpenPayroll={
                granted(dashboardPermissions.openPayroll) && capabilities?.canOpenPayroll === true
              }
              trendView={state.trendView}
              onView={(trendView) => update({ trendView }, false)}
              onDate={(date) => update({ date })}
            />
          ) : null}
        </>
      )}
    </Box>
  );
}

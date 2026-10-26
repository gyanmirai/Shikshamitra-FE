'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hrPaths } from 'src/constants/hr-menus';
import { Iconify } from 'src/components/iconify';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRef, useMemo, useState, useEffect } from 'react';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Stack, Alert, Button, Typography, LinearProgress } from '@mui/material';
import { useGetHROperationalOverviewQuery } from 'src/redux/hr/hrOperationalDashboardApi';

import OperationalDashboardModules from './components/OperationalDashboardModules';
import OperationalDashboardSecondary from './components/OperationalDashboardSecondary';
import {
  indiaToday,
  formatUpdatedAt,
  formatSchoolDate,
  parseDashboardState,
  dashboardPermissions,
  obsoleteDashboardKeys,
  isDashboardAccessError,
} from './operational-dashboard-state';

export default function OperationalDashboard({ cacheIdentity }: { cacheIdentity: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const granted = (name: string) => hasGrantedPermission(permissions, name);
  const canView = granted(dashboardPermissions.view);
  const state = parseDashboardState(new URLSearchParams(params.toString()));
  const [announcement, setAnnouncement] = useState('');
  const [legacyNotice, setLegacyNotice] = useState(false);
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const noticedLegacy = useRef(false);
  const args = useMemo(
    () => ({ date: state.date, accessKey: cacheIdentity }),
    [state.date, cacheIdentity]
  );
  const overview = useGetHROperationalOverviewQuery(args, {
    skip: !canView,
    pollingInterval: 60000,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const accessDenied = isDashboardAccessError(overview.error);
  const data = canView && !accessDenied ? overview.currentData : undefined;
  const visible = {
    workforce: granted(dashboardPermissions.employees) && data?.workforceState !== 'Forbidden',
    leave: granted(dashboardPermissions.leave) && data?.leaveState !== 'Forbidden',
    onboarding: granted(dashboardPermissions.onboarding) && data?.onboardingState !== 'Forbidden',
    appraisal:
      (granted(dashboardPermissions.appraisals) ||
        granted(dashboardPermissions.legacyAppraisals)) &&
      data?.appraisalState !== 'Forbidden',
  };
  const canViewAttendance =
    granted(dashboardPermissions.attendance) && data?.attendanceState !== 'Forbidden';
  const canViewPayroll =
    granted(dashboardPermissions.payroll) && data?.payrollState !== 'Forbidden';

  useEffect(() => {
    const next = new URLSearchParams(params.toString());
    const obsolete = obsoleteDashboardKeys.some((key) => next.has(key));
    if (!obsolete) return;
    obsoleteDashboardKeys.forEach((key) => next.delete(key));
    if (!noticedLegacy.current) {
      setLegacyNotice(true);
      noticedLegacy.current = true;
    }
    router.replace(`${hrPaths.dashboard}${next.size ? `?${next}` : ''}`, { scroll: false });
  }, [params, router]);

  useEffect(() => {
    if (pendingDate !== state.date || overview.isFetching) return;
    setAnnouncement(
      overview.isError
        ? 'Attendance date updated. Data is unavailable.'
        : `Attendance updated for ${formatSchoolDate(state.date)}.`
    );
    setPendingDate(null);
  }, [pendingDate, state.date, overview.isFetching, overview.isError]);

  const selectDate = (date: string) => {
    const next = new URLSearchParams(params.toString());
    next.set('date', date);
    router.replace(`${hrPaths.dashboard}?${next}`, { scroll: false });
    setAnnouncement('');
    setPendingDate(date);
  };
  const refresh = async () => {
    setAnnouncement('');
    const result = await overview.refetch();
    setAnnouncement(
      result.error ? 'Refresh failed. Check the displayed data state.' : 'Dashboard refreshed.'
    );
  };
  const loading = !data && overview.isFetching;
  const availableModules =
    Object.values(visible).some(Boolean) || canViewAttendance || canViewPayroll;

  return (
    <Box
      data-testid="hr-dashboard-shell"
      sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, pb: 2 }}
    >
      <Box data-testid="hr-dashboard-header">
        <CustomBreadcrumbs
          layout="inline"
          heading="HR Dashboard"
          headingComponent="h1"
          description="Workforce, leave, onboarding and appraisals within your permitted scope."
          links={[{ name: 'HR Dashboard' }]}
          action={
            canView && (
              <Button
                size="small"
                variant="outlined"
                onClick={refresh}
                disabled={overview.isFetching}
                startIcon={<Iconify icon="mdi:refresh" />}
                aria-label="Refresh HR dashboard"
                sx={{ minWidth: 110 }}
              >
                {overview.isFetching ? (loading ? 'Loading…' : 'Refreshing…') : 'Refresh'}
              </Button>
            )
          }
        />
        {canView && !accessDenied && (
          <Box>
            <Stack direction="row" useFlexGap flexWrap="wrap" gap={0.75} sx={{ px: 1, pb: 0.5 }}>
              <Typography variant="caption">
                {formatSchoolDate(data?.asOfDate || indiaToday())} · IST
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data?.scopeLabel || 'Your permitted staff scope'}
              </Typography>
              <Typography
                variant="caption"
                color={overview.isError ? 'text.primary' : 'text.secondary'}
                sx={{ ml: { sm: 'auto' } }}
              >
                {data
                  ? `${overview.isError ? 'Stale · ' : ''}Updated ${formatUpdatedAt(data.generatedAt)} IST`
                  : loading
                    ? 'Loading dashboard…'
                    : 'Update time unavailable'}
              </Typography>
            </Stack>
            <Box sx={{ height: 2 }}>
              {overview.isFetching && canView && (
                <LinearProgress
                  aria-label={loading ? 'Loading dashboard data' : 'Refreshing dashboard data'}
                  sx={{
                    height: 2,
                    '@media (prefers-reduced-motion: reduce)': {
                      '& .MuiLinearProgress-bar': { animation: 'none' },
                    },
                  }}
                />
              )}
            </Box>
          </Box>
        )}
      </Box>
      {!canView || accessDenied ? (
        <Alert severity="warning">You do not have permission to view the HR dashboard.</Alert>
      ) : (
        <>
          {legacyNotice && (
            <HrNotice severity="info" onClose={() => setLegacyNotice(false)}>
              Staff filters are no longer used on this dashboard. Find and filter records in Staff
              Directory or Attendance.
            </HrNotice>
          )}
          {overview.isError && (
            <Alert severity="warning">
              {data
                ? 'Refresh failed. The last successful data remains visible and may be stale.'
                : 'Dashboard data could not be loaded. Refresh to retry.'}
            </Alert>
          )}
          {!loading && !data ? null : (
            <>
              <OperationalDashboardModules data={data} visible={visible} />
              <OperationalDashboardSecondary
                data={data}
                date={state.date}
                onDate={selectDate}
                canViewAttendance={canViewAttendance}
                canViewPayroll={canViewPayroll}
              />
              {data && !availableModules && (
                <HrNotice role="alert" severity="info">
                  No HR summaries are available with your current permissions.
                </HrNotice>
              )}
            </>
          )}
        </>
      )}
      <Box
        role="status"
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clipPath: 'inset(50%)',
        }}
      >
        {loading ? 'Loading dashboard…' : announcement}
      </Box>
    </Box>
  );
}

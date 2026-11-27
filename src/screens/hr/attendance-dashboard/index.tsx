'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import Link from 'next/link';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { DatePicker } from '@mui/x-date-pickers';
import { useRouter, useSearchParams } from 'next/navigation';
import { useHRAccessKey } from 'src/hooks/use-hr-access-key';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetHRAttendanceDashboardQuery } from 'src/redux/hr/hrOperationalDashboardApi';
import { Box, Alert, Stack, Button, Skeleton, Typography, LinearProgress } from '@mui/material';
import {
  indiaToday,
  formatUpdatedAt,
  formatSchoolDate,
  parseDashboardState,
  dashboardPermissions,
  isDashboardAccessError,
} from 'src/screens/hr/hr-dashboard/operational-dashboard-state';

import { AttendanceDashboardContent } from './components/attendance-dashboard-content';

function AttendanceDashboardScreen() {
  const accessKey = useHRAccessKey();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const router = useRouter();
  const params = useSearchParams();
  const [dateError, setDateError] = useState(false);
  const today = indiaToday();
  const { date } = parseDashboardState(new URLSearchParams(params.toString()), today);
  const selectedDate = params.get('date') === date ? date : undefined;
  const canView = hasGrantedPermission(permissions, dashboardPermissions.attendance);
  const canTrack = hasGrantedPermission(permissions, dashboardPermissions.staff);
  const canMark =
    hasGrantedPermission(permissions, dashboardPermissions.markAttendanceView) &&
    hasGrantedPermission(permissions, dashboardPermissions.markAttendance);
  const query = useGetHRAttendanceDashboardQuery(
    { date: selectedDate, accessKey },
    {
      skip: !canView,
      refetchOnFocus: true,
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: true,
      pollingInterval: 60_000,
      skipPollingIfUnfocused: true,
    }
  );
  const denied = !canView || isDashboardAccessError(query.error);
  const data = denied || query.isError ? undefined : query.currentData;
  const activeDate = data?.summary.date ?? date;
  const withinCurrentYear =
    Boolean(currentYear?.startDate && currentYear.endDate) &&
    !dayjs(activeDate).isBefore(dayjs(currentYear?.startDate), 'day') &&
    !dayjs(activeDate).isAfter(dayjs(currentYear?.endDate), 'day');
  const registerHref = withinCurrentYear
    ? `${hrPaths.attendance.attendanceTracking}?startDate=${activeDate}&endDate=${activeDate}`
    : undefined;
  const loading = !denied && !query.isError && !data;
  const title = 'Attendance Dashboard';

  return (
    <Stack spacing={2} sx={{ minWidth: 0, pb: 2 }}>
      <CustomBreadcrumbs
        layout="inline"
        heading={title}
        headingComponent="h1"
        description="Check staff attendance and find records that need follow-up."
        links={[{ name: title }]}
        action={
          !denied && (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button
                size="small"
                variant="outlined"
                onClick={() => query.refetch()}
                disabled={query.isFetching}
                startIcon={<Iconify icon="mdi:refresh" aria-hidden />}
                sx={{ minHeight: 44 }}
              >
                Refresh
              </Button>
              {canMark &&
                data &&
                withinCurrentYear &&
                !data.unavailableDates.includes(activeDate) && (
                  <Button
                    component={Link}
                    href={`${hrPaths.attendance.markAttendance}?date=${activeDate}`}
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="mdi:calendar-check-outline" aria-hidden />}
                    sx={{ minHeight: 44 }}
                  >
                    Mark attendance
                  </Button>
                )}
            </Stack>
          )
        }
      />
      {denied ? (
        <Alert severity="warning">
          Attendance dashboard access is unavailable. Ask your administrator to review your
          permissions and staff scope.
        </Alert>
      ) : (
        <>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            gap={1.5}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            sx={{ px: 1 }}
          >
            <Box>
              <Typography component="p" variant="subtitle2">
                {formatSchoolDate(activeDate)} · IST
              </Typography>
              <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} role="status">
                <Typography variant="caption" color="text.secondary">
                  {data?.scopeLabel ?? 'Your permitted staff scope'}
                </Typography>
                {data && (
                  <Typography variant="caption" color="text.secondary">
                    Updated {formatUpdatedAt(data.generatedAt)} IST
                  </Typography>
                )}
                {query.isFetching && (
                  <Typography variant="caption" color="text.secondary">
                    {loading ? 'Loading attendance…' : 'Refreshing attendance…'}
                  </Typography>
                )}
              </Stack>
            </Box>
            <DatePicker
              label="Attendance date"
              format="DD/MM/YYYY"
              value={dayjs(activeDate)}
              maxDate={dayjs(data?.asOfDate ?? today)}
              onError={(error) => setDateError(Boolean(error))}
              onChange={(next, context) => {
                if (!next?.isValid() || context.validationError) return;
                const value = next.format('YYYY-MM-DD');
                if (value === activeDate) return;
                const search = new URLSearchParams(params.toString());
                search.set('date', value);
                router.push(`${hrPaths.attendance.dashboard}?${search.toString()}`, {
                  scroll: false,
                });
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  helperText: dateError ? 'Choose a valid date up to today.' : undefined,
                  sx: { width: { xs: 1, sm: 190 } },
                },
              }}
            />
          </Stack>
          <Box sx={{ height: 2 }}>
            {query.isFetching && (
              <LinearProgress
                aria-label="Loading attendance dashboard"
                sx={{
                  height: 2,
                  '@media (prefers-reduced-motion: reduce)': {
                    '& .MuiLinearProgress-bar': { animation: 'none' },
                  },
                }}
              />
            )}
          </Box>
          {query.isError && (
            <Alert severity="error">
              Attendance data could not be loaded. Select Refresh to retry.
            </Alert>
          )}
          {loading && (
            <Box aria-busy="true">
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                  gap: 2,
                  mb: 2,
                }}
              >
                {['present', 'unmarked', 'leave', 'absent'].map((metric) => (
                  <Skeleton key={metric} variant="rounded" height={118} />
                ))}
              </Box>
              <Skeleton variant="rounded" height={310} />
            </Box>
          )}
          {data && (
            <AttendanceDashboardContent
              data={data}
              canTrack={canTrack}
              registerHref={registerHref}
            />
          )}
        </>
      )}
    </Stack>
  );
}

export default AttendanceDashboardScreen;

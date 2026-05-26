'use client';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useEffect } from 'react';
import { HrDashboardPreviewShell } from 'src/screens/hr/hr-dashboard/components/HrDashboardPreviewShell';
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
} from '@mui/material';
import {
  parseHRDashboardPayload,
  useGetHRDashboardPreviewQuery,
  type HRDashboardAttendancePreview,
  useRefreshHRDashboardPreviewMutation,
} from 'src/redux/hr/hrDashboardApi';

const StatCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) => (
  <Card sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 42,
          height: 42,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          color,
          bgcolor: `${color}14`,
        }}
      >
        <Iconify icon={icon} width={22} />
      </Box>
    </Stack>
  </Card>
);

const AttendanceDashboardScreen = () => {
  const {
    data: preview,
    isLoading,
    isFetching,
    refetch,
    isError,
  } = useGetHRDashboardPreviewQuery('Attendance');
  const [refreshPreview, { isLoading: isRefreshStarting }] = useRefreshHRDashboardPreviewMutation();
  const data = useMemo(
    () => parseHRDashboardPayload<HRDashboardAttendancePreview>(preview),
    [preview]
  );

  useEffect(() => {
    if (preview?.status === 'Empty') refreshPreview('Attendance');
  }, [preview?.status, refreshPreview]);

  useEffect(() => {
    if (preview?.status !== 'Refreshing') return undefined;
    const id = window.setInterval(() => refetch(), 5000);
    return () => window.clearInterval(id);
  }, [preview?.status, refetch]);

  if (isLoading) {
    return <Skeleton variant="rounded" height={420} />;
  }

  return (
    <HrDashboardPreviewShell
      title="Attendance Dashboard"
      subtitle={
        data ? `Stored attendance preview for ${dayjs(data.date).format('DD MMM YYYY')}` : undefined
      }
      preview={preview}
      isFetching={isFetching}
      isRefreshing={isRefreshStarting}
      onRefresh={() => refreshPreview('Attendance')}
    >
      {isError ? (
        <Alert severity="error">Attendance dashboard preview could not be loaded.</Alert>
      ) : null}
      {!data ? (
        <Skeleton variant="rounded" height={360} />
      ) : (
        <>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label="Present"
                value={data.present}
                icon="mdi:account-check-outline"
                color="#22C55E"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label="Absent"
                value={data.absent}
                icon="mdi:account-cancel-outline"
                color="#EF4444"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label="Missing"
                value={data.missingAttendance}
                icon="mdi:clock-alert-outline"
                color="#F59E0B"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                label="Attendance Rate"
                value={`${data.attendanceRate}%`}
                icon="mdi:chart-line"
                color="#2563EB"
              />
            </Grid>
          </Grid>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card
                sx={{
                  p: 2,
                  boxShadow: 'none',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="h6">7-Day Trend</Typography>
                <Stack spacing={1.25} sx={{ mt: 2 }}>
                  {data.trend.map((point) => {
                    const total = point.present + point.absent + point.leave || 1;
                    return (
                      <Box key={point.date}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">
                            {dayjs(point.date).format('DD MMM')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {point.present} present / {point.absent} absent / {point.leave} leave
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          sx={{ mt: 0.75, height: 8, borderRadius: 1, overflow: 'hidden' }}
                        >
                          <Box
                            sx={{
                              width: `${(point.present / total) * 100}%`,
                              bgcolor: 'success.main',
                            }}
                          />
                          <Box
                            sx={{
                              width: `${(point.leave / total) * 100}%`,
                              bgcolor: 'warning.main',
                            }}
                          />
                          <Box
                            sx={{
                              width: `${(point.absent / total) * 100}%`,
                              bgcolor: 'error.main',
                            }}
                          />
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card
                sx={{
                  p: 2,
                  boxShadow: 'none',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="h6">Top Attendance Exceptions</Typography>
                <Stack divider={<Divider flexItem />} sx={{ mt: 1 }}>
                  {data.topDefaulters.length ? (
                    data.topDefaulters.map((item) => (
                      <Stack
                        key={item.employeeId}
                        direction="row"
                        justifyContent="space-between"
                        sx={{ py: 1 }}
                      >
                        <Box>
                          <Typography variant="subtitle2">{item.employeeName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.employeeIdentifier}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.missingAttendance + item.absences} issues
                        </Typography>
                      </Stack>
                    ))
                  ) : (
                    <Alert severity="success">
                      No attendance exceptions in the stored preview.
                    </Alert>
                  )}
                </Stack>
              </Card>
            </Grid>
          </Grid>

          <Button
            href="/hr/manual-attendance"
            variant="contained"
            startIcon={<Iconify icon="solar:calendar-mark-linear" />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Mark Attendance
          </Button>
        </>
      )}
    </HrDashboardPreviewShell>
  );
};

export default AttendanceDashboardScreen;

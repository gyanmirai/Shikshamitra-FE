import type { EmployeeDashboardData } from 'src/redux/hr/employeeApi';

import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { Box, Paper, Alert, Button, Skeleton, Typography } from '@mui/material';
import { useGetCurrentEmployeeQuery, useGetEmployeeDashboardQuery } from 'src/redux/hr/employeeApi';

import { hasEmployeeAttendanceTrend } from '../employee-dashboard-utils';

const AttendanceTrendChart = dynamic(() => import('./EmployeeAttendanceTrendChart'), {
  loading: () => <Skeleton variant="rounded" height={320} aria-label="Loading attendance trend" />,
});

export function EmployeeAttendanceTrend({ data }: { data: EmployeeDashboardData }) {
  if (hasEmployeeAttendanceTrend(data)) return <AttendanceTrendChart data={data} />;

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label="Attendance trend"
      sx={{ p: 2, borderRadius: 2 }}
    >
      <Typography component="h3" variant="subtitle2">
        Attendance trend
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        No attendance records yet.
      </Typography>
    </Paper>
  );
}

// The home dashboard owns its self-service request; the staff profile supplies its data directly.
const ProfileDashboardAttendanceTrend = () => {
  const {
    currentData: employee,
    isFetching: isEmployeeLoading,
    isError: isEmployeeError,
    refetch: refetchEmployee,
  } = useGetCurrentEmployeeQuery(undefined);
  const {
    currentData: data,
    isFetching,
    isError,
    refetch,
  } = useGetEmployeeDashboardQuery(
    { employeeId: employee?.id ?? '', date: dayjs().format('YYYY-MM-DD') },
    { skip: !employee?.id }
  );

  if (!data && (isEmployeeLoading || isFetching)) return <Skeleton variant="rounded" height={80} />;
  if (!data)
    return (
      <Alert
        severity="error"
        action={
          <Button
            size="small"
            color="inherit"
            onClick={() => (isEmployeeError || !employee?.id ? refetchEmployee() : refetch())}
          >
            Retry
          </Button>
        }
      >
        Attendance trend could not be loaded.
      </Alert>
    );

  return (
    <Box aria-busy={isFetching}>
      {isError && (
        <Alert
          severity="warning"
          action={
            <Button size="small" color="inherit" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Could not refresh attendance. Showing the last loaded data.
        </Alert>
      )}
      <EmployeeAttendanceTrend data={data} />
    </Box>
  );
};

export default ProfileDashboardAttendanceTrend;

import dayjs from 'dayjs';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Alert, Stack, Button, LinearProgress } from '@mui/material';
import { useGetCurrentEmployeeQuery, useGetEmployeeDashboardQuery } from 'src/redux/hr/employeeApi';

import EmployeeDashboardSkeleton from './employee-dashboard-skeleton';
import EmployeeProfileOverview from './profileDashboardComponent/ProfileOverview';
import EmployeeUpcomingHolidays from './profileDashboardComponent/EmployeeUpcomingHolidays';
import ProfileDashboardAttendance from './profileDashboardComponent/ProfileDashboardAttendance';
import { EmployeeAttendanceTrend } from './profileDashboardComponent/ProfileDashboardAttendanceTrend';

const EmployeeProfileDashboard = ({ editData }: { editData?: { id?: string } | null }) => {
  const explicitEmployeeId = editData?.id;
  const {
    currentData: currentEmployee,
    isFetching: isCurrentEmployeeLoading,
    isError: isCurrentEmployeeError,
    refetch: refetchEmployee,
  } = useGetCurrentEmployeeQuery(undefined, { skip: Boolean(explicitEmployeeId) });
  const employeeId = explicitEmployeeId ?? currentEmployee?.id;
  const {
    currentData: data,
    isFetching,
    isError,
    refetch,
  } = useGetEmployeeDashboardQuery(
    { employeeId: employeeId ?? '', date: dayjs().format('YYYY-MM-DD') },
    { skip: !employeeId }
  );

  if ((!explicitEmployeeId && isCurrentEmployeeLoading) || (!data && isFetching)) {
    return <EmployeeDashboardSkeleton />;
  }

  if (!explicitEmployeeId && (isCurrentEmployeeError || !employeeId)) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetchEmployee()}>
            Retry
          </Button>
        }
      >
        Staff profile could not be loaded. Please retry.
      </Alert>
    );
  }

  if (!data) {
    return isError ? (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      >
        Staff dashboard data could not be loaded. Please retry.
      </Alert>
    ) : (
      <EmptyContent title="Staff dashboard is unavailable" />
    );
  }

  return (
    <Stack
      spacing={1.5}
      sx={{ minWidth: 0, position: 'relative', pb: 2 }}
      aria-busy={isFetching}
      data-testid="staff-profile-dashboard"
    >
      {isFetching && (
        <LinearProgress
          aria-label="Refreshing staff dashboard"
          sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        />
      )}
      {isError && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          Could not refresh the dashboard. Showing the last loaded data.
        </Alert>
      )}
      {data.dataNotice && <Alert severity="info">{data.dataNotice}</Alert>}
      <EmployeeProfileOverview data={data} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 5fr) minmax(0, 7fr)' },
          gap: 1.5,
          alignItems: 'start',
        }}
      >
        <ProfileDashboardAttendance data={data} />
        <EmployeeUpcomingHolidays data={data} />
      </Box>
      <EmployeeAttendanceTrend data={data} />
    </Stack>
  );
};

export default EmployeeProfileDashboard;

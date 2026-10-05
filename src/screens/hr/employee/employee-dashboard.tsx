import React from 'react';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Grid, Alert, Stack, Button, Skeleton } from '@mui/material';
import { useGetCurrentEmployeeQuery, useGetEmployeeDashboardQuery } from 'src/redux/hr/employeeApi';

import EmployeeProfileOverview from './profileDashboardComponent/ProfileOverview';
import EmployeeUpcomingHolidays from './profileDashboardComponent/EmployeeUpcomingHolidays';
import ProfileDashboardAttendance from './profileDashboardComponent/ProfileDashboardAttendance';
import ProfileDashboardAttendanceTrend from './profileDashboardComponent/ProfileDashboardAttendanceTrend';

const enterCurve = [0.22, 1, 0.36, 1] as const;

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const slideUpItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: enterCurve } },
};

const EmployeeDashboardSkeleton = () => (
  <Stack spacing={1.5} aria-label="Loading staff dashboard">
    <Grid container spacing={1.5}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <Skeleton variant="rounded" height={104} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Skeleton variant="rounded" height={380} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Skeleton variant="rounded" height={380} />
      </Grid>
    </Grid>
    <Skeleton variant="rounded" height={320} />
  </Stack>
);

const EmployeeProfileDashboard = ({ editData }: { editData: any }) => {
  const explicitEmployeeId = editData?.id as string | undefined;
  const {
    data: currentEmployee,
    isLoading: isCurrentEmployeeLoading,
    isError: isCurrentEmployeeError,
  } = useGetCurrentEmployeeQuery(undefined, { skip: Boolean(explicitEmployeeId) });
  const employeeId = explicitEmployeeId ?? currentEmployee?.id;
  const {
    data,
    isLoading: isDashboardLoading,
    isFetching,
    isError,
    refetch,
  } = useGetEmployeeDashboardQuery(
    { employeeId: employeeId ?? '', date: dayjs().format('YYYY-MM-DD') },
    { skip: !employeeId }
  );

  if (isCurrentEmployeeLoading || isDashboardLoading) {
    return <EmployeeDashboardSkeleton />;
  }

  if (isCurrentEmployeeError || !employeeId) {
    return <EmptyContent title="Staff profile could not be loaded" />;
  }

  if (isError || !data) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      >
        Staff dashboard data could not be loaded.
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 280px)',
        minWidth: 0,
      }}
      aria-busy={isFetching}
    >
      <Scrollbar sx={{ flexGrow: 1, height: '100%' }}>
        <motion.div variants={staggerContainer} initial="hidden" animate="show">
          <Grid container spacing={1.5} sx={{ alignItems: 'stretch', minWidth: 0 }}>
            {data.dataNotice && (
              <Grid size={12}>
                <Alert severity="info">{data.dataNotice}</Alert>
              </Grid>
            )}

            <Grid size={12}>
              <motion.div variants={slideUpItem}>
                <EmployeeProfileOverview data={data} />
              </motion.div>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div variants={slideUpItem} style={{ height: '100%' }}>
                <ProfileDashboardAttendance data={data} />
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div variants={slideUpItem} style={{ height: '100%' }}>
                <EmployeeUpcomingHolidays data={data} />
              </motion.div>
            </Grid>

            <Grid size={12}>
              <motion.div variants={slideUpItem}>
                <ProfileDashboardAttendanceTrend data={data} />
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Scrollbar>
    </Box>
  );
};

export default EmployeeProfileDashboard;

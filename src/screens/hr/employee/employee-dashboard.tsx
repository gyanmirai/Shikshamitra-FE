import React from 'react';
import { Box, Grid } from '@mui/material';
import AllInfoCalendar from 'src/screens/main-dashboard/admin/components/AllInfoCalendar';

import EmployeeProfileOverview from './profile-dashboard-component/ProfileOverview';
import ProfileDashboardAttendance from './profile-dashboard-component/ProfileDashboardAttendance';
import ProfileDashboardAttendanceTrend from './profile-dashboard-component/ProfileDashboardAttendanceTrend';

const EmployeeProfileDashboard = ({ editData }: { editData: any }) => (
  <Box sx={{ pb: 1 }}>
    <Grid container spacing={1}>
      <Grid size={12}>
        <EmployeeProfileOverview />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ProfileDashboardAttendance />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <AllInfoCalendar />
      </Grid>

      {/* <Grid size={{ xs: 12, md: 6 }}>
        <StudentHomeworkAssignments />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <RecentActivities activities={activities} />
      </Grid> */}

      <Grid size={12}>
        <ProfileDashboardAttendanceTrend />
      </Grid>
      {/* <Grid xs={12}>
          <Card sx={{ height: '100%', p: 2 }}>
            <Grid size={{xs:12, md:6}}>
              <BoardEnrollmentStatus />
            </Grid>
            <Grid size={{xs:12, md:6}}>
              <OrganizationStatus />
            </Grid>
          </Card>
        </Grid> */}
      {/* <Grid xs={12}>
          <EntranceExamCard />
        </Grid>
        <Grid xs={12}>
          <EnrollmentActivities />
        </Grid> */}
    </Grid>

    {/* <Grid2 container spacing={2}>
        {sections.map((section: any) => dashBoardSections[section.id])}
      </Grid2> */}
  </Box>
);

export default EmployeeProfileDashboard;

import React from 'react';

import { Box } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';

import RecentActivities from 'src/app/(auth-route)/student/overview/recent-activities';

import EmployeeProfileOverview from './profileDashboardComponent/ProfileOverview';
import ProfileDashboardAttendance from './profileDashboardComponent/ProfileDashboardAttendance';
import StudentHomeworkAssignments from './profileDashboardComponent/HRProfileHomeworkAssignment';
import ProfileDashboardAttendanceTrend from './profileDashboardComponent/ProfileDashboardAttendanceTrend';

const activities = [
  {
    color: 'success',
    title: 'Roll No. assigned to Yuvraj Singh',
    subtitle: 'Class 5-B · Roll No.-12',
    timeAgo: '2 hours ago',
    date: '06-07-2025',
  },
  {
    color: 'info',
    title: 'Division Changed for Meera Patel',
    subtitle: 'Class 4-B ➝ 4-C',
    timeAgo: '4 hours ago',
    date: '06-07-2025',
  },
  {
    color: 'success',
    title: 'New Student added to Blue House',
    subtitle: 'Anjali Sharma · Class 3-A',
    timeAgo: '6 hours ago',
    date: '06-07-2025',
  },
  {
    color: 'success',
    title: 'GR No. generated for Kiran Kumar',
    subtitle: 'GR2025001847',
    timeAgo: '1 day ago',
    date: '05-07-2025',
  },
  {
    color: 'warning',
    title: 'House change request pending',
    subtitle: 'Anjali Sharma · Green to Red House',
    timeAgo: '2 days ago',
    date: '04-07-2025',
  },
  {
    color: 'error',
    title: 'Attendance marked absent',
    subtitle: 'Rahul Verma · Class 6-A',
    timeAgo: '3 days ago',
    date: '03-07-2025',
  },
  {
    color: 'info',
    title: 'Fee payment received',
    subtitle: 'Priya Shah · Term 2 Fees',
    timeAgo: '4 days ago',
    date: '02-07-2025',
  },
  {
    color: 'success',
    title: 'Sports team selection',
    subtitle: 'Arjun Kumar · Football Team',
    timeAgo: '5 days ago',
    date: '01-07-2025',
  },
  {
    color: 'warning',
    title: 'Parent meeting scheduled',
    subtitle: 'Neha Gupta · Class 7-B',
    timeAgo: '1 week ago',
    date: '29-06-2025',
  },
  {
    color: 'info',
    title: 'Academic achievement',
    subtitle: 'Sanya Malhotra · Science Quiz Winner',
    timeAgo: '1 week ago',
    date: '29-06-2025',
  },
] as const;

const EmployeeProfileDashboard = ({ editData }: { editData: any }) => (
  <Box>
    <Grid2 container spacing={2} sx={{ mb: 2 }}>
      <Grid2 xs={12}>
        <EmployeeProfileOverview />
      </Grid2>
      <Grid2 xs={12} md={6}>
        <ProfileDashboardAttendance />
      </Grid2>{' '}
      <Grid2 xs={12} md={6}>
        <ProfileDashboardAttendance />
      </Grid2>
      <Grid2 xs={12} md={6}>
        <StudentHomeworkAssignments />
      </Grid2>
      <Grid2 xs={12} md={6}>
        <RecentActivities activities={activities} />
      </Grid2>
      <Grid2 xs={12}>
        <ProfileDashboardAttendanceTrend />
      </Grid2>
      {/* <Grid2 xs={12}>
          <Card sx={{ height: '100%', p: 2 }}>
            <Grid2 xs={12} md={6}>
              <BoardEnrollmentStatus />
            </Grid2>
            <Grid2 xs={12} md={6}>
              <OrganizationStatus />
            </Grid2>
          </Card>
        </Grid2> */}
      {/* <Grid2 xs={12}>
          <EntranceExamCard />
        </Grid2>
        <Grid2 xs={12}>
          <EnrollmentActivities />
        </Grid2> */}
    </Grid2>

    {/* <Grid2 container spacing={2}>
        {sections.map((section: any) => dashBoardSections[section.id])}
      </Grid2> */}
  </Box>
);

export default EmployeeProfileDashboard;

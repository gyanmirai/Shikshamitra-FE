'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';
import RecentActivities from 'src/app/(auth-route)/student/overview/recent-activities';

import ElectiveSubjectPopularity from './components/electiveSubjectPopularity';
import ClassManagementDashboardOverview from './components/classDashboardOverview';
import ClassTeacherAssignment from './components/classManagementClassTeacherAssignment';
import ClassManagementSubjectProgress from './components/classManagementSubjectProgress';
import ClassManagementTeacherAssignment from './components/classManagementTeacherAssignment';

const activities = [
  {
    color: 'info',
    title: 'Computer elective assigned to Aarav',
    subtitle: 'Class 9B',
    timeAgo: '2 hours ago',
    date: '06-07-2025',
  },
  {
    color: 'success',
    title: 'Chapter 5 marked completed',
    subtitle: 'Class 6C - History',
    timeAgo: '4 hours ago',
    date: '06-07-2025',
  },
  {
    color: 'error',
    title: 'Leave applied for 1 day (approved)',
    subtitle: 'Personal Leave - June 15th',
    timeAgo: '6 hours ago',
    date: '06-07-2025',
  },
  {
    color: 'primary',
    title: 'Conducted Unit Test',
    subtitle: 'Mathematics - Class 6A & 6B',
    timeAgo: '1 day ago',
    date: '05-07-2025',
  },
  {
    color: 'success',
    title: 'Updated lesson plan for Class 7B',
    subtitle: 'Science - Acids and Bases',
    timeAgo: '2 day ago',
    date: '04-07-2025',
  },
];

const ClassManagementDashboard = () => (
  <Box>
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12 }}>
        <ClassManagementDashboardOverview />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ElectiveSubjectPopularity />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <RecentActivities activities={activities} />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ClassManagementTeacherAssignment />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <ClassTeacherAssignment />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <ClassManagementSubjectProgress />
      </Grid>

      {/* Commented code (optional conversion if needed)
  <Grid size={{ xs: 12, md: 6 }}>
    <ProfileDashboardAttendance />
  </Grid>
  <Grid size={{ xs: 12, md: 6 }}>
    <ProfileDashboardAttendance />
  </Grid>
  <Grid size={{ xs: 12, md: 6 }}>
    <StudentHomeworkAssignments />
  </Grid>
  <Grid size={{ xs: 12, md: 6 }}>
    <RecentActivities activities={activities} />
  </Grid>
  <Grid size={{ xs: 12 }}>
    <ProfileDashboardAttendanceTrend />
  </Grid>
  <Grid size={{ xs: 12 }}>
    <Card sx={{ height: '100%', p: 2 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <BoardEnrollmentStatus />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <OrganizationStatus />
      </Grid>
    </Card>
  </Grid>
  <Grid size={{ xs: 12 }}>
    <EntranceExamCard />
  </Grid>
  <Grid size={{ xs: 12 }}>
    <EnrollmentActivities />
  </Grid>
  */}
    </Grid>

    {/* <Grid2 container spacing={2}>
        {sections.map((section: any) => dashBoardSections[section.id])}
      </Grid2> */}
  </Box>
);

export default ClassManagementDashboard;

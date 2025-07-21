'use client';

import React from 'react';

import { Box } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';

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
    <Grid2 container spacing={2} sx={{ mb: 2 }}>
      <Grid2 xs={12}>
        <ClassManagementDashboardOverview />
      </Grid2>
      <Grid2 xs={12} md={6}>
        <ElectiveSubjectPopularity />
      </Grid2>
      <Grid2 xs={12} md={6}>
        <RecentActivities activities={activities} />
      </Grid2>
      <Grid2 xs={12} md={6}>
        <ClassManagementTeacherAssignment />
      </Grid2>
      <Grid2 xs={12} md={6}>
        <ClassTeacherAssignment />
      </Grid2>
      <Grid2 xs={12}>
        <ClassManagementSubjectProgress />
      </Grid2>
      {/* <Grid2 xs={12} md={6}>
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
      </Grid2> */}
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

export default ClassManagementDashboard;

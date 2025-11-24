'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Box, Grid } from '@mui/material';
import React, { useState, useEffect } from 'react';
import BirthdaySection from 'src/app/(auth-route)/student/overview/student-birthdate';

import HRDashboardOverview from './components/HrDashboardOverview';
import PayrollStatusCard from './components/HRDashboardPayrollStatusCard';
import LeaveManagementCard from './components/HRDashboardLeaveManagementCard';
import EmployeeRecentActivities from './components/HRDashboardRecentActivities';
import HRDashboardAttendanceTrend from './components/HRDashboardAttendanceTrend';
import HRDashboardRecentPayrollRunsCard from './components/HRDashboardRecentPayrollRunsCard';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const activities = [
  {
    color: 'success',
    title: 'Science Homework assigned',
    subtitle: 'Class 5-B · Due: 30 June',
    timeAgo: '2 hours ago',
    date: '06-07-2025',
  },
  {
    color: 'info',
    title: 'Mid-Term exam scheduled',
    subtitle: 'Class 4-B ⇔ 15 July',
    timeAgo: '4 hours ago',
    date: '06-07-2025',
  },
  {
    color: 'success',
    title: '3 chapter completed to social studies',
    subtitle: 'Anjali Sharma · Class 3-A',
    timeAgo: '6 hours ago',
    date: '06-07-2025',
  },
  {
    color: 'success',
    title: 'Assignment submitted by 23 student english',
    subtitle: 'Class 10-A',
    timeAgo: '1 day ago',
    date: '05-07-2025',
  },
  {
    color: 'warning',
    title: 'Timetable updated for mathemetics',
    subtitle: 'Class 9-B',
    timeAgo: '2 days ago',
    date: '04-07-2025',
  },
];

const todayBirthdays = [
  { name: 'Arjun Sharma', age: 15, className: '5A' },
  { name: 'Priya Patel', age: 14, className: '5A' },
];

const upcomingBirthdays = [
  { name: 'Arjun Sharma', age: 15, className: '5A', dateLabel: 'Tomorrow' },
  { name: 'Priya Patel', age: 14, className: '5A', dateLabel: 'Dec 28' },
];

const HRDashboardScreen = () => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [, setDivision] = useState<string>('');
  // Query hook to fetch class data from the API
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes, setDivision]);

  // const router = useRouter();
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={12}>
          <HRDashboardOverview />
        </Grid>
        <Grid size={12}>
          <HRDashboardAttendanceTrend />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <PayrollStatusCard />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <HRDashboardRecentPayrollRunsCard />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <BirthdaySection
            todaysBirthdays={todayBirthdays}
            upcomingBirthdays={upcomingBirthdays}
            title="Employees's Birthdays"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <LeaveManagementCard />
        </Grid>
        <Grid size={12}>
          <EmployeeRecentActivities />
        </Grid>
        {/* <Grid2 size={{ xs: 12, md: 6 }}>
          <AcademicDashboardChapterProgress />
        </Grid2>
        <Grid2 xs={12}>
          <AcademicDashboardTimetable />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6 }}>
          <AcademicDashboardTopPerformer />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <AcademicDashboardBottomPerformer />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <RecentActivities activities={activities} />
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <AcademicDashboardExams />
        </Grid2> */}
      </Grid>
    </Box>
  );
};

export default HRDashboardScreen;

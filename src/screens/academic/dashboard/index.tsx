'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Box , Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import RecentActivities from 'src/app/(auth-route)/student/overview/recent-activities';

import AcademicDashboardExams from './components/AcademicDashboardExams';
import AcademicDashboardOverview from './components/AcademicDashboardOverview';
import AcademicDashboardTimetable from './components/AcademicDashboardTimetable';
import AcademicDashboardTopPerformer from './components/AcademicDashboardTopPerformer';
import AcademicDashbordAnalysisChart from './components/AcademicDashbordAnalysisChart';
import AcademicDashboardChapterProgress from './components/AcademicDashboardChapterProgress';
import AcademicDashboardBottomPerformer from './components/AcademicDashboardBottomPerformer';

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

const AcademicDashboardScreen = () => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  // Query hook to fetch class data from the API
  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

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

  const router = useRouter();
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClasses(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
            />
            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => setDivision(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
              disabled={!classes}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <AcademicDashboardOverview />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AcademicDashbordAnalysisChart />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AcademicDashboardChapterProgress />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <AcademicDashboardTimetable />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AcademicDashboardTopPerformer />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AcademicDashboardBottomPerformer />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <RecentActivities activities={activities} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AcademicDashboardExams />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AcademicDashboardScreen;

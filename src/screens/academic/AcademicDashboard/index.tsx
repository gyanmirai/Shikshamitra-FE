'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Box, Grid } from '@mui/material';
import React, { useState, useEffect } from 'react';

import SummaryCards from './Components/SummaryCards';
import { PerformersList } from './Components/Performers';
import SubjectPassFailChart from './Components/SubjectPassFailChart';
import SubjectDifficultyHeatmap from './Components/SubjectDifficultyHeatmap';
import DivisionPerformanceChart from './Components/DivisionPerformanceChart';
import PlannedVsActualProgressChart from './Components/PlannedVsActualProgressChart';

const AcademicDashboardScreen = () => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');

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
    setAllDivision(allClass.find((org: Standards) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: Standards) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  const topPerformersData = [
    {
      id: '1',
      name: 'Rahul Kumar Sharma',
      avatarUrl: '/static/images/avatars/avatar_1.png',
      totalMarks: 98,
    },
    {
      id: '2',
      name: 'Priya Devi Singh',
      avatarUrl: '/static/images/avatars/avatar_2.png',
      totalMarks: 95,
    },
    {
      id: '3',
      name: 'Amit Raj Patel',
      avatarUrl: '/static/images/avatars/avatar_3.png',
      totalMarks: 92,
    },
  ];

  const bottomPerformersData = [
    {
      id: '1',
      name: 'Rohan Singh Gupta',
      avatarUrl: '/static/images/avatars/avatar_4.png',
      totalMarks: 45,
    },
    {
      id: '2',
      name: 'Sneha Kumari Devi',
      avatarUrl: '/static/images/avatars/avatar_5.png',
      totalMarks: 42,
    },
    {
      id: '3',
      name: 'Vijay Pratap Kumar',
      avatarUrl: '/static/images/avatars/avatar_6.png',
      totalMarks: 38,
    },
  ];

  return (
    <Box sx={{ pb: 1 }}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12 }}>
          <SummaryCards />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SubjectDifficultyHeatmap />
        </Grid>

        {/* <Grid size={{ xs: 12, md: 6 }}>
          <ChapterCompletionTrendChart />
        </Grid> */}

        {/* <Grid size={{ xs: 12, md: 6 }}>
          <HomeworkTrendChart />
        </Grid> */}

        {/* <Grid size={{ xs: 12, md: 6 }}>
          <ExamPerformanceHeatmap />
        </Grid> */}

        {/* <Grid size={{ xs: 12, md: 6 }}>
          <PendingEvaluationTrendChart />
        </Grid> */}

        <Grid size={{ xs: 12, md: 6 }}>
          <SubjectPassFailChart />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DivisionPerformanceChart />
        </Grid>

        {/* <Grid size={{ xs: 12, md: 6 }}>
          <TeacherWorkloadHeatmap />
        </Grid> */}

        <Grid size={{ xs: 12, md: 6 }}>
          <PlannedVsActualProgressChart />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <PerformersList
            title="Top Performers"
            list={topPerformersData}
            type="top"
            sx={{ height: '100%' }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <PerformersList
            title="Bottom Performers"
            list={bottomPerformersData}
            type="bottom"
            sx={{ height: '100%' }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AcademicDashboardScreen;

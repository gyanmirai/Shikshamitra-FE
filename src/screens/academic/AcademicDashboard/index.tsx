'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';

import SummaryCards from './Components/SummaryCards';
import { PerformersList } from './Components/Performers';
import SubjectPassFailChart from './Components/SubjectPassFailChart';
import SubjectDifficultyHeatmap from './Components/SubjectDifficultyHeatmap';
import DivisionPerformanceChart from './Components/DivisionPerformanceChart';
import PlannedVsActualProgressChart from './Components/PlannedVsActualProgressChart';

const AcademicDashboardScreen = () => {
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

'use client';

import React from 'react';
import { Box, Grid } from '@mui/material';
import TeacherSchedule from 'src/screens/mainDashboard/teacher/schedule';
import CompactKPICard from 'src/screens/student/dashboard/principal/kpi-card-item';

import AcademicDashboardTopPerformer from './components/AcademicDashboardTopPerformer';
import AcademicDashbordAnalysisChart from './components/AcademicDashbordAnalysisChart';
import AcademicDashboardChapterProgress from './components/AcademicDashboardChapterProgress';
import AcademicDashboardBottomPerformer from './components/AcademicDashboardBottomPerformer';

const kpiData = [
  {
    id: 'TOTAL_SUBJECTS',
    title: 'Total Subjects',
    value: '20',
    icon: 'hugeicons:book-edit',
    status: 'success' as const,
    tooltip: 'Core - 10 · Elective - 10',
    chart: {
      type: 'bar' as const,
      series: [10, 10] as any,
      colors: ['#00A76F', '#FF5630'],
      labels: ['Core', 'Elective'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
  {
    id: 'TOTAL_EXAMS',
    title: 'Total Exams',
    value: '20',
    icon: 'healthicons:i-exam-qualification-outline',
    status: 'info' as const,
    tooltip: 'Completed - 10 · Upcoming - 10',
    chart: {
      type: 'bar' as const,
      series: [10, 10] as any,
      colors: ['#00A76F', '#FFAB00'],
      labels: ['Completed', 'Upcoming'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
  {
    id: 'TOTAL_ASSIGNMENTS',
    title: 'Total Assignment',
    value: '20',
    icon: 'fluent-emoji-high-contrast:page-with-curl',
    status: 'secondary' as const,
    tooltip: 'Completed - 10 · Upcoming - 10',
    chart: {
      type: 'bar' as const,
      series: [10, 10] as any,
      colors: ['#00A76F', '#FFAB00'],
      labels: ['Completed', 'Upcoming'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
  {
    id: 'TOTAL_HOMEWORK',
    title: 'Total Homework',
    value: '20',
    icon: 'streamline-freehand:book-flip-page',
    status: 'info' as const,
    tooltip: 'Completed - 10 · Pending - 10',
    chart: {
      type: 'bar' as const,
      series: [10, 10] as any,
      colors: ['#00A76F', '#FF5630'],
      labels: ['Completed', 'Pending'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
  {
    id: 'TOTAL_QUIZ',
    title: 'Total Quiz',
    value: '20',
    icon: 'hugeicons:quiz-05',
    status: 'success' as const,
    tooltip: 'Completed - 10 · Scheduled - 10',
    chart: {
      type: 'bar' as const,
      series: [10, 10] as any,
      colors: ['#00A76F', '#FFAB00'],
      labels: ['Completed', 'Scheduled'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
  {
    id: 'TOTAL_RESOURCES',
    title: 'Learning Resources',
    value: '10,000',
    icon: 'ion:document',
    status: 'warning' as const,
    tooltip: 'Total learning resources available',
    chart: {
      type: 'bar' as const,
      series: [6000, 4000] as any,
      colors: ['#FFAB00', '#919EAB'],
      labels: ['Active', 'Archived'],
      width: 30,
      height: 40,
      options: {
        plotOptions: { bar: { distributed: true, borderRadius: 2, columnWidth: '55%' } },
      },
    },
  },
];

const AcademicTeacherDashboardScreen = () => (
  <Box>
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12 }}>
        <Grid container spacing={1}>
          {kpiData.map((kpi) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={kpi.id}>
              <CompactKPICard
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                status={kpi.status}
                tooltip={kpi.tooltip}
                chart={kpi.chart}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <AcademicDashbordAnalysisChart />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <AcademicDashboardChapterProgress />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <TeacherSchedule />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <AcademicDashboardTopPerformer />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <AcademicDashboardBottomPerformer />
      </Grid>
    </Grid>
  </Box>
);

export default AcademicTeacherDashboardScreen;

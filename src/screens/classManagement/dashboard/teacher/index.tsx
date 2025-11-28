'use client';

import React from 'react';
import { Box, Grid, MenuItem, TextField } from '@mui/material';

import { SubjectPerformanceChart } from './components/teacherCharts';
import TeacherUpcomingTasks from './components/teacherUpcomingTasks';
import TeacherProgressOverview from './components/teacherProgressOverview';
import TeacherDashboardOverview from './components/teacherDashboardOverview';
import TeacherClassResponsibilities from './components/teacherClassResponsibilities';

const tasks = [
  {
    color: 'warning',
    title: 'Mark Chapter 4 as completed',
    subtitle: 'Mathematics - 9A',
    timeAgo: 'Due Today',
    date: '07-07-2025',
  },
  {
    color: 'info',
    title: 'Create Unit Test for 6A Maths',
    subtitle: 'Mathematics',
    timeAgo: 'Due Tomorrow',
    date: '08-07-2025',
  },
  {
    color: 'error',
    title: 'Submit Monthly Report',
    subtitle: 'Admin Task',
    timeAgo: 'Due in 2 days',
    date: '09-07-2025',
  },
  {
    color: 'success',
    title: 'Review Homework',
    subtitle: 'Science - 7B',
    timeAgo: 'Completed',
    date: '06-07-2025',
  },
];

const TeacherDashboard = () => (
  <Box>
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField select label="Class" size="small" sx={{ minWidth: 120 }} defaultValue="">
        {[...Array(12)].map((_, i) => (
          <MenuItem key={i} value={i + 1}>
            {i + 1}
          </MenuItem>
        ))}
      </TextField>
      <TextField select label="Division" size="small" sx={{ minWidth: 120 }} defaultValue="">
        {['A', 'B', 'C'].map((div) => (
          <MenuItem key={div} value={div}>
            {div}
          </MenuItem>
        ))}
      </TextField>
      <TextField select label="Subject" size="small" sx={{ minWidth: 120 }} defaultValue="">
        {['Maths', 'Science', 'English', 'History'].map((sub) => (
          <MenuItem key={sub} value={sub}>
            {sub}
          </MenuItem>
        ))}
      </TextField>
    </Box>

    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12 }}>
        <TeacherDashboardOverview />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <SubjectPerformanceChart />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TeacherUpcomingTasks tasks={tasks} />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TeacherClassResponsibilities />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TeacherProgressOverview />
      </Grid>
    </Grid>
  </Box>
);

export default TeacherDashboard;

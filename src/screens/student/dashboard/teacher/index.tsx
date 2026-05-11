import React from 'react';
import { Box, Grid, Stack } from '@mui/material';

// Components
import TeacherKPICards from './kpi-cards';
import AbsentStudents from './absent-students';
import { UpcomingExams } from './OperationsTasks';
import StudentsNeedingAttention from './students-attention';
// eslint-disable-next-line import/extensions
import { HomeworkStatus, AttendanceTrend, SubjectPerformance } from './charts';

const TeacherDashboard = () => (
  <Box>
    <Stack spacing={1} sx={{ mb: 2 }}>
      {/* SECTION 1 – SMART KPI SUMMARY */}
      <Box>
        <TeacherKPICards />
      </Box>

      {/* SECTION 2 – UPCOMING EXAMS & ATTENDANCE TREND */}
      <Grid container spacing={1} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
          <AttendanceTrend />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
          <UpcomingExams />
        </Grid>
      </Grid>

      {/* SECTION 3 – QUICK ACTIONS & ACADEMIC PERFORMANCE */}
      <Grid container spacing={1} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
          <SubjectPerformance />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
          <HomeworkStatus />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <StudentsNeedingAttention />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <AbsentStudents />
        </Grid>
      </Grid>
    </Stack>
  </Box>
);

export default TeacherDashboard;

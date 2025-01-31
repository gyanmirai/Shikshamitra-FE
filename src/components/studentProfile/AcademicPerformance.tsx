import React from 'react';

import { Box, Grid, Typography } from '@mui/material';

import {
  ExamsList,
  AssignmentsList,
} from 'src/screens/academic/student-progress-analytics/individualStudentPerformance/Individual-student-progress';
import {
  StudentPerformance,
  StudentSubjectPerformace,
} from 'src/screens/academic/student-progress-analytics/comparativeAnalytics/comparative-analytics';

const AcademicPerformance = () => (
  <Box>
    <Grid container spacing={2}>
      <StudentPerformance />
      <Grid item xs={12}>
        <Typography variant="h6">Subject Performance </Typography>
        <StudentSubjectPerformace />
      </Grid>
      <Grid item xs={12} md={6}>
        <AssignmentsList />
      </Grid>
      <Grid item xs={12} md={6}>
        <ExamsList />
      </Grid>
    </Grid>
  </Box>
);

export default AcademicPerformance;

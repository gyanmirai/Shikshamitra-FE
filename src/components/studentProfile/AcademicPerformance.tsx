import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import StudentPerformance from 'src/screens/academic/student-progress-analytics/comparativeAnalytics/component/studentPerformance';
import { StudentSubjectPerformace } from 'src/screens/academic/student-progress-analytics/comparativeAnalytics/component/studentSubjectPerformance';
import { Student360ActionPanels } from 'src/screens/academic/student-progress-analytics/individualStudentPerformance/components/Student360ActionPanels';

const AcademicPerformance = () => (
  <Box>
    <Grid container spacing={2}>
      {/* Student Performance Section */}
      <Grid size={{ xs: 12 }}>
        <StudentPerformance />
      </Grid>

      {/* Subject Performance */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6">Subject Performance</Typography>
        <StudentSubjectPerformace />
      </Grid>

      {/* Assignments and Exams side by side */}
      <Grid size={{ xs: 12 }}>
        <Student360ActionPanels />
      </Grid>
    </Grid>
  </Box>
);

export default AcademicPerformance;

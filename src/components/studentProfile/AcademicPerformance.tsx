import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ExamsList from 'src/screens/academic/student-progress-analytics/individualStudentPerformance/component/examList';
import StudentPerformance from 'src/screens/academic/student-progress-analytics/comparativeAnalytics/component/studentPerformance';
import AssignmentsList from 'src/screens/academic/student-progress-analytics/individualStudentPerformance/component/assignmentList';
import { StudentSubjectPerformace } from 'src/screens/academic/student-progress-analytics/comparativeAnalytics/component/studentSubjectPerformance';

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
      <Grid size={{ xs: 12, md: 6 }}>
        <AssignmentsList />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ExamsList />
      </Grid>
    </Grid>
  </Box>
);

export default AcademicPerformance;

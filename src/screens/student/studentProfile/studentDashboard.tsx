import React from 'react';
import { Box, Grid } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import AcademicTimetable from 'src/components/studentProfile/academicTimetable';

import Overview from './studentDashbordComponent';
import AttendanceTrend from './studentDashbordComponent/attendanceTrend';
import StudentExamsList from './studentDashbordComponent/studentProfileExamsList';
import SubjectPerformanceCards from './studentDashbordComponent/subjectPerformanceDetails';
import StudentHomeworkAssignments from './studentDashbordComponent/studentDashboardHomework';
import SubjectsTeachersStudentDashboard from './studentDashbordComponent/subjectsTeachersStudentDashboard';

import type { StudentTabsComponentType } from '.';

const StudentDashboard = (props: StudentTabsComponentType) => (
  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
    <Scrollbar>
      <Grid container spacing={3} sx={{ mb: 3, p: 1 }}>
        <Grid size={12}>
          <Overview />
        </Grid>
        <Grid size={12}>
          <AttendanceTrend />
        </Grid>
        <Grid size={12}>
          <AcademicTimetable />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StudentExamsList />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StudentHomeworkAssignments />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SubjectPerformanceCards />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SubjectsTeachersStudentDashboard />
        </Grid>
      </Grid>
    </Scrollbar>
  </Box>
);

export default StudentDashboard;

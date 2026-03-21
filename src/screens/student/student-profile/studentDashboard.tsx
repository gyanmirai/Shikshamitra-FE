import React from 'react';
import { Box, Grid } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import AcademicTimetable from 'src/components/student-profile/academicTimetable';

import Overview from './student-dashbord-component';
import AttendanceTrend from './student-dashbord-component/attendanceTrend';
import StudentExamsList from './student-dashbord-component/studentProfileExamsList';
import SubjectPerformanceCards from './student-dashbord-component/subjectPerformanceDetails';
import StudentHomeworkAssignments from './student-dashbord-component/studentDashboardHomework';
import SubjectsTeachersStudentDashboard from './student-dashbord-component/subjectsTeachersStudentDashboard';

import type { StudentTabsComponentType } from '.';

const StudentDashboard = (props: StudentTabsComponentType) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)' }}>
    <Scrollbar sx={{ flexGrow: 1, height: '100%' }}>
      <Grid container spacing={1}>
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

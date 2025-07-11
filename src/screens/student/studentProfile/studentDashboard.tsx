import React from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';

import AcademicTimetable from 'src/components/studentProfile/academicTimetable';

import Overview from './studentDashbordComponent';
import AttendanceTrend from './studentDashbordComponent/attendanceTrend';
import StudentExamsList from './studentDashbordComponent/studentProfileExamsList';
import SubjectPerformanceCards from './studentDashbordComponent/subjectPerformanceDetails';
import StudentHomeworkAssignments from './studentDashbordComponent/studentDashboardHomework';
import SubjectsTeachersStudentDashboard from './studentDashbordComponent/subjectsTeachersStudentDashboard';

import type { StudentTabsComponentType } from '.';

const StudentDashboard = (props: StudentTabsComponentType) => {
  const { tabs, student } = props;
  return (
    <Grid2 container spacing={2} sx={{ mb: 2 }}>
      <Grid2 xs={12}>
        <Overview />
      </Grid2>
      <Grid2 xs={12}>
        <AttendanceTrend />
      </Grid2>
      <Grid2 xs={12}>
        <AcademicTimetable />
      </Grid2>
      <Grid2 xs={12} md={6}>
        <StudentExamsList />
      </Grid2>
      <Grid2 xs={12} md={6}>
        <StudentHomeworkAssignments />
      </Grid2>
      <Grid2 xs={12} md={6}>
        <SubjectPerformanceCards />
      </Grid2>
      <Grid2 xs={12} md={6}>
        <SubjectsTeachersStudentDashboard />
      </Grid2>
    </Grid2>
  );
};

export default StudentDashboard;

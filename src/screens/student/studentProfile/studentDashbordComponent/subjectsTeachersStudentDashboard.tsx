import React from 'react';

import { Card, Stack, Typography } from '@mui/material';

import AssignedTeacherItem from './assignedTeacherCard';

const teachers = [
  { subject: 'Mathematics', code: 'MATH-10', teacher: 'Dharmik Jinjala', color: '#e53935' },
  { subject: 'English', code: 'ENG-11', teacher: 'Prerna Atre', color: '#1e88e5' },
  { subject: 'Science', code: 'SCI-04', teacher: 'Parth Ghusar', color: '#f48fb1' },
];

const SubjectsTeachersStudentDashboard = () => (
  <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Typography variant="h6" mb={2}>
      Assigned Teachers
    </Typography>
    <Stack spacing={1.5}>
      {teachers.map((item, index) => (
        <AssignedTeacherItem key={index} {...item} />
      ))}
    </Stack>
  </Card>
);

export default SubjectsTeachersStudentDashboard;

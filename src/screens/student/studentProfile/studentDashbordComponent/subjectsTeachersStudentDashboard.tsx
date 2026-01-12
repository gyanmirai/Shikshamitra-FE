import React from 'react';
import { Card, Stack, Typography } from '@mui/material';

import AssignedTeacherItem from './assignedTeacherCard';

const teachers = [
  { subject: 'Mathematics', code: 'MATH-10', teacher: 'Dharmik Jinjala', color: '#e53935' },
  { subject: 'English', code: 'ENG-11', teacher: 'Prerna Atre', color: '#1e88e5' },
  { subject: 'Science', code: 'SCI-04', teacher: 'Parth Ghusar', color: '#f48fb1' },
];

const SubjectsTeachersStudentDashboard = () => (
  <Card
    sx={{
      p: 3,
      borderRadius: 2,
      height: '100%',
      boxShadow: 'none',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
      Assigned Teachers
    </Typography>
    <Stack spacing={2}>
      {teachers.map((item, index) => (
        <AssignedTeacherItem key={index} {...item} />
      ))}
    </Stack>
  </Card>
);

export default SubjectsTeachersStudentDashboard;

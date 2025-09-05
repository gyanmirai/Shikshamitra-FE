import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Button, Typography } from '@mui/material';

import HomeworkAssignmentCard from './homeworkAssignmentCard';

const homeworks = [
  {
    title: 'Math Assignment 1',
    date: '15-01-2025',
    submissionType: 'In-Person',
    type: 'Assignment',
    status: 0,
  },
  {
    title: 'Science Homework 2',
    date: '15-01-2025',
    submissionType: 'In-Person',
    type: 'Homework',
    status: 0,
  },
  {
    title: 'English Homework 2',
    date: '15-01-2025',
    submissionType: 'In-Person',
    type: 'Homework',
    status: 0,
  },
];

const StudentHomeworkAssignments = () => (
  <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="h6" mb={2}>
        Homework & Assignments
      </Typography>
      <Button size="small" endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}>
        View All Homework & Assignments
      </Button>
    </Box>

    <Stack spacing={1.5}>
      {homeworks.map((item, index) => (
        <HomeworkAssignmentCard key={index} {...item} />
      ))}
    </Stack>
  </Card>
);

export default StudentHomeworkAssignments;

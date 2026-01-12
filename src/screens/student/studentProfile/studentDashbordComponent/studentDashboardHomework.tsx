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
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Homework
      </Typography>
      <Button
        size="small"
        endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
        sx={{ color: 'text.secondary', fontWeight: 600 }}
      >
        View All
      </Button>
    </Box>

    <Stack spacing={2}>
      {homeworks.map((item, index) => (
        <HomeworkAssignmentCard key={index} {...item} />
      ))}
    </Stack>
  </Card>
);

export default StudentHomeworkAssignments;

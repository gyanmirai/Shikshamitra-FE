import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Button, Typography } from '@mui/material'; // or use ArrowForwardIos icon
import ExamCard from './examCardComponent';

const exams = [
  { subject: 'Maths Exam', date: '15-01-2025', status: 5 },
  { subject: 'Science Exam', date: '16-02-2025', status: 0 },
  { subject: 'English Exam', date: '16-02-2025', status: 5 },
  { subject: 'Gujarati Exam', date: '16-02-2025', status: 0 },
];

const StudentExamsList = () => (
  <Card sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="h6" mb={2}>
        Exams
      </Typography>
      <Button size="small" endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}>
        View All Exams
      </Button>
    </Box>

    <Stack spacing={1.5}>{exams?.map((exam, index) => <ExamCard key={index} {...exam} />)}</Stack>
  </Card>
);

export default StudentExamsList;

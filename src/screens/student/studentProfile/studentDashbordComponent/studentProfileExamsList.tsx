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
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <Iconify
          icon="solar:pen-new-square-bold-duotone"
          width={24}
          sx={{ color: 'primary.main' }}
        />
        Exams
      </Typography>
      <Button
        size="small"
        endIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
        sx={{ color: 'text.secondary', fontWeight: 600 }}
      >
        View All
      </Button>
    </Box>

    <Stack spacing={1.5}>
      {exams?.map((exam, index) => (
        <ExamCard key={index} {...exam} />
      ))}
    </Stack>
  </Card>
);

export default StudentExamsList;

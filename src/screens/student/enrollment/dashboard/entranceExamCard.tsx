import React from 'react';

import { Box, Card, Stack, Button, Typography } from '@mui/material';

import entraceExamsData from 'src/json/student/enrollementDashboard/entranceExamData.json';

import { Iconify } from 'src/components/iconify';

const UpcomingEntranceExams = () => (
  <Card sx={{ p: 3, borderRadius: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6">Upcoming Entrance Exam</Typography>
      <Button
        size="small"
        endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} />}
        sx={{ color: 'success.main' }}
      >
        View all Upcoming Exams
      </Button>
    </Box>

    <Stack spacing={2}>
      {entraceExamsData?.map((exam, idx) => (
        <Card
          key={idx}
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
              boxShadow: 'var(--shadows-8)',
              cursor: 'pointer',
            },
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {exam.time}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Date: {exam.date} · Room No: {exam.roomNo} · Students: {exam.students}
          </Typography>
        </Card>
      ))}
    </Stack>
  </Card>
);

export default UpcomingEntranceExams;

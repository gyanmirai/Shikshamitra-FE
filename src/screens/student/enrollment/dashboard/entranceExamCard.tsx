import type { RootState } from 'src/redux/store';

import React from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Card, Stack, Button, Typography, CircularProgress } from '@mui/material';
import { useGetEntranceExamQuery } from 'src/redux/student/entrance-exam/entrance-exam-api';

const UpcomingEntranceExams = () => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const { data, isLoading, isError } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamQuery,
    params: {
      startDate: dayjs().startOf('day').toISOString(),
      endDate: dayjs().add(30, 'day').endOf('day').toISOString(),
      educationMediumId: currentMedium?.id,
    },
    options: { skip: !currentMedium?.id },
  });

  const exams =
    data?.data?.items?.map((exam: any) => ({
      id: exam.id,
      time: exam.examTime || '-',
      date: exam.examDate ? dayjs(exam.examDate).format('DD MMM YYYY') : '-',
      roomNo: exam.roomNo || exam.roomNumber || '-',
      students: exam.studentCount ?? exam.totalStudents ?? '-',
    })) || [];

  return (
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
        {isLoading && <CircularProgress size={24} />}
        {isError && (
          <Typography variant="body2" color="error">
            Unable to load upcoming exams.
          </Typography>
        )}
        {!isLoading && !isError && exams.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No upcoming exams found.
          </Typography>
        )}
        {exams.map((exam: any) => (
          <Card
            key={exam.id}
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
              Date: {exam.date} | Room No: {exam.roomNo} | Students: {exam.students}
            </Typography>
          </Card>
        ))}
      </Stack>
    </Card>
  );
};

export default UpcomingEntranceExams;

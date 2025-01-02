'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Box, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { CalendarView } from 'src/sections/calendar/view';

import ScheduleExam from '../../schedule-exam';

const ExaminationDashboardExamlistComponent = (props: TabComponentType) => {
  const modal = useBoolean();
  const uploadModal = useBoolean();
  const gradeScalingModal = useBoolean();
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Upcoming and Completed Exam </Typography>
      <ScheduleExam />
      <CalendarView />
    </Box>
  );
};

export default ExaminationDashboardExamlistComponent;

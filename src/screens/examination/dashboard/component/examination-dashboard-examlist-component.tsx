import React from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, MenuItem, MenuList, Typography } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { TabComponentType } from 'src/screens/hr/leave-request';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
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

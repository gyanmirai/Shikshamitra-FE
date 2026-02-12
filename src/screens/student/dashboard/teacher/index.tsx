import React from 'react';
import { Box } from '@mui/material';

import TeacherLists from './lists';
import TeacherCharts from './charts';
import TeacherKPICards from './kpi-cards';

const TeacherDashboard = () => (
  <Box>
    <Box sx={{ mb: 1 }}>
      <TeacherKPICards />
    </Box>

    <Box sx={{ mb: 1 }}>
      <TeacherCharts />
    </Box>

    <Box sx={{ mb: 1 }}>
      <TeacherLists />
    </Box>
  </Box>
);

export default TeacherDashboard;

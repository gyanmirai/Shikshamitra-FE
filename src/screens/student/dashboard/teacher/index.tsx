import React from 'react';
import { Box } from '@mui/material';

import TeacherLists from './lists';
import TeacherCharts from './charts';
import TeacherKPICards from './kpi-cards';

const TeacherDashboard = () => (
  <Box sx={{ p: 3 }}>
    <Box sx={{ mb: 4 }}>
      <TeacherKPICards />
    </Box>

    <Box sx={{ mb: 4 }}>
      <TeacherCharts />
    </Box>

    <Box sx={{ mb: 4 }}>
      <TeacherLists />
    </Box>
  </Box>
);

export default TeacherDashboard;

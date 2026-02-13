import React from 'react';
import { Box, Stack } from '@mui/material';

// Components
import PrincipalCharts from './charts';
import AlertCenter from './alert-center';
import PrincipalKPICards from './kpi-cards';
import PrincipalStaffOperations from './staff-operations';

const PrincipalDashboard = () => (
  <Box>
    <Stack spacing={1}>
      {/* 2. Executive KPI Summary */}
      <PrincipalKPICards />

      {/* 3. Alert Center */}
      <AlertCenter />

      {/* 4. Academic Insights */}
      <PrincipalCharts />

      {/* 6. Staff & Operations */}
      <PrincipalStaffOperations />
    </Stack>
  </Box>
);

export default PrincipalDashboard;

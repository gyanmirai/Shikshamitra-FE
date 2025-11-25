import React from 'react';
import { Box, Grid } from '@mui/material';

import PrincipalCharts from './principal-charts';
import PrincipalKPICards from './principal-kpi-cards';

const PrincipalDashboard = () => (
  <Box>
    <Grid container spacing={3}>
      {/* KPI Cards Section */}
      <Grid size={{ xs: 12 }}>
        <PrincipalKPICards />
      </Grid>

      {/* Charts Section */}
      <Grid size={{ xs: 12 }}>
        <PrincipalCharts />
      </Grid>
    </Grid>
  </Box>
);

export default PrincipalDashboard;

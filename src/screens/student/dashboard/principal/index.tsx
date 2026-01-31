import React from 'react';
import { Box, Grid } from '@mui/material';

import PrincipalLists from './lists';
import PrincipalCharts from './charts';
import PrincipalKPICards from './kpi-cards';
import PrincipalBirthdays from './birthdays';
import PrincipalHouseDistribution from './house-distribution';

const PrincipalDashboard = () => (
  <Box sx={{ p: 3 }}>
    <Box sx={{ mb: 4 }}>
      <PrincipalKPICards />
    </Box>

    <Box sx={{ mb: 4 }}>
      <PrincipalCharts />
    </Box>

    <Box sx={{ mb: 4 }}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <PrincipalHouseDistribution />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PrincipalBirthdays />
        </Grid>
      </Grid>
    </Box>

    <Box sx={{ mb: 4 }}>
      <PrincipalLists />
    </Box>
  </Box>
);

export default PrincipalDashboard;

import React from 'react';
import { Box, Grid } from '@mui/material';

import AdminLists from './lists';
import AdminCharts from './charts';
import Birthdays from './birthdays';
import AdminKPICards from './kpi-cards';
import HouseDistribution from './house-distribution';

const AdminDashboard = () => (
  <Box sx={{ p: 3 }}>
    <Box sx={{ mb: 4 }}>
      <AdminKPICards />
    </Box>

    <Box sx={{ mb: 4 }}>
      <AdminCharts />
    </Box>

    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <HouseDistribution />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Birthdays />
        </Grid>
      </Grid>
    </Box>

    <Box sx={{ mb: 4 }}>
      <AdminLists />
    </Box>
  </Box>
);

export default AdminDashboard;

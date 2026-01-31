import React from 'react';
import { Box, Grid } from '@mui/material';

import AdminLists from './lists';
import AdminCharts from './charts';
import Birthdays from './birthdays';
import AdminKPICards from './kpi-cards';
import HouseDistribution from './house-distribution';

const AdminDashboard = () => (
  <Box sx={{ p: 0 }}>
    <Grid container spacing={1}>
      <Grid size={{ xs: 12 }}>
        <AdminKPICards />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <AdminCharts />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <HouseDistribution />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Birthdays />
          </Grid>
        </Grid>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <AdminLists />
      </Grid>
    </Grid>
  </Box>
);

export default AdminDashboard;

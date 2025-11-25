import React from 'react';
import { Box, Grid } from '@mui/material';

import AdminCharts from './admin-charts';
import AdminKPICards from './admin-kpi-cards';

const AdminDashboard = () => (
  <Box>
    <Grid container spacing={3}>
      {/* KPI Cards Section */}
      <Grid size={{ xs: 12 }}>
        <AdminKPICards />
      </Grid>

      {/* Charts Section */}
      <Grid size={{ xs: 12 }}>
        <AdminCharts />
      </Grid>
    </Grid>
  </Box>
);

export default AdminDashboard;

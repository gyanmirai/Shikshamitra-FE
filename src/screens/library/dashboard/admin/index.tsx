import React from 'react';
import { Box, Grid } from '@mui/material';

import AdminKPICards from './admin-kpi-cards';
import AdminQuickActions from './admin-quick-actions';
import {
  SectionBooksChart,
  MemberActivityChart,
  WeeklyCirculationChart,
  CategoryDistributionChart,
} from './admin-charts';

const AdminDashboard = () => (
  <Box>
    <Grid container spacing={1}>
      {/* KPI Cards Section */}
      <Grid size={{ xs: 12 }}>
        <AdminKPICards />
      </Grid>

      {/* Primary Action & Insight Row */}
      <Grid size={{ xs: 12, md: 8 }}>
        <WeeklyCirculationChart />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <AdminQuickActions />
      </Grid>

      {/* Secondary Analytics Row */}
      <Grid size={{ xs: 12, md: 6 }}>
        <CategoryDistributionChart />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <MemberActivityChart />
      </Grid>

      {/* Tertiary Analytics Row */}
      <Grid size={{ xs: 12 }}>
        <SectionBooksChart />
      </Grid>
    </Grid>
  </Box>
);

export default AdminDashboard;

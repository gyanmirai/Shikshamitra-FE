import React from 'react';
import { Box, Grid } from '@mui/material';

import AdminAlerts from './admin-alerts';
import AdminKPICards from './admin-kpi-cards';
import AdminFinancials from './admin-financials';
import AdminQuickActions from './admin-quick-actions';
import {
  SectionBooksChart,
  MemberActivityChart,
  InventoryIntelligence,
  WeeklyCirculationChart,
  CategoryDistributionChart,
} from './admin-charts';

const AdminDashboard = () => (
  <Box>
    <Grid container spacing={1}>
      {/* Section 1: KPI Cards */}
      <Grid size={{ xs: 12 }}>
        <AdminKPICards />
      </Grid>

      {/* Section 3 & 8: Circulation & Quick Actions */}
      <Grid size={{ xs: 12, md: 8 }}>
        <WeeklyCirculationChart />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <AdminQuickActions />
      </Grid>

      {/* Section 2 & 4: Alerts & Inventory Intelligence */}
      <Grid size={{ xs: 12, md: 4 }}>
        <AdminAlerts />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <InventoryIntelligence />
      </Grid>

      {/* Section 7 & 4/Health: Financials, Category Distribution & Health Score */}
      <Grid size={{ xs: 12, md: 7 }}>
        <AdminFinancials />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 5 }}>
        <CategoryDistributionChart />
      </Grid>

      {/* Section 5 & 6: Member Activity & Shelf Health */}
      <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
        <MemberActivityChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
        <SectionBooksChart />
      </Grid>
    </Grid>
  </Box>
);

export default AdminDashboard;

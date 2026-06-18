import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

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

interface AdminDashboardProps {
  overview?: LibraryDashboardOverview;
  isRefreshing?: boolean;
}

const AdminDashboard = ({ overview, isRefreshing }: AdminDashboardProps) => (
  <Box>
    <Grid container spacing={1}>
      {/* Section 1: KPI Cards */}
      <Grid size={{ xs: 12 }}>
        <AdminKPICards overview={overview} isRefreshing={isRefreshing} />
      </Grid>

      {/* Section 3 & 8: Circulation & Quick Actions */}
      <Grid size={{ xs: 12, md: 8 }}>
        <WeeklyCirculationChart overview={overview} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <AdminQuickActions />
      </Grid>

      {/* Section 2 & 4: Alerts & Inventory Intelligence */}
      <Grid size={{ xs: 12, md: 4 }}>
        <AdminAlerts overview={overview} />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <InventoryIntelligence overview={overview} />
      </Grid>

      {/* Section 7 & 4/Health: Financials, Category Distribution & Health Score */}
      <Grid size={{ xs: 12, md: 7 }}>
        <AdminFinancials overview={overview} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 5 }}>
        <CategoryDistributionChart overview={overview} />
      </Grid>

      {/* Section 5 & 6: Member Activity & Shelf Health */}
      <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
        <MemberActivityChart overview={overview} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }} sx={{ mb: 1 }}>
        <SectionBooksChart overview={overview} />
      </Grid>
    </Grid>
  </Box>
);

export default AdminDashboard;

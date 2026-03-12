'use client';

import { Grid } from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';

import AdminCharts from './charts';
import AdminKpiCards from './kpi-cards';
import AdminActionRequired from './action-required';

export default function MainDashboardAdmin() {
  return (
    <DashboardContent disablePadding>
      <Grid container spacing={1} pb={1}>
        <Grid size={12}>
          <AdminKpiCards />
        </Grid>

        <Grid size={12}>
          <AdminActionRequired />
        </Grid>

        <Grid size={12}>
          <AdminCharts />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

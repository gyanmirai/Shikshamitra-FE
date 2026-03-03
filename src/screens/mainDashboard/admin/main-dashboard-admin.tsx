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

        {/* ── SECTION 4 – Today & Upcoming + Quick Actions ─────────────── */}
        {/* <Grid size={12} sx={{ mt: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Today &amp; Upcoming
          </Typography>
        </Grid>

        <Grid size={12}>
          <AdminLists />
        </Grid> */}
      </Grid>
    </DashboardContent>
  );
}

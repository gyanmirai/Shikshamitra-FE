'use client';

import { Grid } from '@mui/material';
import { DashboardContent } from 'src/layouts/dashboard';

import PrincipalCharts from './charts';
import PrincipalKpiCards from './kpi-cards';

// ----------------------------------------------------------------------

export default function MainDashboardPrincipal() {
  return (
    <DashboardContent disablePadding>
      <Grid container spacing={1} pb={1}>
        <Grid size={12}>
          <PrincipalKpiCards />
        </Grid>

        <Grid size={12}>
          <PrincipalCharts />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

import { Box, Grid } from '@mui/material';

import PrincipalCharts from './principal-charts';
import PrincipalKPICards from './principal-kpi-cards';
import PrincipalFinancials from './principal-financials';
import PrincipalUtilization from './principal-utilization';

const PrincipalDashboard = () => (
  <Box>
    <Grid container spacing={1}>
      {/* 1. STRATEGIC KPI SUMMARY */}
      <Grid size={{ xs: 12 }}>
        <PrincipalKPICards />
      </Grid>
      {/* 2. UTILIZATION INTELLIGENCE STRIP */}
      <Grid size={{ xs: 12 }}>
        <PrincipalUtilization />
      </Grid>
      {/* 3. DEEP DIVE PANELS: READING INSIGHTS & FINANCIALS */}{' '}
      <Grid size={{ xs: 12 }}>
        <PrincipalFinancials />
      </Grid>
      {/* 4. TRENDS & VISUALIZATION */}
      <Grid size={{ xs: 12 }}>
        <PrincipalCharts />
      </Grid>
    </Grid>
  </Box>
);

export default PrincipalDashboard;

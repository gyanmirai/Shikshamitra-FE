import type { LibraryDashboardOverview } from 'src/redux/library/library-adapters';

import { Box, Grid } from '@mui/material';

import PrincipalCharts from './principal-charts';
import PrincipalKPICards from './principal-kpi-cards';
import PrincipalFinancials from './principal-financials';
import PrincipalUtilization from './principal-utilization';

const PrincipalDashboard = ({ overview }: { overview?: LibraryDashboardOverview }) => (
  <Box>
    <Grid container spacing={1}>
      {/* 1. STRATEGIC KPI SUMMARY */}
      <Grid size={{ xs: 12 }}>
        <PrincipalKPICards overview={overview} />
      </Grid>
      {/* 2. UTILIZATION INTELLIGENCE STRIP */}
      <Grid size={{ xs: 12 }}>
        <PrincipalUtilization overview={overview} />
      </Grid>
      {/* 3. DEEP DIVE PANELS: READING INSIGHTS & FINANCIALS */}{' '}
      <Grid size={{ xs: 12 }}>
        <PrincipalFinancials overview={overview} />
      </Grid>
      {/* 4. TRENDS & VISUALIZATION */}
      <Grid size={{ xs: 12 }}>
        <PrincipalCharts overview={overview} />
      </Grid>
    </Grid>
  </Box>
);

export default PrincipalDashboard;

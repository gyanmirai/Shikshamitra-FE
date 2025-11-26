import React from 'react';
import { Box, Grid } from '@mui/material';

import LibrarianCharts from './librarian-charts';
import LibrarianKPICards from './librarian-kpi-cards';

const LibrarianDashboard = () => (
  <Box>
    <Grid container spacing={3}>
      {/* KPI Cards Section */}
      <Grid size={{ xs: 12 }}>
        <LibrarianKPICards />
      </Grid>

      {/* Charts Section */}
      <Grid size={{ xs: 12 }}>
        <LibrarianCharts />
      </Grid>
    </Grid>
  </Box>
);

export default LibrarianDashboard;

import React from 'react';
import { Box, Grid } from '@mui/material';

import MaintenanceHistory from './MaintenanceHistory';
import VehicleInformationCard from './VehicleInformation';

const VehicleViewDetails = () => (
  <Box sx={{ p: 2 }} overflow="auto">
    <Grid container spacing={2}>
      {/* Left Column */}
      <Grid size={{ xs: 12, md: 3 }}>
        <VehicleInformationCard />
      </Grid>
      {/* Right Column */}
      <Grid size={{ xs: 12, md: 9 }} display="flex" flexDirection="column" gap={2}>
        <MaintenanceHistory />
      </Grid>
    </Grid>
  </Box>
);

export default VehicleViewDetails;

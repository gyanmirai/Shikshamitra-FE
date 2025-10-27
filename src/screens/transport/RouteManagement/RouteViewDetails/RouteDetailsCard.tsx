import React from 'react';
import { Box, Grid } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

import RouteStopsCard from './RouteStopsCard';
import CurrentVehicleCard from './CurrentVehicleCard';
import RouteInformationCard from './RouteInformationCard';
import DriverConductorHistory from './DriverConductorHistory';

const RouteDetailsCard = () => (
  <Box sx={{ p: 2 }} height="100%">
    <Scrollbar sx={{ height: '100%' }}>
      <Grid container spacing={2}>
        {/* Left Column */}
        <Grid size={{ xs: 12, md: 6 }} display="flex" flexDirection="column" gap={2}>
          <RouteInformationCard />
          <CurrentVehicleCard />
        </Grid>

        {/* Right Column */}
        <Grid size={{ xs: 12, md: 6 }} display="flex" flexDirection="column" gap={2}>
          <RouteStopsCard />
        </Grid>

        {/* Bottom */}
        <Grid size={{ xs: 12 }} display="flex" flexDirection="column" gap={2} mt={2}>
          <DriverConductorHistory />
        </Grid>
      </Grid>
    </Scrollbar>
  </Box>
);

export default RouteDetailsCard;

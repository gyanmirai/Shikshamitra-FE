import React from 'react';
import { Box, Grid } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

import RouteStopsCard from './RouteStopsCard';
import CurrentVehicleCard from './CurrentVehicleCard';
import RouteInformationCard from './RouteInformationCard';
import DriverConductorHistory from './DriverConductorHistory';

const RouteDetailsCard = () => (
  <Box
    sx={{
      p: { xs: 2, sm: 3 },
      height: '100%',
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.01) 0%, transparent 100%)',
    }}
  >
    <Scrollbar sx={{ height: '100%' }}>
      <Grid
        container
        spacing={{ xs: 2, sm: 2.5, md: 3 }}
        sx={{
          '& > .MuiGrid-item': {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
      >
        {/* Left Column */}
        <Grid
          size={{ xs: 12, md: 6 }}
          display="flex"
          flexDirection="column"
          gap={{ xs: 2, sm: 2.5, md: 3 }}
        >
          <RouteInformationCard />
          <CurrentVehicleCard />
        </Grid>

        {/* Right Column */}
        <Grid
          size={{ xs: 12, md: 6 }}
          display="flex"
          flexDirection="column"
          gap={{ xs: 2, sm: 2.5, md: 3 }}
        >
          <RouteStopsCard />
        </Grid>

        {/* Bottom */}
        <Grid
          size={{ xs: 12 }}
          display="flex"
          flexDirection="column"
          gap={{ xs: 2, sm: 2.5, md: 3 }}
        >
          <DriverConductorHistory />
        </Grid>
      </Grid>
    </Scrollbar>
  </Box>
);

export default RouteDetailsCard;

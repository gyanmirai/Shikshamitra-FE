import { Box, Grid } from '@mui/material';

import MaintenanceHistory from './MaintenanceHistory';
import VehicleInformationCard from './VehicleInformation';
import DriverRoutesAndVehicleDetails from './DriverRoutesAndVehicleDetails';

const VehicleViewDetails = () => (
  <Box sx={{ p: 2 }} height="100%" overflow="auto">
    <Grid container spacing={2}>
      {/* Left Column */}
      <Grid size={{ xs: 12, md: 7 }}>
        <VehicleInformationCard />
        <MaintenanceHistory />
      </Grid>

      {/* Right Column */}
      <Grid size={{ xs: 12, md: 5 }} display="flex" flexDirection="column" gap={2}>
        <DriverRoutesAndVehicleDetails />
      </Grid>
    </Grid>
  </Box>
);

export default VehicleViewDetails;

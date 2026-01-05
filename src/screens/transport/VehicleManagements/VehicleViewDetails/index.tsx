import React from 'react';
import { Grid } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

import MaintenanceHistory from './MaintenanceHistory';
import VehicleInformationCard from './VehicleInformation';

import type { IVehicleData } from '../Components/type';

interface VehicleViewDetailsProps {
  vehicleData: IVehicleData | null;
}

const VehicleViewDetails = ({ vehicleData }: VehicleViewDetailsProps) => (
  <Scrollbar sx={{ p: 2, height: '100%' }}>
    <Grid container spacing={2}>
      {/* Left Column */}
      <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%' }}>
        <VehicleInformationCard vehicleId={vehicleData?.id || ''} />
      </Grid>
      {/* Right Column */}
      <Grid size={{ xs: 12, md: 9 }} sx={{ height: '100%' }}>
        <MaintenanceHistory vehicleId={vehicleData?.id || ''} />
      </Grid>
    </Grid>
  </Scrollbar>
);

export default VehicleViewDetails;

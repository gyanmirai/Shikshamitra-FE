'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';

import VehicleLogBook from './vehicle-log-book';
import VehicleInformation from './vehicle-information';
import VehicleRouteHistory from './vehilce-route-history';
import VehicleMaintenanceRecords from './vehilcle-maintenance-records';

const TABS = [
  {
    value: 'vehicle-information',
    label: 'Vehicle Information',
    component: VehicleInformation,
  },
  {
    value: 'maintenance-records',
    label: 'Maintenance Records',
    component: VehicleMaintenanceRecords,
  },
  {
    value: 'route-history',
    label: 'Route History',
    component: VehicleRouteHistory,
  },
  {
    value: 'log-book',
    label: 'Log Book',
    component: VehicleLogBook,
  },
];

interface TransportVehicleDetailViewProps {
  vehicleNumber: any;
}

const TransportVehicleDetailView: React.FC<TransportVehicleDetailViewProps> = ({
  vehicleNumber,
}) => {
  const tabs = useTabs('vehicle-information');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <Card>
        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {CurrentComponent && <CurrentComponent vehicleData={vehicleNumber} />}
      </Box>
    </Box>
  );
};

export default TransportVehicleDetailView;

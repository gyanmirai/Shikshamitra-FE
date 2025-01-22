'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';

import VehicleLogBook from './vehicle-log-book';
import VehicleMaintenanceRecords from './vehilcle-maintenance-records';
import ViewVehicleDetailsDialog from '../../newVehicleManagement/vehicle/vehicle-details-view-dialog';

const TABS = [
  {
    value: 'vehicle-information',
    label: 'Vehicle Information',
    icon: <Iconify icon="tdesign:vehicle" width={20} />,
    component: ViewVehicleDetailsDialog,
  },
  {
    value: 'maintenance-records',
    label: 'Maintenance Records',
    icon: <Iconify icon="carbon:license-maintenance" width={20} />,
    component: VehicleMaintenanceRecords,
  },

  {
    value: 'log-book',
    label: 'Log Book',
    icon: <Iconify icon="solar:book-outline" width={20} />,
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
        <CustomTabs value={tabs.value} onChange={tabs.onChange} variant="fullWidth">
          {TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              icon={tab.icon}
              key={tab.value}
              value={tab.value}
              label={tab.label}
            />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {CurrentComponent && <CurrentComponent vehicle={vehicleNumber} />}
      </Box>
    </Box>
  );
};

export default TransportVehicleDetailView;

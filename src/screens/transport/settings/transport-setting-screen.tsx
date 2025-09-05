'use client';

import React, { useMemo } from 'react';
import { Box, Tab, Card } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomTabs } from 'src/components/custom-tabs/custom-tabs';

import TransportStopsSettingScreen from './stops/transport-stops-setting-screen';
import TransportDriverSettingScreen from './drivers/transport-driver-setting-screen';

const TABS = [
  {
    value: 'stop',
    label: 'Stops',
    icon: <Iconify icon="ion:pin-sharp" width={20} />,

    component: () => <TransportStopsSettingScreen />,
  },
  {
    value: 'driver',
    label: 'Driver',
    icon: <Iconify icon="healthicons:truck-driver" width={20} />,
    component: () => <TransportDriverSettingScreen />,
  },
  // {
  //   value: 'vehicle',
  //   label: 'Vehicle',
  //   icon: <Iconify icon="tdesign:vehicle" width={20} />,
  //   component: () => <TransportVehicleSettingScreen />,
  // },
];

const TransportSettingScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'driver' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  return (
    <Box>
      <Card>
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
        >
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
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
          // searchParams={searchParams}
          // setSearchParams={setSearchParams}
          />
        )}
      </Box>
    </Box>
    // <>
    //   <Typography variant="h6">Notification Settings</Typography>
    //   <Box sx={{ py: '8px', display: 'flex', flexDirection: 'row' }} gap={3}>
    //     <FormControlLabel control={<Switch />} label="Receive Maintenance Alerts" />
    //     <FormControlLabel control={<Switch />} label="Receive Delay Notifications" />
    //   </Box>
    //   <CustomSelect
    //     label="Select Alert Type"
    //     name="selectAlertType"
    //     options={[]}
    //     formControlProps={{ sx: { width: '200px' } }}
    //     value=""
    //     onChange={(value) => {}}
    //   />
    //   <Typography sx={{ pt: '15px', pb: '10px' }} variant="h6">
    //     User Preferences
    //   </Typography>
    //   <Box sx={{ py: '8px', display: 'flex', flexDirection: 'row' }} gap={3}>
    //     <FormControlLabel control={<Switch />} label="Receive Maintenance Alerts" />
    //     <FormControlLabel control={<Switch />} label="Receive Delay Notifications" />
    //   </Box>
    //   <Box display="flex" flexDirection="row" gap={3}>
    //     <CustomSelect
    //       label="Map View Customization"
    //       name="MapViewCustomization"
    //       options={[]}
    //       formControlProps={{ sx: { width: '200px' } }}
    //       value=""
    //       onChange={(value) => {}}
    //     />
    //     <CustomSelect
    //       label="Time Range"
    //       name="timeRange"
    //       options={[]}
    //       formControlProps={{ sx: { width: '200px' } }}
    //       value=""
    //       onChange={(value) => {}}
    //     />
    //   </Box>
    //   <Typography sx={{ pt: '15px', pb: '10px' }} variant="h6">
    //     Dashboard Layout
    //   </Typography>
    //   <RadioGroup row value="overviewCard" onChange={(e) => {}}>
    //     <FormControlLabel value="overviewCard" control={<Radio />} label="Overview Card" />
    //     <FormControlLabel
    //       value="averageTripDurationOverTime"
    //       control={<Radio />}
    //       label="Average Trip Duration Over Time"
    //     />
    //     <FormControlLabel
    //       value="vehicleUsageAcrossDifferentBuses"
    //       control={<Radio />}
    //       label="Vehicle Usage Across Different Buses"
    //     />
    //   </RadioGroup>
    //   <Box display="flex" justifyContent="flex-end" pr="20px" pt="20px">
    //     <Button variant="contained" size="small">
    //       Save Preferences
    //     </Button>
    //   </Box>
    // </>
  );
};

export default TransportSettingScreen;

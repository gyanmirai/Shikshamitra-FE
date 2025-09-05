'use client';

import React, { useMemo } from 'react';
import { Box, Tab, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TransportRouteNotificationManagementScreen from './component/transport-route-notification-management-screen';
import TransportVehicleNotificationManagementScreen from './component/transport-vehicle-notification-management-screen';

const TransportNotificationScreen = () => {
  const TABS = [
    {
      label: 'Route and Schedule',
      value: 'routeAndSchedule',
      icon: <Iconify icon="la:route" width={20} />,
      component: () => <TransportRouteNotificationManagementScreen />,
    },
    {
      label: 'Vehicle',
      value: 'vehicle',
      icon: <Iconify icon="tdesign:vehicle" width={20} />,
      component: () => <TransportVehicleNotificationManagementScreen />,
    },
  ];

  const [searchParams, setSearchParams] = useSearchParam({ tab: 'routeAndSchedule' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.tab]
  );

  // const closeHandler = () => {

  // }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <CustomBreadcrumbs
          heading="Notification Settings"
          links={[{ name: 'HR' }, { name: 'Notification Settings' }]}
          sx={{ px: 1, mb: 2 }}
        />
        {/* <Button startIcon={<Iconify icon="eva:arrow-back-fill" />} size="small" variant='contained' onClick={closeHandler}>Back</Button> */}
      </Box>

      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
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
      <Box px={1} pt={2} height="100%">
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
          // searchParams={searchParams}
          // setSearchParams={setSearchParams}
          />
        )}
      </Box>
    </Box>
  );
};

export default TransportNotificationScreen;

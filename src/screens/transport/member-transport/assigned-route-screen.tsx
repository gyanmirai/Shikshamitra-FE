'use client';

import React, { useMemo } from 'react';
import { Box, Tab, Card } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/useSearchParam';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import MemberTransportScreen from './member-transport-screen';
import TransportWaitingListScreen from './waiting-list-screen';
import TransportRequestScreen from './transport-request-screen';
import TransportNotifiedPersonlistScreen from './transport-notification-list-screen';

const TABS = [
  {
    value: 'assignedRoute',
    label: 'Assigned Route',
    icon: <Iconify icon="lineicons:route-1" width={20} />,
    component: () => <MemberTransportScreen />,
  },
  {
    value: 'request',
    label: 'Request',
    icon: <Iconify icon="carbon:request-quote" width={20} />,
    component: () => <TransportRequestScreen />,
  },
  {
    value: 'waiting',
    label: 'Waiting List',
    icon: <Iconify icon="medical-icon:i-waiting-area" width={20} />,
    component: () => <TransportWaitingListScreen />,
  },
  {
    value: 'notified',
    label: 'Notified',
    icon: <Iconify icon="ant-design:notification-outlined" width={20} />,
    component: () => <TransportNotifiedPersonlistScreen />,
  },
];

const AssignedRouteScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'assignedRoute' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Assigned Route"
        links={[
          { name: 'Transport' },
          { name: 'Assigned Route' },
          {
            name:
              searchParams.tab === 'assignedRoute'
                ? 'Assigned Route'
                : searchParams.tab === 'request'
                  ? 'Request'
                  : searchParams.tab === 'notified'
                    ? 'Notified'
                    : 'Waiting List',
          },
        ]}
      />
      <Card>
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
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
  );
};

export default AssignedRouteScreen;

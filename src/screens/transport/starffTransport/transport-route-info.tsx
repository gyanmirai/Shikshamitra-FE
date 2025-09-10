'use client';

import React from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Box, Tab, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';

import StudentTransportScreen from './student-transport';
import StaffTransportScreen from './staff-transport-screen';

const TABS = [
  {
    value: 'student',
    label: 'Student',
    component: () => <StudentTransportScreen />,
  },
  {
    value: 'staff',
    label: 'Staff',
    component: () => <StaffTransportScreen />,
  },
];

const TransportRouteInfo = () => {
  const tabs = useTabs('student');

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
        {CurrentComponent?.()}
      </Box>
    </Box>
  );
};

export default TransportRouteInfo;

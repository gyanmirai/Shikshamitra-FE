'use client';

import React from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import General from './general';
import Notification from './notification';

const TABS = [
  {
    value: 'general',
    label: 'General',
    component: () => <General />,
  },
  {
    value: 'notification',
    label: 'Notification',
    component: () => <Notification />,
  },
];

const StudentRecordSettingScreen = () => {
  const tabs = useTabs('general');
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        links={[{ name: 'Student' }, { name: 'Student Records' }, { name: 'Setting' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
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

export default StudentRecordSettingScreen;

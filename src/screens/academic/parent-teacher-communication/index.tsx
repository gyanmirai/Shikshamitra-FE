'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Inbox from './inbox';
import Settings from './setting';
import Dashboard from './dashboard';
import SentMessage from './sent-message';
import GroupMessage from './group-message';
import ScheduledMeetings from './scheduled-meetings';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: () => <Dashboard />,
  },
  {
    value: 'inbox',
    label: 'Inbox',
    component: () => <Inbox />,
  },
  {
    value: 'scheduledMeetings',
    label: 'Scheduled Meetings',
    component: () => <ScheduledMeetings />,
  },

  {
    value: 'sentMessage',
    label: 'Sent Message',
    component: () => <SentMessage />,
  },
  {
    value: 'groupMessages',
    label: 'Group Messages',
    component: () => <GroupMessage />,
  },

  { value: 'settings', label: 'Settings', component: () => <Settings /> },
];

const ParentTeacherCommunicationScreen = () => {
  const tabs = useTabs('dashboard');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Parent Teacher Communication"
        links={[{ name: 'Academic And Assessment' }, { name: 'Parent Teacher Communication' }]}
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

export default ParentTeacherCommunicationScreen;

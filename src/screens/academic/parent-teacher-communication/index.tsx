'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';
import { Box, Tab, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
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
    component: (props: TabComponentType) => <Dashboard {...props} />,
  },
  {
    value: 'inbox',
    label: 'Inbox',
    component: (props: TabComponentType) => <Inbox {...props} />,
  },
  {
    value: 'scheduledMeetings',
    label: 'Scheduled Meetings',
    component: (props: TabComponentType) => <ScheduledMeetings {...props} />,
  },

  {
    value: 'sentMessage',
    label: 'Sent Message',
    component: (props: TabComponentType) => <SentMessage {...props} />,
  },
  {
    value: 'groupMessages',
    label: 'Group Messages',
    component: (props: TabComponentType) => <GroupMessage {...props} />,
  },

  {
    value: 'settings',
    label: 'Settings',
    component: (props: TabComponentType) => <Settings {...props} />,
  },
];

const ParentTeacherCommunicationScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'dashboard' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Parent Teacher Communication"
        links={[
          { name: 'Academic And Assessment' },
          { name: 'Parent Teacher Communication' },
          { name: currentActiveComponent?.label },
        ]}
        sx={{ mb: 2 }}
      />

      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        )}{' '}
      </Box>
    </Box>
  );
};

export default ParentTeacherCommunicationScreen;

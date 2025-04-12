'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import EventType from './announcementSetting/eventType';
import UserPreferences from './notificationSetting/userPreferences';
import NotificationSetting from './notificationSetting/notificationSetting';
import SettingAnnouncement from './announcementSetting/announcementSetting';

const TABS = [
  {
    value: 'notificationSetting',
    label: 'Notification Setting',
    component: (props: TabComponentType) => <NotificationSetting {...props} />,
  },
  {
    value: 'userPreferences',
    label: 'User Preferences',
    component: (props: TabComponentType) => <UserPreferences {...props} />,
  },
  {
    value: 'announcement',
    label: 'Announcement',
    component: (props: TabComponentType) => <SettingAnnouncement {...props} />,
  },
  {
    value: 'eventType',
    label: 'Event Type',
    component: (props: TabComponentType) => <EventType {...props} />,
  },
];

const Setting = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'notificationSetting' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading={currentActiveComponent?.label}
        description="Manage your communication settings, including notification preferences and event types."
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Settings' },
          { name: currentActiveComponent?.label },
        ]}
        sx={{ px: 1, mb: 2 }}
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

export default Setting;

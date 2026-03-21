'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { useTabs } from 'src/hooks/useTabs';
import { Box, Tab, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import GeneralSettings from './setting-screen/general';
import Integrations from './setting-screen/integrations';
import NotificationSetting from './setting-screen/notification';
import CourseManagementSetting from './setting-screen/courseManagement';
import ContentManagementSetting from './setting-screen/contentManagement';

const TABS = [
  {
    value: 'generalSetting',
    label: 'General Settings',
    component: () => <GeneralSettings />,
  },
  {
    value: 'courseManagementSetting',
    label: 'Course Management Setting',
    component: () => <CourseManagementSetting />,
  },
  {
    value: 'contentManagamentSetting',
    label: 'Content Management Setting',
    component: () => <ContentManagementSetting />,
  },

  {
    value: 'notificationSetting',
    label: 'Notification Settings',
    component: () => <NotificationSetting />,
  },
  { value: 'integrations', label: 'Integrations', component: () => <Integrations /> },
];

const SettingScreen = (props: TabComponentType) => {
  const tabs = useTabs('generalSetting');
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <>
      <CustomBreadcrumbs
        heading="Settings"
        description="Manage learning management system settings including courses, content, notifications, and integrations."
        links={[{ name: 'Academics' }, { name: 'Settings' }]}
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
    </>
  );
};

export default SettingScreen;

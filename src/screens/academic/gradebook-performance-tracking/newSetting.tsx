'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Box, Tab, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import GradingScale from './settingsScreen/gradingScale';
import GradeSubmission from './settingsScreen/gradeSubmission';
import PermissionAccess from './settingsScreen/permissionAccess';
import NotificationAlert from './settingsScreen/notificationAlert';
import WeightingAdjustment from './settingsScreen/weightingAdjustment';

const TABS = [
  {
    value: 'gradingScale',
    label: 'Grading Scales',
    component: () => <GradingScale />,
    // component: (props: TabComponentType) => <GradingScale {...props} />,
  },
  {
    value: 'weightingAdjustment',
    label: 'Weighting Adjustment',
    component: () => <WeightingAdjustment />,
  },
  {
    value: 'gradeSubmission',
    label: 'Grade Submission',
    component: () => <GradeSubmission />,
    // component: (props: TabComponentType) => <GradeSubmission {...props} />,
  },
  {
    value: 'permissionAccess',
    label: 'Permission Access',
    component: () => <PermissionAccess />,
    // component: (props: TabComponentType) => <PermissionAccess {...props} />,
  },
  {
    value: 'notificationAlert',
    label: 'Notification Alert',
    component: () => <NotificationAlert />,
    // component: (props: TabComponentType) => <NotificationAlert {...props} />,
  },
];

const SettingScreen = (props: TabComponentType) => {
  const tabs = useTabs('gradingScale');
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Settings"
        links={[
          { name: 'Academics' },
          { name: 'Gradebook And Performace Tracking' },
          { name: 'Settings' },
        ]}
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

export default SettingScreen;

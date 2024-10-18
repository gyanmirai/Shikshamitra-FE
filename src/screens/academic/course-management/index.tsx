'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Settings from './settings';
import Subjects from './subjects';
import Dashboard from './dashboard';
import ContentLibrary from './contentLibrary';
import CourseManagement from './courseManagement';
import ReportsAnalytics from './reportsAndAnalyics';
import LearningResources from './learningResources';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: () => <Dashboard />,
  },
  {
    value: 'courseManagement',
    label: 'Course Management',
    component: () => <CourseManagement />,
  },
  {
    value: 'subjects',
    label: 'Subjects',
    component: () => <Subjects />,
  },
  {
    value: 'learningResources',
    label: 'Learning Resources',
    component: () => <LearningResources />,
  },
  { value: 'contentLibrary', label: 'Content Library', component: () => <ContentLibrary /> },
  {
    value: 'reportsAndAnalytics',
    label: 'Reports And Analytics',
    component: () => <ReportsAnalytics />,
  },

  { value: 'settings', label: 'Settings', component: () => <Settings /> },
];

const CourseManagementSystemScreen = () => {
  const tabs = useTabs('dashboard');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Course Management System"
        links={[{ name: 'Academic And Assessment' }, { name: 'Course Management System' }]}
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

export default CourseManagementSystemScreen;

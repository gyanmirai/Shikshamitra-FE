'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Reports from './reports';
import Dashboard from './dashboard';
import ClassProgress from './class-progress';
import ComparativeAnalytics from './comparative-analytics';
import IndividualStudentProgress from './Individual-student-progress';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: () => <Dashboard />,
  },
  {
    value: 'classProgress',
    label: 'Class Progress',
    component: () => <ClassProgress />,
  },
  {
    value: 'individualStudentProgress',
    label: 'Individual Student Progress',
    component: () => <IndividualStudentProgress />,
  },

  {
    value: 'comparativeAnalytics',
    label: 'Comparative Analytics',
    component: () => <ComparativeAnalytics />,
  },
  {
    value: 'reports',
    label: 'Reports',
    component: () => <Reports />,
  },

  { value: 'settings', label: 'Settings', component: () => '' },
];

const StudentProgressAnalyticsScreen = () => {
  const tabs = useTabs('dashboard');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Student Progress & Analytics"
        links={[{ name: 'Academic And Assessment' }, { name: 'Student Progress & Analytics' }]}
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

export default StudentProgressAnalyticsScreen;

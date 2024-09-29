'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Reports from './reports';
import Setting from './setting';
import Dashboard from './dashboard';
import Gradebook from './gradebook';
import ProgressReport from './progress-report';
import PerformanceAnalytics from './performance-analytics';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: () => <Dashboard />,
  },
  {
    value: 'gradebook',
    label: 'Gradebook',
    component: () => <Gradebook />,
  },
  {
    value: 'progressReport',
    label: 'Progress Report',
    component: () => <ProgressReport />,
  },

  {
    value: 'performanceAnalysis',
    label: 'Performance Analysis',
    component: () => <PerformanceAnalytics />,
  },
  {
    value: 'reports',
    label: 'Reports',
    component: () => <Reports />,
  },

  { value: 'settings', label: 'Settings', component: () => <Setting /> },
];

const GradeBookPerformanceTrackingScreen = () => {
  const tabs = useTabs('dashboard');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Grade Book Performance Tracking"
        links={[{ name: 'Academic And Assessment' }, { name: 'Grade Book Performance Tracking' }]}
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

export default GradeBookPerformanceTrackingScreen;

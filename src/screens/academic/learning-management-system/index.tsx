'use client';

import React from 'react';

import { Box, Tab, Card, Button } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Course from './course';
import Assignment from './assignment';
import ContentLibrary from './content-library';
import ReportsAnalytics from './reports-analytics';
import StudentProgressTracking from './student-progess-tacking';
import Dashboard from './dashboard';
import SettingScreen from './setting';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: () => <Dashboard />,
  },
  {
    value: 'course',
    label: 'Course',
    component: () => <Course />,
  },
  {
    value: 'assignment',
    label: 'Assignment',
    component: () => <Assignment />,
  },

  {
    value: 'studentProgressTracking',
    label: 'Student Progress Tracking',
    component: () => <StudentProgressTracking />,
  },
  { value: 'contentLibrary', label: 'Content Library', component: () => <ContentLibrary /> },
  {
    value: 'reportsAndAnalytics',
    label: 'Reports And Analytics',
    component: () => <ReportsAnalytics />,
  },

  { value: 'settings', label: 'Settings', component: () => <SettingScreen /> },
];

const LearningManagementSystemScreen = () => {
  const tabs = useTabs('dashboard');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Learning Management System"
        links={[{ name: 'Academic And Assessment' }, { name: 'Learning Management System' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box
        sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}
      >
        <Button
          startIcon={<Iconify icon="mdi:account-plus" />}
          color="secondary"
          variant="contained"
        >
          Create New Course
        </Button>
        <Button startIcon={<Iconify icon="mdi:plus" />} color="primary" variant="contained">
          Upload Content
        </Button>

        <Button
          startIcon={<Iconify icon="mdi:file-document-outline" />}
          color="error"
          variant="contained"
        >
          Generate Report
        </Button>

        <Button startIcon={<Iconify icon="mdi:pencil" />} color="warning" variant="contained">
          Add Assignment
        </Button>
      </Box>
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

export default LearningManagementSystemScreen;

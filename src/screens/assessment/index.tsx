'use client';

import React from 'react';

import { Tab, Box, Card, Button } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Reports from './reports';
import Setting from './setting';
import GradeBook from './grade-book';
import PendingAssessment from './pending-assessment';
import CompletedAssessment from './completed-assessment';
import AssessmentDashboardTab from './dashboard/assessment-dashboard-tab';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: () => <AssessmentDashboardTab />,
  },
  {
    value: 'pendingAssessment',
    label: 'Pending Assessment',
    component: () => <PendingAssessment />,
  },
  {
    value: 'completedAssessment',
    label: 'Completed Assessment',
    component: () => <CompletedAssessment />,
  },

  {
    value: 'gradeBook',
    label: 'Grade Book',
    component: () => <GradeBook />,
  },
  { value: 'reports', label: 'Reports', component: () => <Reports /> },

  { value: 'settings', label: 'Settings', component: () => <Setting /> },
];

const AssessmentScreen = () => {
  const tabs = useTabs('dashboard');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Assessment"
        links={[{ name: 'Assessment' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box
        sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}
      >
        <Button startIcon={<Iconify icon="mdi:calendar" />} color="secondary" variant="contained">
          Create New Assessment
        </Button>
        <Button startIcon={<Iconify icon="mdi:upload" />} color="primary" variant="contained">
          Bulk Upload Mark
        </Button>

        <Button
          startIcon={<Iconify icon="mingcute:notification-fill" />}
          color="warning"
          variant="contained"
        >
          Send Reminder
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

export default AssessmentScreen;

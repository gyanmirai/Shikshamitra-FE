'use client';

import React from 'react';

import { Tab, Box, Card, Button } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Settings from './settings';
import ExamOverview from './exam-overview';
import ScheduleExam from './schedule-exam';
import ResultReport from './result-report';
import GradingAndAnalytics from './gradingAndAnalytics';
import AssessmentManagement from './assessment-management';
import ExaminationDashboardTab from './dashboard/examination-dashboard-tab';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: () => <ExaminationDashboardTab />,
  },
  {
    value: 'examOverview',
    label: 'Exam Overview',
    component: () => <ExamOverview />,
  },
  {
    value: 'scheduleExam',
    label: 'Schedule Exam',
    component: () => <ScheduleExam />,
  },

  {
    value: 'assessmentManagement',
    label: 'Assessment Management',
    component: () => <AssessmentManagement />,
  },
  { value: 'resultAndReport', label: 'Result And Report', component: () => <ResultReport /> },

  { value: 'gradingAndAnalytics', label: 'Grading And Analytics', component: () => <GradingAndAnalytics /> },
  { value: 'settings', label: 'Settings', component: () => <Settings /> },
];

const ExaminationPageScreen = () => {
  const tabs = useTabs('dashboard');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Examination"
        links={[{ name: 'Examination' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box
        sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}
      >
        <Button startIcon={<Iconify icon="mdi:calendar" />} color="secondary" variant="contained">
          Schedule Exam
        </Button>
        <Button startIcon={<Iconify icon="mdi:upload" />} color="primary" variant="contained">
          Upload Mark
        </Button>

        <Button
          startIcon={<Iconify icon="mdi:file-document-outline" />}
          color="error"
          variant="contained"
        >
          Generate Report
        </Button>

        <Button
          startIcon={<Iconify icon="mingcute:notification-fill" />}
          color="warning"
          variant="contained"
        >
          send notification
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

export default ExaminationPageScreen;

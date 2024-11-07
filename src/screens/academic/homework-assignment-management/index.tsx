'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Setting from './setting';
import Dashboard from './dashboard';
import DueDateCalendar from './duedate-calendar';
import HomeworkCreation from './homework-creation';
import StudentSubmission from './student-submission';
import GradingAndFeedback from './gradingAndFeedback';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: () => <Dashboard />,
  },
  {
    value: 'homeworkCreation',
    label: 'Homework Assignment Creation',
    component: () => <HomeworkCreation />,
  },
  {
    value: 'dueDatesAndCalendar',
    label: 'Due Dates and Calendar',
    component: () => <DueDateCalendar />,
  },
  {
    value: 'studentSubmissions',
    label: 'Student Submissions',
    component: () => <StudentSubmission />,
  },
  {
    value: 'gradingAndFeedback',
    label: 'Grading And Feedback',
    component: () => <GradingAndFeedback />,
  },
  { value: 'settings', label: 'Settings', component: () => <Setting /> },
];

const HomeworkAndAssignmentScreen = () => {
  const tabs = useTabs('dashboard');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Homework and Assignment Management"
        links={[
          { name: 'Academic And Assessment' },
          { name: 'Homework and Assignment Management' },
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

export default HomeworkAndAssignmentScreen;

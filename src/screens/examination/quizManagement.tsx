'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ActiveQuiz from './quizManagement/activeQuiz';
import ArchievedQuiz from './quizManagement/archievedQuiz';

const TABS = [
  {
    value: 'activeQuiz',
    label: 'Scheduled',
    description: 'Manage quizzes, including scheduling, archiving, and viewing quiz results.',
    component: () => <ActiveQuiz />,
  },
  {
    value: 'archieved',
    label: 'Archieved',
    description: 'View archived quizzes and their results.',
    component: () => <ArchievedQuiz />,
  },
  //   {
  //     value: 'eventType',
  //     label: 'Event Type',
  //     component: (props: TabComponentType) => <EventType {...props} />,
  //   },
];

const QuizManagement = (props: TabComponentType) => {
  // Initialize tabs with 'activeQuiz' as default value using custom hook
  const tabs = useTabs('activeQuiz');

  // Find and get the component to render based on current tab value
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  // Find and get the current tab object containing label and description
  const currentTab = TABS.find((tab) => tab.value === tabs.value);
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Quiz Management"
        description={currentTab?.description}
        links={[
          { name: 'Academic and Assignment', href: '/academic/dashboard' },
          { name: 'Examination', href: '/academic/examinationDashboard' },
          { name: 'Quiz Management' },
          { name: currentTab?.label || '' },
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

export default QuizManagement;

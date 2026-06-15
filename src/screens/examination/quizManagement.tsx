'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Tab, Box, Paper } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ActiveQuiz from './quizManagement/activeQuiz/activeQuiz';

const TABS = [
  {
    value: 'activeQuiz',
    label: 'Scheduled',
    description: 'Manage quizzes, including scheduling, archiving, and viewing quiz results.',
    component: () => <ActiveQuiz />,
  },
  // {
  //   value: 'archieved',
  //   label: 'Archieved',
  //   description: 'View archived quizzes and their results.',
  //   component: () => <ArchievedQuiz />,
  // },
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Quiz Management"
        description={currentTab?.description}
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Examination' },
          { name: 'Quiz Management' },
          { name: currentTab?.label || '' },
        ]}
        //
      />
      <Paper
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
      </Paper>
      <Box px={1} pt={2} height="100%">
        {CurrentComponent?.()}
      </Box>
    </Box>
  );
};

export default QuizManagement;

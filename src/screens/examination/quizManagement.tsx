'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';

import ActiveQuiz from './quizManagement/activeQuiz';
import ArchievedQuiz from './quizManagement/archievedQuiz';

const TABS = [
  {
    value: 'activeQuiz',
    label: 'Active',
    component: () => <ActiveQuiz />,
  },
  {
    value: 'archieved',
    label: 'Archieved',
    component: () => <ArchievedQuiz />,
  },
  //   {
  //     value: 'eventType',
  //     label: 'Event Type',
  //     component: (props: TabComponentType) => <EventType {...props} />,
  //   },
];

const QuizManagement = (props: TabComponentType) => {
  const tabs = useTabs('activeQuiz');
  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <>
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
    </>
  );
};

export default QuizManagement;

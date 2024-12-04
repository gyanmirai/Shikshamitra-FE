'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

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
    component: (props: TabComponentType) => <Dashboard {...props} />,
  },
  {
    value: 'homeworkCreation',
    label: 'Homework/Assignment Creation',
    component: (props: TabComponentType) => <HomeworkCreation {...props} />,
  },
  {
    value: 'dueDatesAndCalendar',
    label: 'Due Dates',
    component: (props: TabComponentType) => <DueDateCalendar {...props} />,
  },
  {
    value: 'studentSubmissions',
    label: 'Student Submissions',
    component: (props: TabComponentType) => <StudentSubmission {...props} />,
  },
  {
    value: 'gradingAndFeedback',
    label: 'Grading And Feedback',
    component: (props: TabComponentType) => <GradingAndFeedback {...props} />,
  },
  {
    value: 'settings',
    label: 'Settings',
    component: (props: TabComponentType) => <Setting {...props} />,
  },
];

const HomeworkAndAssignmentScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'dashboard' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Homework and Assignment Management"
        links={[
          { name: 'Academic And Assessment' },
          { name: 'Homework and Assignment Management' },
          { name: currentActiveComponent?.label },
        ]}
        sx={{ px: 1, mb: 2 }}
      />

      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        )}{' '}
      </Box>
    </Box>
  );
};

export default HomeworkAndAssignmentScreen;

'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HomeworkMarksAndFeedback from './homeworkMarksFeedback';
import AssignmentMarksAndFeedback from './assignmentMarksFeedback';

const TABS = [
  {
    value: 'homeworkMarks',
    label: 'Homework Marks Management',
    component: (props: TabComponentType) => <HomeworkMarksAndFeedback {...props} />,
  },
  {
    value: 'assignmentMarks',
    label: 'Assignment Marks Management',
    component: (props: TabComponentType) => <AssignmentMarksAndFeedback {...props} />,
  },
];
const MarksFeedbackHomeworkAssignment = () => {
  // Initialize search params with default tab 'subjectSetting'
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'homeworkMarks' });

  // Find and memoize the currently active tab component based on search params
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Marks & Feedback"
        description={
          currentActiveComponent?.value === 'homeworkMarks'
            ? 'Add and manage marks/feedback for homework assignments'
            : 'Add and manage marks/feedback for academic assignments'
        }
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Homework And Assignment', href: '/academic/homeworkCreation' },
          { name: 'Marks & Feedback' },
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
export default MarksFeedbackHomeworkAssignment;

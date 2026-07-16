'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';
import { Tab, Box, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import MyHomeworkSubmission from './myHomeworkSubmission';
import MyAssignmentSubmission from './myAssignmentSubmission';

const TABS = [
  {
    value: 'Homeworks',
    label: 'Homework Submission',
    component: (props: TabComponentType) => <MyHomeworkSubmission {...props} />,
  },
  {
    value: 'Assignments',
    label: 'Assignment Submission',
    component: (props: TabComponentType) => <MyAssignmentSubmission {...props} />,
  },
];
const MySubmission = () => {
  // Initialize search params with default tab 'subjectSetting'
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'Homeworks' });

  // Find and memoize the currently active tab component based on search params
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  return (
    <Box>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="My Submission"
        description={
          currentActiveComponent?.value === 'Homeworks'
            ? 'View and manage your homework submissions'
            : 'View and manage your assignment submissions'
        }
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Homework & Assignment', href: '/academic/homeworkCreation' },
          { name: 'My Submission' },
        ]}
      />{' '}
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1 } }}
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
export default MySubmission;

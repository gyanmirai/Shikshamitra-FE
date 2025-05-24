'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HomeworkCreation from './component';
import AssignmentCreation from '../assignmentCreation';

const TABS = [
  {
    value: 'homeworkCreation',
    label: 'Homework Creation',
    component: (props: TabComponentType) => <HomeworkCreation {...props} />,
  },
  {
    value: 'assignmentCreation',
    label: 'Assignment Creation',
    component: (props: TabComponentType) => <AssignmentCreation {...props} />,
  },
];
const HomeworkAssignment = () => {
  // Initialize search params with default tab 'subjectSetting'
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'homeworkCreation' });

  // Find and memoize the currently active tab component based on search params
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Add Homework/Assignment"
        description={
          currentActiveComponent?.value === 'homeworkCreation'
            ? 'Create and manage homework assignments for students'
            : 'Create and manage academic assignments and evaluations'
        }
        links={[
          { name: 'Academic and Assignment', href: '/academic/dashboard' },
          { name: 'Homework And Assignment' },
          { name: 'Add Homework/Assignment' },
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
export default HomeworkAssignment;

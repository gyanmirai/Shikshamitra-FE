'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Settings from './settings';
import Subjects from './subjects';
import Dashboard from './dashboard';
import Reports from './reportsAndAnalyics';
import CourseProgress from './courseProgress';
import CourseManagement from './courseManagement';
import LearningResources from './learningResources';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: (props: TabComponentType) => <Dashboard {...props} />,
  },
  {
    value: 'courseManagement',
    label: 'Course Management',
    component: (props: TabComponentType) => <CourseManagement {...props} />,
  },
  {
    value: 'subjects',
    label: 'Subjects',
    component: (props: TabComponentType) => <Subjects {...props} />,
  },
  {
    value: 'learningResources',
    label: 'Learning Resources',
    component: (props: TabComponentType) => <LearningResources {...props} />,
  },
  {
    value: 'Course Progress',
    label: 'Course Progress',
    component: (props: TabComponentType) => <CourseProgress {...props} />,
  },
  {
    value: 'reports',
    label: 'Reports',
    component: (props: TabComponentType) => <Reports {...props} />,
  },

  {
    value: 'settings',
    label: 'Settings',
    component: (props: TabComponentType) => <Settings {...props} />,
  },
];

const CourseManagementSystemScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'dashboard' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading={currentActiveComponent?.label}
        links={[
          { name: 'Academic And Assessment' },
          { name: 'Course Management System' },
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

export default CourseManagementSystemScreen;

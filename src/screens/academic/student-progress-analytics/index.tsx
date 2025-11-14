'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';
import { Box, Tab, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Reports from './reports';
import ClassProgress from './class-progress';
import Dashboard from './dashboard/dashboard';
import ComparativeAnalytics from './comparativeAnalytics/comparative-analytics';
import StudentProgressAnalyticsSetting from './settings/student-progress-analytics-setting';
import IndividualStudentProgress from './individualStudentPerformance/Individual-student-progress';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: (props: TabComponentType) => <Dashboard {...props} />,
  },
  {
    value: 'classProgress',
    label: 'Class Progress',
    component: (props: TabComponentType) => <ClassProgress {...props} />,
  },
  {
    value: 'individualStudentProgress',
    label: 'Individual Student Progress',
    component: (props: TabComponentType) => <IndividualStudentProgress {...props} />,
  },
  {
    value: 'comparativeAnalytics',
    label: 'Comparative Analytics',
    component: (props: TabComponentType) => <ComparativeAnalytics {...props} />,
  },
  {
    value: 'reports',
    label: 'Reports',
    component: (props: TabComponentType) => <Reports {...props} />,
  },
  {
    value: 'settings',
    label: 'Settings',
    component: (props: TabComponentType) => <StudentProgressAnalyticsSetting {...props} />,
  },
];

const StudentProgressAnalyticsScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'dashboard' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Student Progress & Analytics"
        links={[
          { name: 'Academic And Assessment' },
          { name: 'Student Progress & Analytics' },
          { name: currentActiveComponent?.label },
        ]}
        sx={{ mb: 2 }}
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

export default StudentProgressAnalyticsScreen;

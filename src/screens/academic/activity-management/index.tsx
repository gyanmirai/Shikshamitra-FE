'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';
import { Box, Tab, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/useSearchParam';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import StudentGroup from './studentGroup';
import Dashboard from './dashboard/dashboard';
import DynamicGroupManagement from './dynamicGroup';
import ActivityManagement from './activityManagement';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: (props: TabComponentType) => <Dashboard {...props} />,
  },
  {
    value: 'dynamicGroup',
    label: 'Dynamic Group',
    component: (props: TabComponentType) => <DynamicGroupManagement {...props} />,
  },
  {
    value: 'activityManagement',
    label: 'Activity Management',
    component: (props: TabComponentType) => <ActivityManagement {...props} />,
  },
  {
    value: 'studentGroup',
    label: 'Student Group',
    component: (props: TabComponentType) => <StudentGroup {...props} />,
  },
];

const ActivityManagementScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'dashboard' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Activity Management"
        links={[
          { name: 'Academic And Assessment' },
          { name: 'Activity Management' },
          { name: currentActiveComponent?.label },
        ]}
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

export default ActivityManagementScreen;

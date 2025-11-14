'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';
import { Box, Tab, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Reports from './newReport';
import SettingScreen from './newSetting';
import Gradebook from './gradebook/gradebook';
import Dashboard from './dashboard/dashboard';
import PerformanceAnalytics from './performance-analytics';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: (props: TabComponentType) => <Dashboard {...props} />,
  },
  {
    value: 'gradebook',
    label: 'Gradebook',
    component: (props: TabComponentType) => <Gradebook {...props} />,
  },
  // {
  //   value: 'progressReport',
  //   label: 'Progress Report',
  //   component: (props: TabComponentType) => <ProgressReport {...props} />,
  // },
  {
    value: 'performanceAnalysis',
    label: 'Performance Analysis',
    component: (props: TabComponentType) => <PerformanceAnalytics {...props} />,
  },
  {
    value: 'reports',
    label: 'Reports',
    component: (props: TabComponentType) => <Reports {...props} />,
  },
  {
    value: 'settings',
    label: 'Settings',
    component: (props: TabComponentType) => <SettingScreen {...props} />,
  },
];

const GradeBookPerformanceTrackingScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'dashboard' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Grade Book Performance Tracking"
        links={[
          { name: 'Academic And Assessment' },
          { name: 'Grade Book Performance Tracking' },
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

export default GradeBookPerformanceTrackingScreen;

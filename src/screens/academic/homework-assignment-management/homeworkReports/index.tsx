'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import { Tab, Box, Paper } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import HomeworkManagementReports from './Components/homeworkTypeReports/HomeworkTypeReports';
import AssignmentManagementReports from './Components/assignmentTypeReports/AssignmentTypeReports';
import HomeworkAssignmentAnalyticsReports from './Components/analyticsTypeReports/AnalyticsTypeReports';

const TABS = [
  {
    icon: <Iconify icon="mdi:file-document-outline" width={20} />,
    value: 'homeworkReports',
    label: 'Homework Reports',
    component: (props: TabComponentType) => <HomeworkManagementReports />,
  },
  {
    icon: <Iconify icon="mdi:file-document-check-outline" width={20} />,
    value: 'assignmentReports',
    label: 'Assignment Reports',
    component: (props: TabComponentType) => <AssignmentManagementReports />,
  },
  {
    icon: <Iconify icon="solar:chart-square-outline" width={20} />,
    value: 'analyticsMonitoring',
    label: 'Analytics & Monitoring',
    component: (props: TabComponentType) => <HomeworkAssignmentAnalyticsReports />,
  },
];

const HomeworkAssignmentReports = () => {
  // Initialize search params with default tab 'homeworkReports'
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'homeworkReports' });

  // Find and memoize the currently active tab component based on search params
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  const dynamicLabel =
    currentActiveComponent?.value === 'homeworkReports'
      ? 'Homework Reports'
      : currentActiveComponent?.value === 'assignmentReports'
        ? 'Assignment Reports'
        : 'Analytics & Monitoring';
  const [isBackClick, setIsBackClick] = useState(false);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading={dynamicLabel}
        description={
          currentActiveComponent?.value === 'homeworkReports'
            ? 'Explore and export homework-related reports and insights.'
            : currentActiveComponent?.value === 'assignmentReports'
              ? 'Browse and export assignment reports for classes and subjects.'
              : 'Monitor trends, performance, and submission analytics.'
        }
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Homework & Assignment', href: '/academic/homeworkCreation' },
          { name: 'Reports', href: '#' },
          { name: dynamicLabel },
        ]}
        sx={{ mb: 2 }}
      />
      <Paper
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => {
            const newIndex = TABS.findIndex((tab) => tab.value === value);
            if (currentIndex > newIndex) {
              setIsBackClick(true);
            } else {
              setIsBackClick(false);
            }
            setSearchParams({ tab: value });
          }}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 }, borderRadius: 1.5 }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      </Paper>
      <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{
          sx: {
            p: 0,
            minHeight: 0,
          },
        }}
      >
        <Box sx={{ height: '100%' }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          )}{' '}
        </Box>
      </FormSlider>
    </Box>
  );
};
export default HomeworkAssignmentReports;

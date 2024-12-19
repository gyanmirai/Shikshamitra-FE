'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';

import { Box, Tab, Card, Button } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Course from './course';
import Dashboard from './dashboard';
import SettingScreen from './setting';
import ContentLibrary from './content-library';
import ReportsAnalytics from './reports-analytics';
import StudentProgressTracking from './student-progess-tacking';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: (props: TabComponentType) => <Dashboard {...props} />,
  },
  {
    value: 'course',
    label: 'Course',
    component: (props: TabComponentType) => <Course {...props} />,
  },
  // {
  //   value: 'assignment',
  //   label: 'Assignment',
  //   component: (props: TabComponentType) => <Assignment {...props} />,
  // },
  {
    value: 'studentProgressTracking',
    label: 'Student Progress Tracking',
    component: (props: TabComponentType) => <StudentProgressTracking {...props} />,
  },
  {
    value: 'contentLibrary',
    label: 'Content Library',
    component: (props: TabComponentType) => <ContentLibrary {...props} />,
  },
  {
    value: 'reportsAndAnalytics',
    label: 'Reports And Analytics',
    component: (props: TabComponentType) => <ReportsAnalytics {...props} />,
  },
  {
    value: 'settings',
    label: 'Settings',
    component: (props: TabComponentType) => <SettingScreen {...props} />,
  },
];

const LearningManagementSystemScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'dashboard' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Learning Management System"
        links={[
          { name: 'Academic And Assignment' },
          { name: 'Learning Management System' },
          { name: currentActiveComponent?.label },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box
        sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}
      >
        <Button
          startIcon={<Iconify icon="mdi:account-plus" />}
          variant="contained"
          sx={{
            backgroundColor: (theme) => varAlpha(theme.palette.secondary.mainChannel, 0.1),
            color: 'secondary.main',
            '&:hover': {
              backgroundColor: (theme) => varAlpha(theme.palette.secondary.mainChannel, 0.1),
            },
          }}
        >
          Create New Course
        </Button>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          sx={{
            backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
            color: 'primary.main',
            '&:hover': {
              backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
            },
          }}
        >
          Upload Content
        </Button>

        <Button
          startIcon={<Iconify icon="mdi:file-document-outline" />}
          variant="contained"
          sx={{
            backgroundColor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.1),
            color: 'error.main',
            '&:hover': {
              backgroundColor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.1),
            },
          }}
        >
          Generate Report
        </Button>

        <Button
          startIcon={<Iconify icon="mdi:pencil" />}
          variant="contained"
          sx={{
            backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
            color: 'warning.main',
            '&:hover': {
              backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
            },
          }}
        >
          Add Assignment
        </Button>
      </Box>
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          sx={{ fontSize: '12px' }}
          variant="fullWidth"
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

export default LearningManagementSystemScreen;

'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';

import { Box, Tab, Card, Button } from '@mui/material';

import { useNewSearchParams } from 'src/hooks/use-search-param';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';

import Teacher from './teacher';
import Subject from './subject';
import Reports from './reports';
import Settings from './settings';
import CurriculumOverview from './curriculum-overview';
import CarriculumDashboardTab from './dashboard/carriculum-dashboard-tab';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: (props: TabComponentType) => <CarriculumDashboardTab {...props} />,
  },
  {
    value: 'subjects',
    label: 'Subjects',
    component: (props: TabComponentType) => <Subject {...props} />,
  },
  // { value: 'subjects', label: 'Subjects', component: () => <Subject /> },
  {
    value: 'curriculumOverview',
    label: 'Curriculum Overview',
    component: (props: TabComponentType) => <CurriculumOverview {...props} />,
  },
  // {
  //   value: 'create-edit-curriculum',
  //   label: 'Create/Edit Curriculum',
  //   component: () => <Curriculum />,
  // },
  {
    value: 'teacher',
    label: 'Teacher',
    component: (props: TabComponentType) => <Teacher {...props} />,
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

const CurriculumManagementScreen = () => {
  const [searchParams, setSearchParams] = useNewSearchParams({ tab: 'dashboard' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  const handleTabChange = (newTab: string) => {
    setSearchParams({ tab: newTab });
  };

  return (
    <Box>
      {/* <CustomBreadcrumbs
        heading="Curriculum Management"
        links={[
          { name: 'Academic And Assessment' },
          { name: 'Curriculum Management' },
          { name: currentActiveComponent?.label },
        ]}
        sx={{ px: 1, mb: 2 }}
      /> */}
      <Box
        sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}
      >
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          color="primary"
          sx={{
            backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
            color: 'primary.main',
            '&:hover': {
              backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
            },
          }}
          variant="contained"
          onClick={() => {
            setSearchParams?.({
              tab: 'subjects',
            });
          }}
        >
          Subject
        </Button>

        <Button
          startIcon={<Iconify icon="mdi:file-document-outline" />}
          color="error"
          variant="contained"
          sx={{
            backgroundColor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.1),
            color: 'error.main',
            '&:hover': {
              backgroundColor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.1),
            },
          }}
          onClick={() => {
            setSearchParams?.({
              tab: 'reports',
            });
          }}
        >
          Generate Report
        </Button>

        <Button
          startIcon={<Iconify icon="mdi:pencil" />}
          color="warning"
          variant="contained"
          sx={{
            backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
            color: 'warning.main',
            '&:hover': {
              backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
            },
          }}
          onClick={() => {
            setSearchParams?.({
              tab: 'curriculumOverview',
            });
          }}
        >
          Edit Curriculum
        </Button>
      </Box>

      <Card>
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
        >
          {TABS.map((tab) => (
            <Tab sx={{ fontSize: '12px' }} key={tab.value} value={tab.value} label={tab.label} />
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

export default CurriculumManagementScreen;

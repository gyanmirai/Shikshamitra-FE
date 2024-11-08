'use client';

import React from 'react';

import { Box, Tab, Card, Button } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Teacher from './teacher';
import Subject from './subject';
import Reports from './reports';
import Settings from './settings';
import Curriculum from './curriculum';
import CurriculumOverview from './curriculum-overview';
import CarriculumDashboardTab from './dashboard/carriculum-dashboard-tab';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: () => <CarriculumDashboardTab />,
  },
  { value: 'subjects', label: 'Subjects', component: () => <Subject /> },
  {
    value: 'curriculumOverview',
    label: 'Curriculum Overview',
    component: () => <CurriculumOverview />,
  },
  // {
  //   value: 'create-edit-curriculum',
  //   label: 'Create/Edit Curriculum',
  //   component: () => <Curriculum />,
  // },
  { value: 'teacher', label: 'Teacher', component: () => <Teacher /> },
  { value: 'reports', label: 'Reports', component: () => <Reports /> },
  { value: 'settings', label: 'Settings', component: () => <Settings /> },
];

const CurriculumManagementScreen = () => {
  const tabs = useTabs('dashboard');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Curriculum Management"
        links={[{ name: 'Academic And Assessment' }, { name: 'Curriculum Management' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box
        sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}
      >
        <Button startIcon={<Iconify icon="mdi:plus" />} color="primary" variant="contained">
          Add New Subject
        </Button>

        <Button
          startIcon={<Iconify icon="mdi:account-plus" />}
          color="secondary"
          variant="contained"
        >
          Assign Teacher
        </Button>

        <Button
          startIcon={<Iconify icon="mdi:file-document-outline" />}
          color="error"
          variant="contained"
        >
          Generate Report
        </Button>

        <Button startIcon={<Iconify icon="mdi:pencil" />} color="warning" variant="contained">
          Edit Curriculum
        </Button>
      </Box>
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {CurrentComponent?.()}
      </Box>
    </Box>
  );
};

export default CurriculumManagementScreen;

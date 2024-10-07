'use client';

import React from 'react';

import { Box, Tab, Card, Button } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import NewTimetable from './new-timetable';
import RoomAllocation from './room-allocation';
import TeacherManagement from './teacher-management';
import CurrentTimetableOverview from './current-timetable-overvirew';
import TimeScheduleManagementDashboardTab from './dashboard/time-schedule-management-dashboard-tab';
import TimeScheduleManagementsetting from './settings/time-schedule-management-setting';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: () => <TimeScheduleManagementDashboardTab/>,
  },
  {
    value: 'currentTimetableOverview',
    label: 'Current Timetable Overview',
    component: () => <CurrentTimetableOverview />,
  },
  {
    value: 'createNewTimetable',
    label: 'Create New Timetable',
    component: () => <NewTimetable />,
  },

  {
    value: 'teacherManagement',
    label: 'Teacher Management',
    component: () => <TeacherManagement />,
  },
  { value: 'roomAllocation', label: 'Room Allocation', component: () => <RoomAllocation /> },

  { value: 'settings', label: 'Settings', component: () => <TimeScheduleManagementsetting /> },
];

const TimetableScheduleManagementScreen = () => {
  const tabs = useTabs('dashboard');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Timetable Schedule Management"
        links={[{ name: 'Academic And Assessment' }, { name: 'Timetable Schedule Management' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box
        sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end', mb: 1 }}
      >
        <Button
          startIcon={<Iconify icon="mdi:account-plus" />}
          color="secondary"
          variant="contained"
        >
          Add New Teacher
        </Button>
        <Button startIcon={<Iconify icon="mdi:plus" />} color="primary" variant="contained">
          Add New Subject
        </Button>

        <Button
          startIcon={<Iconify icon="mdi:file-document-outline" />}
          color="error"
          variant="contained"
        >
          Generate Timetable Report
        </Button>

        <Button startIcon={<Iconify icon="mdi:pencil" />} color="warning" variant="contained">
          Recent Update
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

export default TimetableScheduleManagementScreen;

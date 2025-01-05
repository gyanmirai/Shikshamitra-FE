'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';

import { Box, Tab, Card, Button } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Reports from './reports';
import TimeTableGrid from './tt';
import CurrentTimetable from './currentTimetable';
import TimeScheduleManagementsetting from './settings/time-schedule-management-setting';
import TimeScheduleManagementDashboardTab from './dashboard/time-schedule-management-dashboard-tab';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: (props: TabComponentType) => <TimeScheduleManagementDashboardTab {...props} />,
  },
  {
    value: 'currentTimetableOverview',
    label: 'Current Timetable Overview',
    component: (props: TabComponentType) => <CurrentTimetable {...props} />,
  },
  {
    value: 'createNewTimetable',
    label: 'Create New Timetable',
    component: (props: TabComponentType) => <TimeTableGrid {...props} />,
  },

  // {
  //   value: 'teacherManagement',
  //   label: 'Teacher Management',
  //   component: (props: TabComponentType) => <TeacherManagement {...props} />,
  // },
  // {
  //   value: 'roomAllocation',
  //   label: 'Room Allocation',
  //   component: (props: TabComponentType) => <RoomAllocation {...props} />,
  // },
  {
    value: 'reports',
    label: 'Reports',
    component: (props: TabComponentType) => <Reports {...props} />,
  },
  {
    value: 'settings',
    label: 'Settings',
    component: (props: TabComponentType) => <TimeScheduleManagementsetting {...props} />,
  },
];

const TimetableScheduleManagementScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'dashboard' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Timetable Schedule Management"
        links={[{ name: 'Academic And Assignment' }, { name: 'Timetable Schedule Management' }]}
        sx={{ px: 1, mb: 2 }}
      />
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
              tab: 'currentTimetableOverview',
            });
          }}
        >
          TimeTable
        </Button>

        <Button
          startIcon={<Iconify icon="mdi:file-document-outline" />}
          color="error"
          sx={{
            backgroundColor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.1),
            color: 'error.main',
            '&:hover': {
              backgroundColor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.1),
            },
          }}
          variant="contained"
          onClick={() => {
            setSearchParams?.({
              tab: 'reports',
            });
          }}
        >
          Generate Timetable Report
        </Button>

        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          color="warning"
          sx={{
            backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
            color: 'warning.main',
            '&:hover': {
              backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
            },
          }}
          variant="contained"
          onClick={() => {
            setSearchParams?.({
              tab: 'settings',
            });
          }}
        >
          Room
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

export default TimetableScheduleManagementScreen;

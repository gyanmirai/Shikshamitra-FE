'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import { Box } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import ScrollableCard from 'src/screens/examination/dashboard/component/custom-scrollable-card';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';

import { CalendarView } from 'src/sections/calendar/view';

const TimeScheduleManagementDashboardTab = (props: TabComponentType) => {
  const { setSearchParams } = props;

  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<any>('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const UpcomingScheduleAlerts: string[] = [
    '10-10-2024 9:00 PM , Teacher - John Doe , Room No.- 101',
    '10-10-2024 9:00 PM , Teacher - John Doe , Room No.- 101',
    '10-10-2024 9:00 PM , Teacher - John Doe , Room No.- 101',
  ];
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Time Table Management' },
          { name: 'Dashboard' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={
          <DashBoardQuickAction
            actions={[
              {
                icon: 'mdi:plus',
                label: 'Timetable',
                href: '/academic/timetable-schedule-management/newTimetable',
                color: 'primary',
              },
              {
                icon: 'mdi:plus',
                label: 'Room',
                href: '/academic/timetable-schedule-management/settings',
                color: 'warning',
              },
              {
                icon: 'simple-icons:googledocs',
                label: 'General Reports',
                href: '/academic/timetable-schedule-management/reports',
                color: 'secondary',
              },
            ]}
          />
        }
      />
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box display="flex" flexDirection="row" gap={3}>
          <CustomSelect
            label="Organization"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
          <CustomSelect
            label="Class"
            options={classData?.items || []}
            value={classes}
            isLoading={isLoading}
            labelKey="name"
            valueKey="id"
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              setClasses(val as string);
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
          <CustomSelect
            label="Division"
            disabled={!classes}
            labelKey="name"
            valueKey="id"
            options={divisionOptions}
            value={division}
            onChange={(val) => {
              setDivision(val as string);
            }}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
        </Box>
      </Box>
      <CalendarView />
      <Grid2 container spacing={3}>
        <Grid2 xs={12} md={6} lg={6}>
          <ScrollableCard
            filterLabel="Subject"
            showFilter
            title="Upcoming Schedule Alerts"
            content={UpcomingScheduleAlerts}
          />
        </Grid2>
        <Grid2 xs={12} md={6} lg={6}>
          <ScrollableCard
            showFilter={false}
            title="Upcoming Schedule Alerts"
            content={UpcomingScheduleAlerts}
          />
        </Grid2>
      </Grid2>
      <Grid2 container spacing={3}>
        <Grid2 xs={12} md={6} lg={6}>
          <ScrollableCard
            showFilter={false}
            title="Timetable conflicts"
            content={UpcomingScheduleAlerts}
          />
        </Grid2>
        <Grid2 xs={12} md={6} lg={6}>
          <ScrollableCard
            showFilter={false}
            title="Pending approvals"
            content={UpcomingScheduleAlerts}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default TimeScheduleManagementDashboardTab;

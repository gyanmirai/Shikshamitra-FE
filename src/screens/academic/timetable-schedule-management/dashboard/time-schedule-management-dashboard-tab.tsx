import type { Division, Standards } from 'src/types/school';

import React, { useState } from 'react';

import { Box, Button } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import ScrollableCard from 'src/screens/examination/dashboard/component/custom-scrollable-card';

import CustomSelect from 'src/components/custom-select';

import { CalendarView } from 'src/sections/calendar/view';

const TimeScheduleManagementDashboardTab = () => {
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<any>([]);
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
    <>
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
            multiple
            options={divisionOptions}
            value={division}
            onChange={(val) => {
              setDivision(val as string);
            }}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button color="error" variant="contained">
            Assign Teacher
          </Button>
          <Button color="secondary" variant="contained">
            Manage Room
          </Button>
          <Button variant="contained" onClick={() => {}}>
            Create New Timetable
          </Button>
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
    </>
  );
};

export default TimeScheduleManagementDashboardTab;

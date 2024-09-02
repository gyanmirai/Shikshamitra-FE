'use client';

import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Tab, Tabs, Paper, Divider } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const data = [
  {
    name: 'John Doe',
    inTime: '09:00',
    outTime: '18:00',
    hoursWorked: 8,
    status: 'Present',
  },
  {
    name: 'Jane Smith',
    inTime: '09:15',
    outTime: '17:45',
    hoursWorked: 7.5,
    status: 'Present',
  },
  {
    name: 'Mike Johnson',
    inTime: '09:00',
    outTime: '17:00',
    hoursWorked: 8,
    status: 'Present',
  },
  {
    name: 'Emily Brown',
    inTime: '09:00',
    outTime: '15:00',
    hoursWorked: 6,
    status: 'Half-Day',
  },
  {
    name: 'David Wilson',
    inTime: '-',
    outTime: '-',
    hoursWorked: 0,
    status: 'Absent',
  },
];

const AttendanceTrackingScreen = () => {
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const tabs = useTabs('all');

  const tableData = useMemo(
    () => (tabs.value === 'all' ? data : data.filter((i) => i.status === tabs.value)),
    [tabs.value]
  );

  const counts = useMemo(
    () => ({
      all: data.length,
      Present: data.filter((i) => i.status === 'Present').length,
      Absent: data.filter((i) => i.status === 'Absent').length,
      'Half-Day': data.filter((i) => i.status === 'Half-Day').length,
    }),
    []
  );
  const TABS = useMemo(
    () => [
      { value: 'all', label: 'All', count: counts.all, color: 'default' },
      { value: 'Present', label: 'Present', count: counts.Present, color: 'success' },
      { value: 'Absent', label: 'Absent', count: counts.Absent, color: 'error' },
      { value: 'Half-Day', label: 'Half-Day', count: counts['Half-Day'], color: 'warning' },
    ],
    [counts]
  );
  return (
    <Paper sx={{ p: 1 }}>
      <CustomBreadcrumbs
        heading="Attendance Tracking"
        links={[{ name: 'HR' }, { name: 'Attendance Tracking' }]}
        sx={{ px: 1, mb: 3 }}
      />

      <DatePicker
        format="DD-MM-YYYY"
        // label="Select Date"
        value={date}
        onChange={(value) => setDate(value)}
        sx={{ mb: 2 }}
        slotProps={{
          textField: {
            size: 'small',
          },
        }}
      />

      <Tabs
        value={tabs.value}
        onChange={tabs.onChange}
        sx={{
          mb: 2,
          '& .MuiTabs-flexContainer': { gap: 2 },
          flexGrow: 1,
        }}
      >
        {TABS.map((tab) => (
          <Tab
            sx={{ fontSize: '12px' }}
            key={tab.value}
            label={
              <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                {tab.label}{' '}
                <Label
                  variant={tab.value === 'all' ? 'filled' : 'soft'}
                  color={(tab?.color as LabelColor) || 'default'}
                >
                  {tab.count}
                </Label>
              </Box>
            }
            // icon={tab.icon}
            value={tab.value}
          />
        ))}
      </Tabs>
      <Divider />
      <CustomizableTable
        columns={[
          { id: 'name', label: 'Name' },

          { id: 'hoursWorked', label: 'Hours Worked' },
          { id: 'inTime', label: 'In-time' },
          { id: 'outTime', label: 'Out-time' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return (
                <Label
                  color={value === 'Present' ? 'success' : value === 'Absent' ? 'error' : 'warning'}
                >
                  {value}
                </Label>
              );
            },
          },
        ]}
        data={tableData}
      />
    </Paper>
  );
};

export default AttendanceTrackingScreen;

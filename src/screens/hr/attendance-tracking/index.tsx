'use client';

import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';
import type { EmployeeAttendance } from 'src/types/employee';

import dayjs from 'dayjs';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Tab,
  Card,
  Tabs,
  Paper,
  Divider,
  MenuItem,
  MenuList,
  Typography,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { varAlpha } from 'src/theme/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EmployeeAttendanceStatus } from 'src/enums/employee-attendance-status';
import {
  useGetEmployeeQuery,
  useLazyGetAttendanceByEmployeeIdQuery,
  useLazyGetEmployeeAttendanceByDateQuery,
} from 'src/redux/employee/employeeApi';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const AttendanceTrackingScreen = () => {
  const tabs = useTabs('dateWise');
  const MAIN_TABS = [
    { value: 'dateWise', label: 'Date Wise' },
    { value: 'employeeWise', label: 'Employee Wise' },
  ];
  return (
    <Paper sx={{ p: 1 }}>
      <CustomBreadcrumbs
        heading="Attendance Tracking"
        links={[{ name: 'HR' }, { name: 'Attendance Tracking' }]}
        sx={{ px: 1, mb: 3 }}
      />
      <Card>
        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {MAIN_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box p={2}>{tabs.value === 'dateWise' ? <DateWise /> : <EmployeeWise />}</Box>
    </Paper>
  );
};

export default AttendanceTrackingScreen;

const DateWise = () => {
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const tabs = useTabs(EmployeeAttendanceStatus.All);

  const [getAttendance, { data: attendanceData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEmployeeAttendanceByDateQuery,
  });

  const tableData = useMemo(
    () =>
      tabs.value === EmployeeAttendanceStatus.All
        ? attendanceData?.items || []
        : attendanceData?.items?.filter((i: EmployeeAttendance) => i.status === tabs.value),
    [attendanceData?.items, tabs.value]
  );

  useEffect(() => {
    getAttendance(date?.format('YYYY-MM-DD'));
  }, [date, getAttendance]);

  const counts = useMemo(
    () => ({
      all: attendanceData?.items.length,
      Present: attendanceData?.items.filter(
        (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.Present
      ).length,
      Absent: attendanceData?.items.filter(
        (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.FullDayLeave
      ).length,
      'Half-Day': attendanceData?.items.filter(
        (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.HalfDayLeave
      ).length,
    }),
    [attendanceData?.items]
  );
  const TABS = useMemo(
    () => [
      { value: EmployeeAttendanceStatus.All, label: 'All', count: counts.all, color: 'default' },
      {
        value: EmployeeAttendanceStatus.Present,
        label: 'Present',
        count: counts.Present,
        color: 'success',
      },
      {
        value: EmployeeAttendanceStatus.FullDayLeave,
        label: 'Absent',
        count: counts.Absent,
        color: 'error',
      },
      {
        value: EmployeeAttendanceStatus.HalfDayLeave,
        label: 'Half-Day',
        count: counts['Half-Day'],
        color: 'warning',
      },
    ],
    [counts]
  );
  return (
    <>
      {' '}
      <DatePicker
        format="DD-MM-YYYY"
        label="Select Date"
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
                  variant={tab.value === EmployeeAttendanceStatus.All ? 'filled' : 'soft'}
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
        isLoading={isLoading}
        columns={[
          { id: 'employeeName', label: 'Name' },

          { id: 'hoursWorked', label: 'Hours Worked' },
          { id: 'timeIn', label: 'In-time' },
          { id: 'timeOut', label: 'Out-time' },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return (
                <Label
                  color={
                    value === EmployeeAttendanceStatus.Present
                      ? 'success'
                      : value === EmployeeAttendanceStatus.FullDayLeave
                        ? 'error'
                        : 'warning'
                  }
                >
                  {value}
                </Label>
              );
            },
          },
        ]}
        data={tableData}
      />
    </>
  );
};

const EmployeeWise = () => {
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [employeeId, setEmployeeId] = useState<string>('');
  const { data: employees, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });

  const [getAttendance, { data }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetAttendanceByEmployeeIdQuery,
  });

  console.log(data, 'data');

  useEffect(() => {
    if (employeeId) {
      getAttendance({ employeeId: `employeeIds=${employeeId}`, month: date?.format('YYYY-MM-DD') });
    }
  }, [date, employeeId, getAttendance]);

  return (
    <>
      <CustomSelect
        options={employees?.items || []}
        isLoading={isLoading}
        label="Select Employee"
        value={employeeId}
        labelKey="lastName"
        valueKey="id"
        onChange={(value) => {
          setEmployeeId(value as string);
        }}
        formControlProps={{
          sx: {
            width: '100%',
            maxWidth: 300,
          },
        }}
      />
      &nbsp;
      <DatePicker
        format="MMM-YYYY"
        label="Select Month Year"
        views={['year', 'month']}
        value={date}
        onChange={(value) => setDate(value)}
        sx={{ mb: 2 }}
        slotProps={{
          textField: {
            size: 'small',
          },
        }}
      />
      <Box display="flex" gap={2} justifyContent="space-between">
        <Card
          sx={{
            maxWidth: 280,
            width: '100%',
            backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.3),
            color: (theme) => theme.palette.primary.main,
            p: 2,
          }}
        >
          <Typography variant="h6">Total Present Days</Typography>

          <Typography variant="h4">{data?.[0]?.presentDays}</Typography>
        </Card>
        <Card
          sx={{
            maxWidth: 280,
            p: 2,
            width: '100%',
            backgroundColor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.3),
            color: (theme) => theme.palette.error.main,
          }}
        >
          <Typography variant="h6">Full Day Leave</Typography>

          <Typography variant="h4">{data?.[0]?.leaveDays}</Typography>
        </Card>
        <Card
          sx={{
            maxWidth: 280,
            p: 2,
            width: '100%',
            backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.3),
            color: (theme) => theme.palette.warning.main,
          }}
        >
          <Typography variant="h6">Half Day Leave</Typography>

          <Typography variant="h4">{data?.[0]?.halfDayLeaves}</Typography>
        </Card>
      </Box>
      {employeeId && (
        <CustomizableTable
          columns={[
            { id: 'date', label: 'Date' },

            { id: 'inTime', label: 'In-time' },
            { id: 'outTime', label: 'Out-time' },
            { id: 'totalTime', label: 'Total Time' },
            {
              id: 'status',
              label: 'Status',
              render(value, row) {
                return (
                  <Label
                    color={
                      value === EmployeeAttendanceStatus.Present
                        ? 'success'
                        : value === EmployeeAttendanceStatus.FullDayLeave
                          ? 'error'
                          : 'warning'
                    }
                  >
                    {value}
                  </Label>
                );
              },
            },
            {
              id: 'action',
              label: 'Action',
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={(props: any) => {
                      const { popover }: any = props;
                      return (
                        <MenuList>
                          <MenuItem
                            onClick={() => {
                              popover?.close?.();
                            }}
                          >
                            <Iconify icon="carbon:view" /> View
                          </MenuItem>
                        </MenuList>
                      );
                    }}
                  />
                );
              },
            },
          ]}
          data={[]}
        />
      )}
    </>
  );
};

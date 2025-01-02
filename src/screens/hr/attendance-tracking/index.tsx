'use client';

import type { LabelColor } from 'src/components/label';
import type { EmployeeAttendance } from 'src/types/employee';

import dayjs from 'dayjs';
import React, { useMemo, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Tab, Card, Tabs, Paper, Divider, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';

import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import { varAlpha } from 'src/theme/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';
import {
  EmployeeAttendanceStatus,
  EmployeeAttendanceStatusColor,
} from 'src/enums/employee-attendance-status';
import {
  useGetEmployeeQuery,
  useLazyGetAttendanceByEmployeeIdQuery,
  useLazyGetEmployeeAttendanceByDateQuery,
} from 'src/redux/employee/employeeApi';

import { Label } from 'src/components/label';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const AttendanceTrackingScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'dateWise' });
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
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {MAIN_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box p={2}>
        {searchParams.tab === 'dateWise' ? (
          <DateWise searchParams={searchParams} setSearchParams={setSearchParams} />
        ) : (
          <EmployeeWise searchParams={searchParams} setSearchParams={setSearchParams} />
        )}
      </Box>
    </Paper>
  );
};

export default AttendanceTrackingScreen;

const DateWise = ({
  searchParams,
  setSearchParams,
}: {
  searchParams: Record<string, string>;
  setSearchParams: (obj: Record<string, any>) => void;
}) => {
  // const [date, setDate] = useState<Dayjs | null>(dayjs());
  const dateValue = useMemo(
    () => (searchParams.date ? dayjs(searchParams.date, 'DD-MM-YYYY') : dayjs()),
    [searchParams.date]
  );
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
    if (searchParams.date) {
      const dateTimeOffset = dateConvertor(
        dayjs(searchParams.date, 'DD-MM-YYYY').format(dateFormat),
        true
      );
      getAttendance(dateTimeOffset);
    } else {
      getAttendance(dateConvertor(dayjs().format(dateFormat), true));
    }
  }, [searchParams.date, getAttendance]);

  useEffect(
    () => () => {
      setSearchParams({ date: '' });
    },
    [setSearchParams]
  );

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
      {
        value: EmployeeAttendanceStatus.All,
        label: 'All',
        count: counts.all || 0,
        color: 'default',
      },
      {
        value: EmployeeAttendanceStatus.Present,
        label: 'Present',
        count: counts.Present || 0,
        color: 'success',
      },
      {
        value: EmployeeAttendanceStatus.FullDayLeave,
        label: 'Absent',
        count: counts.Absent || 0,
        color: 'error',
      },
      {
        value: EmployeeAttendanceStatus.HalfDayLeave,
        label: 'Half-Day',
        count: counts['Half-Day'] || 0,
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
        value={dateValue}
        onChange={(value) => {
          setSearchParams({ date: value?.format('DD-MM-YYYY') });
          // setDate(value);
        }}
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

const EmployeeWise = ({
  searchParams,
  setSearchParams,
}: {
  searchParams: Record<string, string>;
  setSearchParams: (obj: Record<string, any>) => void;
}) => {
  const startDate = useMemo(
    () =>
      searchParams.startDate
        ? dayjs(searchParams.startDate, 'DD-MM-YYYY')
        : dayjs().startOf('month'),
    [searchParams.startDate]
  );
  const endDate = useMemo(
    () =>
      searchParams.endDate ? dayjs(searchParams.endDate, 'DD-MM-YYYY') : dayjs().endOf('month'),
    [searchParams.endDate]
  );

  // const [employeeId, setEmployeeId] = useState<string>('');
  const { data: employees, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });

  const [getAttendance, { data, isLoading: attendanceLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetAttendanceByEmployeeIdQuery,
  });

  useEffect(() => {
    if (searchParams?.employeeId && startDate) {
      console.log('getAttendance');
      getAttendance({
        employeeId: `${searchParams.employeeId}`,
        month: dateConvertor(dayjs(startDate, 'DD-MM-YYYY').format(dateFormat), true),
      });
    }
  }, [searchParams?.employeeId, getAttendance, startDate]);

  useEffect(
    () => () => {
      setSearchParams({ date: '', startDate: '', endDate: '', employeeId: '' });
    },
    [setSearchParams]
  );

  return (
    <>
      <CustomSelect
        options={employees?.items || []}
        isLoading={isLoading}
        label="Select Employee"
        value={searchParams?.employeeId}
        labelKey="lastName"
        valueKey="id"
        onChange={(value) => {
          // setEmployeeId(value as string);
          setSearchParams({ employeeId: value as string });
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
        format="DD-MM-YYYY"
        label="Start Date"
        value={startDate}
        onChange={(value) => {
          setSearchParams({ startDate: value?.format('DD-MM-YYYY') });
          // setDate(value);
        }}
        sx={{ mb: 2 }}
        slotProps={{
          textField: {
            size: 'small',
          },
        }}
      />
      &nbsp;
      <DatePicker
        format="DD-MM-YYYY"
        label="End Date"
        value={endDate}
        onChange={(value) => {
          setSearchParams({ endDate: value?.format('DD-MM-YYYY') });
          // setDate(value);
        }}
        sx={{ mb: 2 }}
        slotProps={{
          textField: {
            size: 'small',
          },
        }}
      />
      {searchParams?.employeeId && (
        <Box display="flex" gap={2}>
          <Card
            sx={{
              maxWidth: 280,
              width: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
              color: (theme) => theme.palette.primary.main,
              p: 2,
            }}
          >
            <Typography variant="subtitle1">Total Present Days</Typography>

            <Typography variant="h3">{data?.[0]?.presentDays || 0}</Typography>
          </Card>
          <Card
            sx={{
              maxWidth: 280,
              p: 2,
              width: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.1),
              color: (theme) => theme.palette.error.main,
            }}
          >
            <Typography variant="subtitle1">Full Day Leave</Typography>

            <Typography variant="h3">{data?.[0]?.leaveDays || 0}</Typography>
          </Card>
          <Card
            sx={{
              maxWidth: 280,
              p: 2,
              width: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
              color: (theme) => theme.palette.warning.main,
            }}
          >
            <Typography variant="subtitle1">Half Day Leave</Typography>

            <Typography variant="h3">{data?.[0]?.halfDayLeaves || 0}</Typography>
          </Card>
        </Box>
      )}
      {searchParams?.employeeId && (
        <CustomizableTable
          isLoading={attendanceLoading}
          columns={[
            {
              id: 'attendanceDate',
              label: 'Date',
              render(value, row) {
                return dayjs(value, 'YYYY-MM-DD').format('DD-MM-YYYY');
              },
            },

            { id: 'timeIn', label: 'In-time' },
            { id: 'timeOut', label: 'Out-time' },
            { id: 'totalHoursWorked', label: 'Total Time' },
            {
              id: 'status',
              label: 'Status',
              render(value: number, row) {
                const status = EmployeeAttendanceStatus[row.statusType];
                return (
                  <Label
                    variant="soft"
                    color={
                      EmployeeAttendanceStatusColor[
                        status as keyof typeof EmployeeAttendanceStatusColor
                      ]
                    }
                  >
                    {status}
                  </Label>
                );
              },
            },
            // {
            //   id: 'action',
            //   label: 'Action',
            //   render(value, row) {
            //     return (
            //       <ThreeDotsActions
            //         actions={(props: any) => {
            //           const { popover }: any = props;
            //           return (
            //             <MenuList>
            //               <MenuItem
            //                 onClick={() => {
            //                   popover?.close?.();
            //                 }}
            //               >
            //                 <Iconify icon="carbon:view" /> View
            //               </MenuItem>
            //             </MenuList>
            //           );
            //         }}
            //       />
            //     );
            //   },
            // },
          ]}
          data={
            data?.[0]?.employeeAttendances?.items?.map((i: any) => ({
              ...i,
              status: EmployeeLeaveStatusType[i.statusType],
            })) || []
          }
        />
      )}
    </>
  );
};

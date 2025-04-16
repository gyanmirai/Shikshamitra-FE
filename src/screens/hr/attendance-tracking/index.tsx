'use client';

import type { LabelColor } from 'src/components/label';
import type { EmployeeAttendance } from 'src/types/employee';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Tab,
  Card,
  Tabs,
  Paper,
  Divider,
  Checkbox,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import { varAlpha } from 'src/theme/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';
import {
  EmployeeAttendanceStatus,
  EmployeeAttendanceStatusColor,
  EmployeeAttendanceStatusOptions,
} from 'src/enums/employee-attendance-status';
import {
  useGetEmployeeQuery,
  useLazyGetAttendanceByEmployeeIdQuery,
  useLazyGetEmployeeAttendanceByDateQuery,
} from 'src/redux/employee/employeeApi';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import TeacherAttendanceTracking from './teacher-attendance-tracking';

const AttendanceTrackingScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'dateWise' });
  const { employee } = useSelector((store: any) => store.auth);
  const MAIN_TABS = [
    { value: 'dateWise', label: 'Date Wise' },
    { value: 'employeeWise', label: 'Employee Wise' },
  ];
  const role = employee?.role?.name;
  return (
    <Paper sx={{ p: 1 }}>
      <CustomBreadcrumbs
        heading="Attendance Tracking"
        links={[{ name: 'HR' }, { name: 'Attendance Tracking' }]}
        sx={{ px: 1, mb: 3 }}
        description="On the Attendance Tracking screen, you can view the attendance status of all employees or students, including who is present and who is absent on a specific date."
      />
      {role === 'Teacher' ? (
        <TeacherAttendanceTracking searchParams={searchParams} setSearchParams={setSearchParams} />
      ) : (
        <>
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
        </>
      )}
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
        icon: <Iconify icon="oui:check-in-circle-empty" />,
      },
      {
        value: EmployeeAttendanceStatus.FullDayLeave,
        label: 'Absent',
        count: counts.Absent || 0,
        color: 'error',
        icon: <Iconify icon="mdi:cross-circle-outline" />,
      },
      {
        value: EmployeeAttendanceStatus.HalfDayLeave,
        label: 'Half-Day',
        count: counts['Half-Day'] || 0,
        color: 'warning',
        icon: <Iconify icon="radix-icons:half-2" />,
      },
    ],
    [counts]
  );
  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
    setSelectedStudents([]);
  };

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
        onChange={handleTabChange}
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
            icon={tab.icon}
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
        noDataText={<>No Data Availabel For Attendance </>}
        searchFieldProps={{
          placeholder: 'Search by Name, Hours Work...',
          label: 'Search by Name, Hours Work....',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents.length !== 0}
        tableId="employee-attendance-table"
        isLoading={isLoading}
        columns={[
          {
            id: 'checkBox',
            align: 'left',
            minWidth: '60px',
            isSort: false,
            isFilter: false,
            label: '',
            renderColumn() {
              return (
                <Checkbox
                  checked={tableData?.length && selectedStudents?.length === tableData?.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents(tableData || []);
                    } else {
                      setSelectedStudents([]);
                    }
                  }}
                />
              );
            },
            render(value, row) {
              return (
                <Checkbox
                  checked={!!selectedStudents.some((i: any) => i.id === row.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents([...selectedStudents, row]);
                    } else {
                      setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
                    }
                  }}
                />
              );
            },
          },
          { id: 'employeeName', label: 'Name' },

          { id: 'hoursWorked', label: 'Hours Worked' },
          { id: 'timeIn', label: 'In-time' },
          { id: 'timeOut', label: 'Out-time' },
          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            enumOptions: EmployeeAttendanceStatusOptions,
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
      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}
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

  console.log('employees?.items---', employees?.items);
  console.log('searchParams?.employeeId---', searchParams?.employeeId);

  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  const [tableData, setTableData] = useState(
    data?.[0]?.employeeAttendances?.items?.map((i: any) => ({
      ...i,
      status: EmployeeLeaveStatusType[i.statusType],
    })) || []
  );
  return (
    <>
      <Box display="flex" gap={1} mb={2}>
        <Autocomplete
          options={employees?.items || []}
          getOptionLabel={(option: any) => option.lastName}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Schedule Type"
              placeholder="Search Schedule Type"
              size="small"
              fullWidth
              sx={{ width: '100%', minWidth: '250px' }}
            />
          )}
          onChange={(e, value) => {
            console.log('value----in autocomplete---', value);
            setSearchParams({ employeeId: value?.id as string });
            // formik.setFieldValue('examType', value?.id);
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
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />
      </Box>
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
          noDataText={<>No Data Availabel For Attendance </>}
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudents.length !== 0}
          tableId="employee-wise-attendance-table"
          isLoading={attendanceLoading}
          columns={[
            {
              id: 'checkBox',
              align: 'left',
              minWidth: '60px',
              isSort: false,
              isFilter: false,
              label: '',
              renderColumn() {
                return (
                  <Checkbox
                    checked={tableData?.length && selectedStudents?.length === tableData?.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents(tableData || []);
                      } else {
                        setSelectedStudents([]);
                      }
                    }}
                  />
                );
              },
              render(value, row) {
                return (
                  <Checkbox
                    checked={!!selectedStudents.some((i: any) => i.id === row.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, row]);
                      } else {
                        setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
                      }
                    }}
                  />
                );
              },
            },
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
          data={tableData}
        />
      )}
      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}
    </>
  );
};

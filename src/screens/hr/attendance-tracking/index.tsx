'use client';

import type { LabelColor } from 'src/components/label';
import type { EmployeeAttendance } from 'src/types/employee';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Tab, Card, Tabs, TextField, Autocomplete } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';
import { EmployeeAttendanceStatus } from 'src/enums/employee-attendance-status';
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
    {
      value: 'dateWise',
      label: 'Date Wise',
      icon: <Iconify icon="lets-icons:date-today-duotone" width={20} />,
    },
    {
      value: 'employeeWise',
      label: 'Employee Wise',
      icon: <Iconify icon="uim:user-md" width={20} />,
    },
  ];
  const role = employee?.role?.name;
  return (
    <Box sx={{ p: 1 }}>
      <CustomBreadcrumbs
        heading="Attendance Tracking"
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Attendance & Leave', href: `/hr/attendance-tracking/?tab=${searchParams.tab}` },
          { name: 'Attendance Tracking' },
        ]}
        sx={{ px: 1, mb: 2 }}
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
              // variant="fullWidth"
              role="tablist"
              sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
              // slotProps={{ tab: { px: 0 } }}
            >
              {MAIN_TABS.map((tab) => (
                <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
              ))}
            </CustomTabs>
          </Card>
          <Box>
            {searchParams.tab === 'dateWise' ? (
              <DateWise searchParams={searchParams} setSearchParams={setSearchParams} />
            ) : (
              <EmployeeWise searchParams={searchParams} setSearchParams={setSearchParams} />
            )}
          </Box>
        </>
      )}
    </Box>
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
      all: attendanceData?.items.length || 24,
      Present:
        attendanceData?.items.filter(
          (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.Present
        ).length || 10,
      Absent:
        attendanceData?.items.filter(
          (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.FullDayLeave
        ).length || 8,
      'Half-Day':
        attendanceData?.items.filter(
          (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.HalfDayLeave
        ).length || 6,
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
        // icon: <Iconify icon="oui:check-in-circle-empty" />,
      },
      {
        value: EmployeeAttendanceStatus.FullDayLeave,
        label: 'Absent',
        count: counts.Absent || 0,
        color: 'error',
        // icon: <Iconify icon="mdi:cross-circle-outline" />,
      },
      {
        value: EmployeeAttendanceStatus.HalfDayLeave,
        label: 'Half-Day',
        count: counts['Half-Day'] || 0,
        color: 'warning',
        // icon: <Iconify icon="radix-icons:half-2" />,
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 1,

          borderRadius: '8px',
          bgcolor: 'background.paper',
          boxShadow: 'var(--shadows-3)',
          my: 2,
        }}
      >
        <DatePicker
          format="DD-MM-YYYY"
          label="Date"
          value={dateValue}
          onChange={(value) => {
            setSearchParams({ date: value?.format('DD-MM-YYYY') });
            // setDate(value);
          }}
          sx={{ ml: 0 }}
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
            '& .MuiTabs-flexContainer': { gap: 2, justifyContent: 'end' },
            flexGrow: 1,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              key={tab.value}
              // icon={tab.icon}
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
      </Box>
      <CustomizableTable
        noDataText={<>No Data Availabel For Attendance </>}
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents.length !== 0}
        tableId="employee-attendance-table"
        isLoading={isLoading}
        columns={[
          // {
          //   id: 'checkBox',
          //   align: 'left',
          //   minWidth: '60px',
          //   sticky: true,
          //   isSort: false,
          //   isFilter: false,
          //   label: '',
          //   renderColumn() {
          //     return (
          //       <Checkbox
          //         checked={tableData?.length && selectedStudents?.length === tableData?.length}
          //         onChange={(e) => {
          //           if (e.target.checked) {
          //             setSelectedStudents(tableData || []);
          //           } else {
          //             setSelectedStudents([]);
          //           }
          //         }}
          //       />
          //     );
          //   },
          //   render(value, row) {
          //     return (
          //       <Checkbox
          //         checked={!!selectedStudents.some((i: any) => i.id === row.id)}
          //         onChange={(e) => {
          //           if (e.target.checked) {
          //             setSelectedStudents([...selectedStudents, row]);
          //           } else {
          //             setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
          //           }
          //         }}
          //       />
          //     );
          //   },
          // },
          { id: 'employeeName', label: 'Name', minWidth: '10vw', align: 'left', sticky: true },
          { id: 'employeeCode', label: 'Employee Code', align: 'left' },
          { id: 'contactNo', label: 'Contact No.', align: 'left' },
          {
            id: 'timeIn',
            label: 'In-Time',
            align: 'left',
            render(value, row) {
              return value || `__ __`;
            },
          },
          {
            id: 'timeOut',
            label: 'Out-Time',
            align: 'left',
            render(value, row) {
              return value || `__ __`;
            },
          },
          { id: 'totalHoursWorked', label: 'Hours Worked', align: 'left' },
          // {
          //   id: 'status',
          //   label: 'Status',
          //   filterType: 'enum',
          //   sticky: true,
          //   enumOptions: EmployeeAttendanceStatusOptions,
          //   render(value, row) {
          //     return (
          //       <Label
          //         color={
          //           value === EmployeeAttendanceStatus.Present
          //             ? 'success'
          //             : value === EmployeeAttendanceStatus.FullDayLeave
          //               ? 'error'
          //               : 'warning'
          //         }
          //       >
          //         {value}
          //       </Label>
          //     );
          //   },
          // },
          {
            id: 'status',
            label: 'Status',
            sticky: true,
            render(value, row) {
              return (
                <Label
                  color={value === 'Present' ? 'success' : value === 'Leave' ? 'error' : 'warning'}
                >
                  {value}
                </Label>
              );
            },
          },
        ]}
        data={[
          {
            id: 1,
            attendanceDate: '2024-03-01',
            timeIn: '09:00 AM',
            timeOut: '06:00 PM',
            totalHoursWorked: '9H 0M',
            status: 'Present',
            employeeName: 'Kumar Rajesh Mohan',
            contactNo: '+91 98765 43210',
            employeeCode: 'EMP001',
          },
          {
            id: 2,
            attendanceDate: '2024-03-02',
            timeIn: '09:30 AM',
            timeOut: '05:30 PM',
            totalHoursWorked: '8H 0M',
            status: 'Present',
            employeeName: 'Sharma Priya Raj',
            contactNo: '+91 98765 43211',
            employeeCode: 'EMP002',
          },
          {
            id: 3,
            attendanceDate: '2024-03-03',
            timeIn: '',
            timeOut: '',
            totalHoursWorked: '0H 0M',
            status: 'Leave',
            employeeName: 'Patel Amit Naresh',
            contactNo: '+91 98765 43212',
            employeeCode: 'EMP003',
          },
          {
            id: 4,
            attendanceDate: '2024-03-04',
            timeIn: '09:15 AM',
            timeOut: '02:15 PM',
            totalHoursWorked: '5H 0M',
            status: 'Half day',
            employeeName: 'Gupta Sneha Ramesh',
            contactNo: '+91 98765 43213',
            employeeCode: 'EMP004',
          },
          {
            id: 5,
            attendanceDate: '2024-03-05',
            timeIn: '09:00 AM',
            timeOut: '06:00 PM',
            totalHoursWorked: '9H 0M',
            status: 'Present',
            employeeName: 'Singh Vikram Pratap',
            contactNo: '+91 98765 43214',
            employeeCode: 'EMP005',
          },
          {
            id: 6,
            attendanceDate: '2024-03-06',
            timeIn: '09:45 AM',
            timeOut: '06:45 PM',
            totalHoursWorked: '9H 0M',
            status: 'Present',
            employeeName: 'Verma Neha Suresh',
            contactNo: '+91 98765 43215',
            employeeCode: 'EMP006',
          },
          {
            id: 7,
            attendanceDate: '2024-03-07',
            timeIn: '',
            timeOut: '',
            totalHoursWorked: '0H 0M',
            status: 'Leave',
            employeeName: 'Joshi Arun Kumar',
            contactNo: '+91 98765 43216',
            employeeCode: 'EMP007',
          },
          {
            id: 8,
            attendanceDate: '2024-03-08',
            timeIn: '09:00 AM',
            timeOut: '06:00 PM',
            totalHoursWorked: '9H 0M',
            status: 'Present',
            employeeName: 'Reddy Meera Krishna',
            contactNo: '+91 98765 43217',
            employeeCode: 'EMP008',
          },
          {
            id: 9,
            attendanceDate: '2024-03-09',
            timeIn: '09:30 AM',
            timeOut: '02:30 PM',
            totalHoursWorked: '5H 0M',
            status: 'Half day',
            employeeName: 'Malhotra Rahul Dinesh',
            contactNo: '+91 98765 43218',
            employeeCode: 'EMP009',
          },
          {
            id: 10,
            attendanceDate: '2024-03-10',
            timeIn: '09:00 AM',
            timeOut: '06:00 PM',
            totalHoursWorked: '9H 0M',
            status: 'Present',
            employeeName: 'Desai Anita Mahesh',
            contactNo: '+91 98765 43219',
            employeeCode: 'EMP010',
          },
        ]}
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

  const tabs = useTabs(EmployeeAttendanceStatus.All);

  // const [employeeId, setEmployeeId] = useState<string>('');
  const { data: employees, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });

  const [getAttendance, { data, isLoading: attendanceLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetAttendanceByEmployeeIdQuery,
  });

  const counts = useMemo(
    () => ({
      all: data?.items?.length || 24,
      Present:
        data?.items?.filter(
          (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.Present
        ).length || 10,
      Absent:
        data?.items?.filter(
          (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.FullDayLeave
        ).length || 8,
      'Half-Day':
        data?.items?.filter(
          (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.HalfDayLeave
        ).length || 6,
    }),
    [data?.items]
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
        // icon: <Iconify icon="oui:check-in-circle-empty" />,
      },
      {
        value: EmployeeAttendanceStatus.FullDayLeave,
        label: 'Absent',
        count: counts.Absent || 0,
        color: 'error',
        // icon: <Iconify icon="mdi:cross-circle-outline" />,
      },
      {
        value: EmployeeAttendanceStatus.HalfDayLeave,
        label: 'Half-Day',
        count: counts['Half-Day'] || 0,
        color: 'warning',
        // icon: <Iconify icon="radix-icons:half-2" />,
      },
    ],
    [counts]
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
    setSelectedStudents([]);
  };

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
      <Box
        display="flex"
        gap={2}
        sx={{
          borderRadius: '8px',
          bgcolor: 'background.paper',
          boxShadow: 'var(--shadows-3)',
          my: 2,
          p: 1,
        }}
      >
        <Autocomplete
          options={employees?.items || []}
          getOptionLabel={(option: any) =>
            `${option.firstName || ''} ${option.middleName || ''} ${option.lastName || ''} (${option.employeeCode || ''})`
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Employee"
              placeholder="Search Employee"
              size="small"
              fullWidth
              sx={{ width: '100%', minWidth: 268 }}
            />
          )}
          onChange={(e, value) => {
            console.log('value----in autocomplete---', value);
            setSearchParams({ employeeId: value?.id as string });
            // formik.setFieldValue('examType', value?.id);
          }}
        />

        <DatePicker
          format="DD-MM-YYYY"
          label="Start Date"
          value={startDate}
          onChange={(value) => {
            setSearchParams({ startDate: value?.format('DD-MM-YYYY') });
            // setDate(value);
          }}
          sx={{ maxWidth: 268, width: '100%' }}
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />

        <DatePicker
          format="DD-MM-YYYY"
          label="End Date"
          value={endDate}
          onChange={(value) => {
            setSearchParams({ endDate: value?.format('DD-MM-YYYY') });
            // setDate(value);
          }}
          sx={{ maxWidth: 268, width: '100%' }}
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />
      </Box>
      {searchParams?.employeeId && (
        <Tabs
          value={tabs.value}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-flexContainer': { gap: 2 },
            flexGrow: 1,
            borderRadius: '8px',
            bgcolor: 'background.paper',
            boxShadow: 'var(--shadows-3)',
            mb: 2,
            p: 1,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              key={tab.value}
              // icon={tab.icon}
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
      )}

      {/* {searchParams?.employeeId && (
        <Box display="flex" gap={2} m={2} ml={0}>
          <Card
            sx={{
              maxWidth: 280,
              width: '100%',
              // backgroundColor: (theme) => varAlpha(theme.palette.success.mainChannel, 0.1),
              color: (theme) => theme.palette.success.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1">Total Present Days</Typography>

              <Typography variant="h3">{data?.[0]?.presentDays || 10}</Typography>
            </Box>

            <Iconify icon="fluent:person-available-16-regular" width={32} />
          </Card>
          <Card
            sx={{
              maxWidth: 280,
              p: 2,
              width: '100%',
              // backgroundColor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.1),
              color: (theme) => theme.palette.error.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="subtitle1">Full Day Leave</Typography>

              <Typography variant="h3">{data?.[0]?.leaveDays || 2}</Typography>
            </Box>
            <Iconify icon="fluent-mdl2:leave-user" width={32} />
          </Card>
          <Card
            sx={{
              maxWidth: 280,
              p: 2,
              width: '100%',
              // backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
              color: (theme) => theme.palette.warning.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="subtitle1">Half Day Leave</Typography>
              <Typography variant="h3">{data?.[0]?.halfDayLeaves || 3}</Typography>
            </Box>
            <Iconify icon="mdi:fraction-one-half" width={32} />
          </Card>

          <Card
            sx={{
              maxWidth: 280,
              p: 2,
              width: '100%',
              // backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
              color: (theme) => theme.palette.error.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="subtitle1">Rejected Leave</Typography>
              <Typography variant="h3">{data?.[0]?.halfDayLeaves || 3}</Typography>
            </Box>
            <Iconify icon={GlobalIcons.reject} width={32} />
          </Card>
        </Box>
      )} */}
      {searchParams?.employeeId && (
        <CustomizableTable
          noDataText={<>No Data Availabel For Attendance </>}
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudents.length !== 0}
          tableId="employee-wise-attendance-table"
          isLoading={attendanceLoading}
          columns={[
            // {
            //   id: 'checkBox',
            //   align: 'left',
            //   minWidth: '60px',
            //   sticky: true,
            //   isSort: false,
            //   isFilter: false,
            //   label: '',
            //   renderColumn() {
            //     return (
            //       <Checkbox
            //         checked={tableData?.length && selectedStudents?.length === tableData?.length}
            //         onChange={(e) => {
            //           if (e.target.checked) {
            //             setSelectedStudents(tableData || []);
            //           } else {
            //             setSelectedStudents([]);
            //           }
            //         }}
            //       />
            //     );
            //   },
            //   render(value, row) {
            //     return (
            //       <Checkbox
            //         checked={!!selectedStudents.some((i: any) => i.id === row.id)}
            //         onChange={(e) => {
            //           if (e.target.checked) {
            //             setSelectedStudents([...selectedStudents, row]);
            //           } else {
            //             setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
            //           }
            //         }}
            //       />
            //     );
            //   },
            // },
            {
              id: 'attendanceDate',
              label: 'Date',
              filterType: 'date',
              sticky: true,
              render(value, row) {
                return dayjs(value, 'YYYY-MM-DD').format('DD-MM-YYYY');
              },
            },
            {
              id: 'timeIn',
              label: 'In-time',
              render(value, row) {
                return value || `__ __`;
              },
            },
            {
              id: 'timeOut',
              label: 'Out-time',
              render(value, row) {
                return value || `__ __`;
              },
            },
            { id: 'totalHoursWorked', label: 'Hours Worked' },
            {
              id: 'status',
              label: 'Status',
              sticky: true,
              render(value, row) {
                return (
                  <Label
                    color={
                      value === 'Present' ? 'success' : value === 'Leave' ? 'error' : 'warning'
                    }
                  >
                    {value}
                  </Label>
                );
              },
              // render(value: number, row) {
              //   const status = EmployeeAttendanceStatus[row.statusType];
              //   return (
              //     <Label
              //       variant="soft"
              //       color={
              //         EmployeeAttendanceStatusColor[
              //           status as keyof typeof EmployeeAttendanceStatusColor
              //         ]
              //       }
              //     >
              //       {status}
              //     </Label>
              //   );
              // },
            },
          ]}
          data={[
            {
              id: 1,
              attendanceDate: '2024-03-01',
              timeIn: '09:00 AM',
              timeOut: '06:00 PM',
              totalHoursWorked: '9H 0M',
              status: 'Present',
              employeeName: 'Kumar Rajesh Mohan',
              contactNo: '+91 98765 43210',
              employeeCode: 'EMP001',
            },
            {
              id: 2,
              attendanceDate: '2024-03-02',
              timeIn: '09:30 AM',
              timeOut: '05:30 PM',
              totalHoursWorked: '8H 0M',
              status: 'Present',
              employeeName: 'Sharma Priya Raj',
              contactNo: '+91 98765 43211',
              employeeCode: 'EMP002',
            },
            {
              id: 3,
              attendanceDate: '2024-03-03',
              timeIn: '',
              timeOut: '',
              totalHoursWorked: '0H 0M',
              status: 'Leave',
              employeeName: 'Patel Amit Naresh',
              contactNo: '+91 98765 43212',
              employeeCode: 'EMP003',
            },
            {
              id: 4,
              attendanceDate: '2024-03-04',
              timeIn: '09:15 AM',
              timeOut: '02:15 PM',
              totalHoursWorked: '5H 0M',
              status: 'Half day',
              employeeName: 'Gupta Sneha Ramesh',
              contactNo: '+91 98765 43213',
              employeeCode: 'EMP004',
            },
            {
              id: 5,
              attendanceDate: '2024-03-05',
              timeIn: '09:00 AM',
              timeOut: '06:00 PM',
              totalHoursWorked: '9H 0M',
              status: 'Present',
              employeeName: 'Singh Vikram Pratap',
              contactNo: '+91 98765 43214',
              employeeCode: 'EMP005',
            },
            {
              id: 6,
              attendanceDate: '2024-03-06',
              timeIn: '09:45 AM',
              timeOut: '06:45 PM',
              totalHoursWorked: '9H 0M',
              status: 'Present',
              employeeName: 'Verma Neha Suresh',
              contactNo: '+91 98765 43215',
              employeeCode: 'EMP006',
            },
            {
              id: 7,
              attendanceDate: '2024-03-07',
              timeIn: '',
              timeOut: '',
              totalHoursWorked: '0H 0M',
              status: 'Leave',
              employeeName: 'Joshi Arun Kumar',
              contactNo: '+91 98765 43216',
              employeeCode: 'EMP007',
            },
            {
              id: 8,
              attendanceDate: '2024-03-08',
              timeIn: '09:00 AM',
              timeOut: '06:00 PM',
              totalHoursWorked: '9H 0M',
              status: 'Present',
              employeeName: 'Reddy Meera Krishna',
              contactNo: '+91 98765 43217',
              employeeCode: 'EMP008',
            },
            {
              id: 9,
              attendanceDate: '2024-03-09',
              timeIn: '09:30 AM',
              timeOut: '02:30 PM',
              totalHoursWorked: '5H 0M',
              status: 'Half day',
              employeeName: 'Malhotra Rahul Dinesh',
              contactNo: '+91 98765 43218',
              employeeCode: 'EMP009',
            },
            {
              id: 10,
              attendanceDate: '2024-03-10',
              timeIn: '09:00 AM',
              timeOut: '06:00 PM',
              totalHoursWorked: '9H 0M',
              status: 'Present',
              employeeName: 'Desai Anita Mahesh',
              contactNo: '+91 98765 43219',
              employeeCode: 'EMP010',
            },
          ]}
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

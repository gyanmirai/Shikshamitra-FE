'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { EmployeeAttendance } from 'src/types/employee';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParam } from 'src/hooks/use-search-param';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';
import { EmployeeAttendanceStatus } from 'src/enums/employee-attendance-status';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import {
  useGetEmployeeQuery,
  useLazyGetAttendanceByEmployeeIdQuery,
  useLazyGetEmployeeAttendanceByDateQuery,
} from 'src/redux/employee/employeeApi';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Select,
  MenuItem,
  Skeleton,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  Autocomplete,
} from '@mui/material';

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
  const currentIndex = MAIN_TABS.findIndex((i) => i.value === searchParams.tab);
  const [isBackClick, setIsBackClick] = useState<boolean>(false);
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Attendance Tracking"
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Attendance & Leave', href: `/hr/attendance-tracking/?tab=${searchParams.tab}` },
          { name: 'Attendance Tracking' },
        ]}
        sx={{ px: 1, mb: 1 }}
        description="On the Attendance Tracking screen, you can view the attendance status of all employees, including who is present and who is absent on a specific date."
      />
      {role === 'Teacher' ? (
        <TeacherAttendanceTracking searchParams={searchParams} setSearchParams={setSearchParams} />
      ) : (
        <>
          <Paper>
            <CustomTabs
              value={searchParams.tab}
              onChange={(e, value) => {
                const findNewIndex = MAIN_TABS.findIndex((i) => i.value === value);
                setIsBackClick(currentIndex > findNewIndex);
                setSearchParams({ tab: value });
              }}
              // variant="fullWidth"
              role="tablist"
              sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
              // slotProps={{ tab: { px: 0 } }}
            >
              {MAIN_TABS.map((tab) => (
                <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
              ))}
            </CustomTabs>
          </Paper>
          <FormSlider
            steps={MAIN_TABS}
            isBackClick={isBackClick}
            step={currentIndex}
            containerProps={{
              sx: {
                p: 0,
                minHeight: 0,
              },
            }}
          >
            <Box sx={{ height: '100%' }}>
              {searchParams.tab === 'dateWise' ? (
                <DateWise searchParams={searchParams} setSearchParams={setSearchParams} />
              ) : (
                <EmployeeWise searchParams={searchParams} setSearchParams={setSearchParams} />
              )}
            </Box>
          </FormSlider>
        </>
      )}
    </Box>
  );
};

export default AttendanceTrackingScreen;
const datewiseData = [
  {
    id: 1,
    attendanceDate: '2024-03-01',
    timeIn: '09:00 AM',
    timeOut: '06:00 PM',
    totalHoursWorked: '09H 00M',
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
    totalHoursWorked: '08H 00M',
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
    totalHoursWorked: '__ __',
    status: 'Absent',
    employeeName: 'Patel Amit Naresh',
    contactNo: '+91 98765 43212',
    employeeCode: 'EMP003',
    remarks:
      'The employee was marked absent for the day without any prior communication. We are awaiting a response or formal leave request to update the records accordingly.',
  },
  {
    id: 4,
    attendanceDate: '2024-03-04',
    timeIn: '09:15 AM',
    timeOut: '02:15 PM',
    totalHoursWorked: '05H 00M',
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
    totalHoursWorked: '09H 00M',
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
    totalHoursWorked: '09H 00M',
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
    totalHoursWorked: '__ __',
    status: 'Absent',
    employeeName: 'Joshi Arun Kumar',
    contactNo: '+91 98765 43216',
    employeeCode: 'EMP007',
  },
  {
    id: 8,
    attendanceDate: '2024-03-08',
    timeIn: '09:00 AM',
    timeOut: '06:00 PM',
    totalHoursWorked: '09H 00M',
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
    totalHoursWorked: '05H 00M',
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
    totalHoursWorked: '09H 00M',
    status: 'Present',
    employeeName: 'Desai Anita Mahesh',
    contactNo: '+91 98765 43219',
    employeeCode: 'EMP010',
  },
];
const DateWise = ({
  searchParams,
  setSearchParams,
}: {
  searchParams: Record<string, string>;
  setSearchParams: (obj: Record<string, any>) => void;
}) => {
  const { currentMedium: medium, currentYear } = useSelector(
    (state: RootState) => state.globalState
  );
  const dateValue = useMemo(
    () => (searchParams.date ? dayjs(searchParams.date, 'DD-MM-YYYY') : dayjs()),
    [searchParams.date]
  );
  const tabs = useTabs(EmployeeAttendanceStatus.All);

  const [getAttendance, { data: attendanceData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEmployeeAttendanceByDateQuery,
  });

  // const tableData = useMemo(
  //   () =>
  //     tabs.value === 'All'
  //       ? attendanceData?.items || []
  //       : attendanceData?.items?.filter((i: EmployeeAttendance) => i.status === tabs.value),
  //   [attendanceData?.items, tabs.value]
  // );

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
      all: attendanceData?.items.length || 10,
      Present:
        attendanceData?.items.filter(
          (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.Present
        ).length || 6,
      Absent:
        attendanceData?.items.filter(
          (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.FullDayLeave
        ).length || 2,
      'Half-Day':
        attendanceData?.items.filter(
          (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.HalfDayLeave
        ).length || 2,
      'Rejected Leave':
        attendanceData?.items.filter(
          (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.RejectedLeave
        ).length || 0,
    }),
    [attendanceData?.items]
  );
  const TABS = useMemo(
    () => [
      {
        value: 'All',
        label: 'All',
        count: counts.all || 0,
        color: 'default',
      },
      {
        value: 'Present',
        label: 'Present',
        count: counts.Present || 0,
        color: 'success',
        // icon: <Iconify icon="oui:check-in-circle-empty" />,
      },
      {
        value: 'Absent',
        label: 'Absent',
        count: counts.Absent || 0,
        color: 'error',
        // icon: <Iconify icon="mdi:cross-circle-outline" />,
      },
      {
        value: 'Half day',
        label: 'Half day',
        count: counts['Half-Day'] || 0,
        color: 'warning',
        // icon: <Iconify icon="radix-icons:half-2" />,
      },
      {
        value: 'Rejected Leave',
        label: 'Rejected Leave',
        count: counts['Rejected Leave'] || 0,
        color: 'error',
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

  const [organization, setOrganization] = useState('');
  const handleChange = (event: any) => {
    setOrganization(event.target.value);
  };

  useEffect(() => {
    if (medium?.educationMediumStages?.[0]) {
      setOrganization(medium?.educationMediumStages?.[0]?.id);
    }
  }, [medium?.educationMediumStages]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {' '}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 1,
          gap: 2,
          borderRadius: '8px',
          bgcolor: 'background.paper',
          boxShadow: 'var(--shadows-3)',
          mt: 1,
        }}
      >
        <FormControl sx={{ maxWidth: '268px', width: '100%' }}>
          <InputLabel id="Roles-select-label" size="small">
            Organization
          </InputLabel>
          <Select
            labelId="Roles-select-label"
            id="Roles-select"
            value={organization || ''}
            name="organization"
            size="small"
            onChange={handleChange}
            label="Organization"
          >
            {medium?.educationMediumStages.length ? (
              medium?.educationMediumStages.map((org: any) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="">
                <em>No Organization Found</em>
              </MenuItem>
            )}
          </Select>
        </FormControl>
        <DatePicker
          disableFuture
          format="DD-MM-YYYY"
          label="Date"
          value={dateValue}
          onChange={(value) => {
            setSearchParams({ date: value?.format('DD-MM-YYYY') });
            // setDate(value);
          }}
          views={['year', 'month', 'day']}
          minDate={dayjs(currentYear?.startDate)}
          maxDate={dayjs(currentYear?.endDate)}
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
                    variant={tab.value === 'All' ? 'filled' : 'soft'}
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
          { id: 'employeeCode', label: 'Employee Code', align: 'left', minWidth: '150px' },
          { id: 'contactNo', label: 'Contact No.', align: 'left', minWidth: '150px' },
          {
            id: 'timeIn',
            label: 'In-Time',
            align: 'left',
            minWidth: '120px',
            render(value, row) {
              return value || `__ __`;
            },
          },
          {
            id: 'timeOut',
            label: 'Out-Time',
            align: 'left',
            minWidth: '120px',
            render(value, row) {
              return value || `__ __`;
            },
          },
          { id: 'totalHoursWorked', label: 'Hours Worked', align: 'left', minWidth: '150px' },
          {
            id: 'remarks',
            label: 'Remarks',
            align: 'left',
            minWidth: '200px',
            render: (value, row) => {
              // Split address into lines and take first two lines
              const addressLines = value.split(', ');
              const displayAddress = addressLines.slice(0, 3).join(', ');
              const hasMoreLines = addressLines.length > 3;

              return (
                <CustomTooltip title={value} arrow sx={{ textAlign: 'justify' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '13px',
                      width: '200px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.2em',
                      maxHeight: '2.4em',
                    }}
                  >
                    {displayAddress}
                    {hasMoreLines && '...'}
                  </Typography>
                </CustomTooltip>
              );
            },
          },
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
            isSort: false,
            isFilter: false,
            minWidth: '100px',
            align: 'left',
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
        data={
          tabs.value === 'All'
            ? datewiseData
            : datewiseData.filter((item) => item.status === tabs.value)
        }
      />
      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}
    </Box>
  );
};

const employeeWiseData = [
  {
    id: 1,
    attendanceDate: '2024-03-01',
    day: 'Friday',
    timeIn: '08:30 AM',
    timeOut: '05:30 PM',
    totalHoursWorked: '09H 00M',
    status: 'Present',
    employeeName: 'Aditya Sharma',
    contactNo: '+91 87654 32109',
    employeeCode: 'EMP101',
  },
  {
    id: 2,
    attendanceDate: '2024-03-02',
    day: 'Saturday',
    timeIn: '09:15 AM',
    timeOut: '06:15 PM',
    totalHoursWorked: '09H 00M',
    status: 'Present',
    employeeName: 'Priya Patel',
    contactNo: '+91 98765 43210',
    employeeCode: 'EMP102',
  },
  {
    id: 3,
    attendanceDate: '2024-03-03',
    day: 'Sunday',
    timeIn: '',
    timeOut: '',
    totalHoursWorked: '__ __',
    status: 'Absent',
    employeeName: 'Rajesh Kumar',
    contactNo: '+91 76543 21098',
    employeeCode: 'EMP103',
    description: 'Medical emergency - Family member hospitalized',
  },
  {
    id: 4,
    attendanceDate: '2024-03-04',
    day: 'Monday',
    timeIn: '08:45 AM',
    timeOut: '02:45 PM',
    totalHoursWorked: '08H 00M',
    status: 'Half day',
    employeeName: 'Sneha Gupta',
    contactNo: '+91 65432 10987',
    employeeCode: 'EMP104',
    description: 'Doctor appointment in afternoon',
  },
  {
    id: 5,
    attendanceDate: '2024-03-05',
    day: 'Tuesday',
    timeIn: '09:00 AM',
    timeOut: '06:00 PM',
    totalHoursWorked: '12H 00M',
    status: 'Present',
    employeeName: 'Vikram Singh',
    contactNo: '+91 54321 09876',
    employeeCode: 'EMP105',
  },
  {
    id: 6,
    attendanceDate: '2024-03-06',
    day: 'Wednesday',
    timeIn: '08:15 AM',
    timeOut: '05:15 PM',
    totalHoursWorked: '09H 00M',
    status: 'Present',
    employeeName: 'Meera Reddy',
    contactNo: '+91 43210 98765',
    employeeCode: 'EMP106',
  },
  {
    id: 7,
    attendanceDate: '2024-03-07',
    day: 'Thursday',
    timeIn: '',
    timeOut: '',
    totalHoursWorked: '__ __',
    status: 'Absent',
    employeeName: 'Arjun Malhotra',
    contactNo: '+91 32109 87654',
    employeeCode: 'EMP107',
    description: 'Personal leave - Family function',
  },
  {
    id: 8,
    attendanceDate: '2024-03-08',
    day: 'Friday',
    timeIn: '09:30 AM',
    timeOut: '06:30 PM',
    totalHoursWorked: '09H 00M',
    status: 'Present',
    employeeName: 'Neha Verma',
    contactNo: '+91 21098 76543',
    employeeCode: 'EMP108',
  },
  {
    id: 9,
    attendanceDate: '2024-03-09',
    day: 'Saturday',
    timeIn: '08:45 AM',
    timeOut: '02:45 PM',
    totalHoursWorked: '06H 00M',
    status: 'Half day',
    employeeName: 'Karan Joshi',
    contactNo: '+91 10987 65432',
    employeeCode: 'EMP109',
    description: 'Left early due to personal emergency',
  },
  {
    id: 10,
    attendanceDate: '2024-03-10',
    day: 'Sunday',
    timeIn: '09:00 AM',
    timeOut: '06:00 PM',
    totalHoursWorked: '09H 00M',
    status: 'Present',
    employeeName: 'Anita Desai',
    contactNo: '+91 09876 54321',
    employeeCode: 'EMP110',
  },
];

const EmployeeWise = ({
  searchParams,
  setSearchParams,
}: {
  searchParams: Record<string, string>;
  setSearchParams: (obj: Record<string, any>) => void;
}) => {
  const { currentMedium: medium, currentYear } = useSelector(
    (state: RootState) => state.globalState
  );
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

  const tabs = useTabs('All');

  // const [employeeId, setEmployeeId] = useState<string>('');
  const { data: employees, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });

  const [getAttendance, { data, isLoading: attendanceLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetAttendanceByEmployeeIdQuery,
  });

  useMemo(
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
      'Rejected Leave':
        data?.items?.filter(
          (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.RejectedLeave
        ).length || 4,
    }),
    [data?.items]
  );

  useEffect(() => {
    if (searchParams?.employeeId && startDate) {
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

  useState(
    data?.[0]?.employeeAttendances?.items?.map((i: any) => ({
      ...i,
      status: EmployeeLeaveStatusType[i.statusType],
    })) || []
  );

  const TABS = useMemo(
    () => [
      {
        value: 'All',
        label: 'All',
        count: data?.[0]?.presentDays || 10,
        color: 'default',
      },
      {
        value: 'Present',
        label: 'Present',
        count: data?.[0]?.presentDays || 6,
        icon: 'fluent:person-available-16-regular',
        color: 'success',
      },
      {
        value: 'Absent',
        label: 'Absent',
        count: data?.[0]?.leaveDays || 2,
        icon: 'fluent-mdl2:leave-user',
        color: 'error',
      },
      {
        value: 'Half day',
        label: 'Half day',
        count: data?.[0]?.halfDayLeaves || 2,
        icon: 'mdi:fraction-one-half',
        color: 'warning',
      },
      {
        value: 'RejectedLeave',
        label: 'Rejected Leave',
        count: data?.[0]?.rejectedLeaves || 0,
        icon: GlobalIcons.reject,
        color: 'error',
      },
    ],
    [data]
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
    setSelectedStudents([]);
  };
  const employeeValue = useMemo(
    () => employees?.items?.find((i: any) => i.id === searchParams.employeeId) || null,
    [employees?.items, searchParams.employeeId]
  );
  const [organization, setOrganization] = useState('');
  const handleChange = (event: any) => {
    setOrganization(event.target.value);
  };

  useEffect(() => {
    if (medium?.educationMediumStages?.[0]) {
      setOrganization(medium?.educationMediumStages?.[0]?.id);
    }
  }, [medium?.educationMediumStages]);
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
          flexWrap: 'wrap',
        }}
      >
        <FormControl sx={{ maxWidth: '268px', width: '100%' }}>
          <InputLabel id="Roles-select-label" size="small">
            Organization
          </InputLabel>
          <Select
            labelId="Roles-select-label"
            id="Roles-select"
            value={organization || ''}
            name="organization"
            size="small"
            onChange={handleChange}
            label="Organization"
          >
            {medium?.educationMediumStages.length ? (
              medium?.educationMediumStages.map((org: any) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="">
                <em>No Organization Found</em>
              </MenuItem>
            )}
          </Select>
        </FormControl>
        <CustomTooltip
          placement="top"
          title={
            employeeValue
              ? `${employeeValue.firstName || ''} ${employeeValue.middleName || ''} ${employeeValue.lastName || ''} (${employeeValue.employeeCode || ''})`
              : undefined
          }
        >
          {isLoading ? (
            <Box sx={{ width: '100%', maxWidth: 268 }}>
              <Skeleton height={40} width="100%" />
            </Box>
          ) : (
            <Autocomplete
              options={employees?.items || []}
              getOptionLabel={(option: any) =>
                `${option.firstName || ''} ${option.middleName || ''} ${option.lastName || ''} (${option.employeeCode || ''})`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employee"
                  size="small"
                  fullWidth
                  sx={{ width: '100%', minWidth: 268 }}
                  disabled={!organization}
                />
              )}
              value={employeeValue}
              onChange={(e, value) => {
                setSearchParams({ employeeId: value?.id as string });
                // formik.setFieldValue('examType', value?.id);
              }}
            />
          )}
        </CustomTooltip>

        <DatePicker
          disableFuture
          format="DD-MM-YYYY"
          label="Start Date"
          value={startDate}
          onChange={(value) => {
            setSearchParams({ startDate: value?.format('DD-MM-YYYY') });
            // setDate(value);
          }}
          views={['year', 'month', 'day']}
          minDate={dayjs(currentYear?.startDate)}
          maxDate={dayjs(currentYear?.endDate)}
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
          disableFuture
          value={endDate}
          onChange={(value) => {
            setSearchParams({ endDate: value?.format('DD-MM-YYYY') });
            // setDate(value);
          }}
          views={['year', 'month', 'day']}
          minDate={dayjs(currentYear?.startDate)}
          maxDate={dayjs(currentYear?.endDate)}
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
                    variant={tab.value === 'All' ? 'filled' : 'soft'}
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
              id: 'day',
              label: 'Day',
              minWidth: '6vw',
              align: 'left',
            },
            {
              id: 'timeIn',
              align: 'left',
              label: 'In-time',
              minWidth: '6vw',
              render(value, row) {
                return value || `__ __`;
              },
            },
            {
              id: 'timeOut',
              align: 'left',
              label: 'Out-time',
              minWidth: '8vw',
              render(value, row) {
                return value || `__ __`;
              },
            },
            { id: 'totalHoursWorked', align: 'left', label: 'Hours Worked', minWidth: '10vw' },
            { id: 'description', label: 'Description' },
            {
              id: 'status',
              label: 'Status',
              align: 'left',
              minWidth: '100px',
              sticky: true,
              isFilter: false,
              render(value, row) {
                return (
                  <Label
                    color={
                      value === 'Present' ? 'success' : value === 'Absent' ? 'error' : 'warning'
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
          data={
            tabs.value === 'All'
              ? employeeWiseData
              : employeeWiseData.filter((item) => item.status === tabs.value)
          }
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

'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { EmployeeAttendance } from 'src/types/employee';
import type { IColumn } from 'src/components/customizabaleTable/types';

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
import { useGetEmployeeQuery } from 'src/redux/employee/employeeApi';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmployeeLeaveStatusType } from 'src/enums/employee-leave-status';
import { EmployeeAttendanceStatus } from 'src/enums/employee-attendance-status';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import {
  useGetDateWiseAttendanceQuery,
  useGetEmployeeWiseAttendanceQuery,
} from 'src/redux/attendanceTracking/attendanceTrackingApi';
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
        sx={{ px: 2, mb: 1 }}
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
              sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 }, borderRadius: 2 }}
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
  const tabs = useTabs('Present');
  const {
    data: attendanceData,
    isLoading,
    refetch: getDateWiseAttendance,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDateWiseAttendanceQuery,
    params: {
      attendanceDate: dateValue?.format('DD-MM-YYYY'),
      status: tabs.value,
      page: 1,
      pageSize: 10,
    },
    options: {
      skip: !dateValue,
    },
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
      getDateWiseAttendance(dateTimeOffset);
    } else {
      getDateWiseAttendance(dateConvertor(dayjs().format(dateFormat), true));
    }
  }, [getDateWiseAttendance, searchParams.date]);

  useEffect(
    () => () => {
      setSearchParams({ date: '' });
    },
    [setSearchParams]
  );

  const counts = useMemo(
    () => ({
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
        value: 'Half-Day',
        label: 'Half Day',
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
  const columns: IColumn[] = useMemo(
    () => [
      { id: 'fullName', label: 'Name', minWidth: '10vw', align: 'left', sticky: true },
      { id: 'employeeIdentifier', label: 'Employee Code', align: 'left', minWidth: '150px' },
      { id: 'contactNo', label: 'Contact No.', align: 'left', minWidth: '150px' },
      {
        id: 'inTime',
        label: 'In-Time',
        align: 'left',
        minWidth: '120px',
        render(value, row) {
          return value || `__ __`;
        },
      },
      {
        id: 'outTime',
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
    ],
    []
  );
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
                  <Label variant="soft" color={(tab?.color as LabelColor) || 'default'}>
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
        columns={columns}
        data={attendanceData?.items?.filter((item: any) => item.status === tabs.value) || []}
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

  const tabs = useTabs('Present');

  const { data: employees, isLoading: employeeLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });

  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    refetch: getEmployeeWiseAttendance,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeWiseAttendanceQuery,
    params: {
      employeeId: searchParams.employeeId,
      startDate: startDate.format('DD-MM-YYYY'),
      endDate: endDate.format('DD-MM-YYYY'),
      status: tabs.value,
      page: 1,
      pageSize: 10,
    },
    options: {
      skip: !searchParams.employeeId,
    },
  });

  useMemo(
    () => ({
      Present:
        attendanceData?.items?.filter(
          (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.Present
        ).length || 10,
      Absent:
        attendanceData?.items?.filter(
          (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.FullDayLeave
        ).length || 8,
      'Half-Day':
        attendanceData?.items?.filter(
          (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.HalfDayLeave
        ).length || 6,
      'Rejected Leave':
        attendanceData?.items?.filter(
          (i: EmployeeAttendance) => i.status === EmployeeAttendanceStatus.RejectedLeave
        ).length || 4,
    }),
    [attendanceData?.items]
  );

  useEffect(() => {
    if (searchParams?.employeeId && startDate) {
      getEmployeeWiseAttendance({
        employeeId: `${searchParams.employeeId}`,
        startDate: startDate.format('DD-MM-YYYY'),
        endDate: endDate.format('DD-MM-YYYY'),
        status: tabs.value,
        page: 1,
        pageSize: 10,
      });
    }
  }, [searchParams.employeeId, getEmployeeWiseAttendance, startDate, endDate, tabs.value]);

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
    attendanceData?.items?.map((i: any) => ({
      ...i,
      status: EmployeeLeaveStatusType[i.statusType],
    })) || []
  );

  const TABS = useMemo(
    () => [
      {
        value: 'Present',
        label: 'Present',
        count: attendanceData?.[0]?.presentDays || 6,
        icon: 'fluent:person-available-16-regular',
        color: 'success',
      },
      {
        value: 'Absent',
        label: 'Absent',
        count: attendanceData?.[0]?.leaveDays || 2,
        icon: 'fluent-mdl2:leave-user',
        color: 'error',
      },
      {
        value: 'Half day',
        label: 'Half day',
        count: attendanceData?.[0]?.halfDayLeaves || 2,
        icon: 'mdi:fraction-one-half',
        color: 'warning',
      },
      {
        value: 'RejectedLeave',
        label: 'Rejected Leave',
        count: attendanceData?.[0]?.rejectedLeaves || 0,
        icon: GlobalIcons.reject,
        color: 'error',
      },
    ],
    [attendanceData]
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
    setSelectedStudents([]);
  };
  const employeeValue = useMemo(
    () =>
      employees?.items?.find(
        (i: any) => i.employeeIdentifier === searchParams.employeeIdentifier
      ) || null,
    [employees?.items, searchParams.employeeIdentifier]
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

  const columns: IColumn[] = useMemo(
    () => [
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
              color={value === 'Present' ? 'success' : value === 'Absent' ? 'error' : 'warning'}
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
    ],
    []
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
              ? `${employeeValue.fullName || ''} (${employeeValue.employeeIdentifier || ''})`
              : undefined
          }
        >
          {employeeLoading ? (
            <Box sx={{ width: '100%', maxWidth: 268 }}>
              <Skeleton height={40} width="100%" />
            </Box>
          ) : (
            <Autocomplete
              options={employees?.items || []}
              getOptionLabel={(option: any) =>
                `${option.fullName || ''} (${option.employeeIdentifier || ''})`
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
                if (value) {
                  setSearchParams({
                    employeeId: value?.id as string,
                    employeeIdentifier: value?.employeeIdentifier as string,
                  });
                } else {
                  // Clear employee selection
                  setSearchParams({
                    employeeId: '',
                    employeeIdentifier: '',
                  });
                }
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
                  <Label variant="soft" color={(tab?.color as LabelColor) || 'default'}>
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
          columns={columns}
          data={attendanceData?.items?.filter((item: any) => item.status === tabs.value) || []}
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

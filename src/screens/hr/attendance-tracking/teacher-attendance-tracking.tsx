import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { useMemo, useEffect } from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Card, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { useLazyGetAttendanceByEmployeeIdQuery } from 'src/redux/employee/employeeApi';
import {
  EmployeeAttendanceStatus,
  EmployeeAttendanceStatusColor,
} from 'src/enums/employee-attendance-status';

const TeacherAttendanceTracking = ({
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
      <DatePicker
        format="DD-MM-YYYY"
        label="Start Date"
        value={startDate}
        onChange={(value) => {
          setSearchParams({ startDate: value?.format('DD-MM-YYYY') });
          // setDate(value);
        }}
        sx={{ mb: 2 }}
        slotProps={{ textField: { size: 'small' } }}
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
        slotProps={{ textField: { size: 'small' } }}
      />
      <Box display="flex" gap={2}>
        <Card
          sx={{
            maxWidth: 280,
            width: '100%',
            backgroundColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
            color: (theme) => theme.vars.palette.primary.main,
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
            backgroundColor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.1),
            color: (theme) => theme.vars.palette.error.main,
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
            backgroundColor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.1),
            color: (theme) => theme.vars.palette.warning.main,
          }}
        >
          <Typography variant="subtitle1">Half Day Leave</Typography>

          <Typography variant="h3">{data?.[0]?.halfDayLeaves || 0}</Typography>
        </Card>
      </Box>
      <CustomizableTable
        noDataText={<>No Data Availabel For Attendance </>}
        tableId="teacher-attendance-tracking"
        isLoading={attendanceLoading}
        columns={[
          {
            id: 'attendanceDate',
            label: 'Date',
            filterType: 'date',
            render(value, row) {
              return dayjs(value, 'YYYY-MM-DD').format('DD-MM-YYYY');
            },
          },

          { id: 'timeIn', label: 'In-Time' },
          { id: 'timeOut', label: 'Out-Time' },
          { id: 'employeeCode', label: 'Employee Code' },
          { id: 'contacrNo.', label: 'Contact No.' },
          { id: 'totalHoursWorked', label: 'Hours Worked' },
          {
            id: 'status',
            label: 'Status',
            render(value: number, row) {
              const statusKey = value as unknown as keyof typeof EmployeeAttendanceStatus;
              const colorKey = value as keyof typeof EmployeeAttendanceStatusColor;

              return (
                <Label variant="soft" color={EmployeeAttendanceStatusColor[colorKey] as LabelColor}>
                  {EmployeeAttendanceStatus[statusKey]}
                </Label>
              );
            },
          },
        ]}
        data={
          data?.[0]?.employeeAttendances?.items?.map((i: any) => ({
            ...i,
            status: EmployeeAttendanceStatus[i.statusType as keyof typeof EmployeeAttendanceStatus],
          })) || []
        }
      />
    </>
  );
};

export default TeacherAttendanceTracking;

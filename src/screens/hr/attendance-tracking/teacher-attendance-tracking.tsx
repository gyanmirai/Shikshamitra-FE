import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Card, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  mapEmployeeWiseAttendanceRow,
  useGetEmployeeWiseAttendanceQuery,
} from 'src/redux/attendanceTracking/attendanceTrackingApi';

import { getAttendanceTrackingStatusLabel } from './status-mapper';

const TeacherAttendanceTracking = ({
  searchParams,
  setSearchParams,
}: {
  searchParams: Record<string, string>;
  setSearchParams: (key: string, value: string) => void;
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
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
  const { data, isLoading: attendanceLoading } = useGetEmployeeWiseAttendanceQuery(
    {
      employeeId: `${searchParams.employeeId}`,
      startDate: startDate.format('DD/MM/YYYY'),
      endDate: endDate.format('DD/MM/YYYY'),
      academicYearId: currentYear?.id,
    },
    { skip: !searchParams?.employeeId }
  );

  const attendanceItems = data?.items || [];
  const summary = data?.attendanceSummary || {};

  return (
    <>
      <DatePicker
        format="DD-MM-YYYY"
        label="Start Date"
        value={startDate}
        onChange={(value) => {
          setSearchParams('startDate', value?.format('DD-MM-YYYY') || '');
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
          setSearchParams('endDate', value?.format('DD-MM-YYYY') || '');
          // setDate(value);
        }}
        sx={{ mb: 2 }}
        slotProps={{ textField: { size: 'small' } }}
      />
      <Box display="flex" gap={1}>
        <Card
          sx={{
            maxWidth: 280,
            width: '100%',
            backgroundColor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
            color: (theme) => theme.palette.primary.main,
            p: 2,
          }}
        >
          <Typography variant="subtitle1">Total Present Days</Typography>

          <Typography variant="h3">{summary.present || 0}</Typography>
        </Card>
        <Card
          sx={{
            maxWidth: 280,
            p: 2,
            width: '100%',
            backgroundColor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.1),
            color: (theme) => theme.palette.error.main,
          }}
        >
          <Typography variant="subtitle1">Full Day Leave</Typography>

          <Typography variant="h3">{summary.absent || 0}</Typography>
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

          <Typography variant="h3">{summary.halfDay || 0}</Typography>
        </Card>
      </Box>
      <CustomizableTable
        noDataText={<>No Data Available For Attendance </>}
        tableId="teacher-attendance-tracking"
        isLoading={attendanceLoading}
        columns={[
          {
            id: 'date',
            label: 'Date',
            filterType: 'date',
            render(value, row) {
              return value ? dayjs(value).format('DD-MM-YYYY') : '-';
            },
          },

          { id: 'inTime', label: 'In-Time' },
          { id: 'outTime', label: 'Out-Time' },
          { id: 'hoursWorked', label: 'Hours Worked' },
          {
            id: 'status',
            label: 'Status',
            render(value: number | string, row) {
              const statusLabel = getAttendanceTrackingStatusLabel(Number(value));
              const color =
                statusLabel === 'Present'
                  ? 'success'
                  : statusLabel === 'Absent'
                    ? 'error'
                    : statusLabel === 'Half Day'
                      ? 'info'
                      : 'warning';

              return (
                <Label variant="soft" color={color as LabelColor}>
                  {statusLabel}
                </Label>
              );
            },
          },
        ]}
        data={attendanceItems?.map(mapEmployeeWiseAttendanceRow) || []}
      />
    </>
  );
};

export default TeacherAttendanceTracking;

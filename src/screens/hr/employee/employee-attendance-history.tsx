import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Card, Stack, Typography } from '@mui/material';
import { durationHours } from 'src/screens/hr/utils/table-values';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  mapEmployeeWiseAttendanceRow,
  useGetEmployeeWiseAttendanceQuery,
} from 'src/redux/attendanceTracking/attendanceTrackingApi';

import {
  ATTENDANCE_TRACKING_STATUS,
  getAttendanceTrackingStatusLabel,
} from '../attendance-tracking/status-mapper';

type EmployeeAttendanceHistoryProps = {
  employeeId?: string;
};

const getStatusColor = (status: number | string): LabelColor => {
  const statusLabel = getAttendanceTrackingStatusLabel(Number(status));

  if (statusLabel === 'Present') return 'success';
  if (statusLabel === 'Absent') return 'error';
  if (statusLabel === 'Half Day') return 'info';
  if (statusLabel === 'Rejected Leave') return 'warning';

  return 'default';
};

const summaryCards = [
  {
    key: 'present',
    label: 'Present',
    color: 'success',
  },
  {
    key: 'absent',
    label: 'Full Day Leave/Absent',
    color: 'error',
  },
  {
    key: 'halfDay',
    label: 'Half Day',
    color: 'warning',
  },
  {
    key: 'rejectedLeave',
    label: 'Rejected Leave',
    color: 'info',
  },
] as const;

const EmployeeAttendanceHistory = ({ employeeId }: EmployeeAttendanceHistoryProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().endOf('month'));

  const {
    currentData: data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetEmployeeWiseAttendanceQuery(
    {
      employeeId: employeeId || '',
      startDate: startDate?.format('DD/MM/YYYY') || '',
      endDate: endDate?.format('DD/MM/YYYY') || '',
      academicYearId: currentYear?.id,
    },
    {
      skip: !employeeId || !startDate || !endDate,
    }
  );

  const attendanceItems = data?.items || [];
  const summary = data?.attendanceSummary || {};

  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'date',
        label: 'Date',
        filterType: 'date',
        render(value) {
          return value ? dayjs(value).format('DD-MM-YYYY') : '-';
        },
      },
      { id: 'day', label: 'Day' },
      { id: 'inTime', label: 'In-Time' },
      { id: 'outTime', label: 'Out-Time' },
      {
        id: 'hoursWorked',
        label: 'Hours Worked',
        filterType: 'number',
        filterValue: (value) => durationHours(value),
        sortValue: (value) => durationHours(value),
      },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum',
        enumOptions: Object.values(ATTENDANCE_TRACKING_STATUS).map((value) => ({
          value,
          label: getAttendanceTrackingStatusLabel(value),
        })),
        render(value: number | string) {
          return (
            <Label variant="soft" color={getStatusColor(value)}>
              {getAttendanceTrackingStatusLabel(Number(value))}
            </Label>
          );
        },
      },
      { id: 'description', label: 'Description' },
    ],
    []
  );

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <DatePicker
          format="DD-MM-YYYY"
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          format="DD-MM-YYYY"
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          slotProps={{ textField: { size: 'small' } }}
        />
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {summaryCards.map((card) => (
          <Card
            key={card.key}
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: (theme) => varAlpha(theme.vars.palette[card.color].mainChannel, 0.1),
              color: (theme) => theme.vars.palette[card.color].main,
            }}
          >
            <Typography variant="subtitle2">{card.label}</Typography>
            <Typography variant="h4">{summary?.[card.key] || 0}</Typography>
          </Card>
        ))}
      </Box>

      <CustomizableTable
        variant="embedded"
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        tableId="employee-attendance-history"
        tableTitle="Staff attendance history"
        exportContext={[
          `Period: ${startDate?.format('DD MMM YYYY')} to ${endDate?.format('DD MMM YYYY')}`,
        ]}
        noDataText={<>No attendance history found.</>}
        isLoading={isLoading || (isFetching && !data)}
        isRefreshing={isFetching && Boolean(data)}
        error={error}
        onRetry={refetch}
        columns={columns}
        data={attendanceItems.map((row: any) => ({
          ...mapEmployeeWiseAttendanceRow(row),
          day: row?.day,
        }))}
      />
    </Stack>
  );
};

export default EmployeeAttendanceHistory;

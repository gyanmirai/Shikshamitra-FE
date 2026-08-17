'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import React, { useMemo, useState, useEffect } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { Stack, Typography, IconButton } from '@mui/material';

import { readOptionalText } from '../types';

import type { Academic360Attendance, Academic360Record } from '../types';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type AttendanceMonthlyListProps = {
  attendance?: Academic360Attendance;
  isLoading?: boolean;
};

type DayStatus = 'Present' | 'Absent' | 'Leave' | 'Half Day' | 'Holiday' | 'Weekend' | 'Upcoming' | 'No Record';

const STATUS_COLOR_MAP: Record<DayStatus, LabelColor> = {
  Present: 'success',
  Absent: 'error',
  Leave: 'warning',
  'Half Day': 'warning',
  Holiday: 'info',
  Weekend: 'default',
  Upcoming: 'default',
  'No Record': 'default',
};

const STATUS_OPTIONS = [
  { label: 'Present', value: 'Present' },
  { label: 'Absent', value: 'Absent' },
  { label: 'Leave', value: 'Leave' },
  { label: 'Half Day', value: 'Half Day' },
  { label: 'Holiday', value: 'Holiday' },
  { label: 'Weekend', value: 'Weekend' },
  { label: 'Upcoming', value: 'Upcoming' },
  { label: 'No Record', value: 'No Record' },
];

export function AttendanceMonthlyList({ attendance, isLoading = false }: AttendanceMonthlyListProps) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const minDate = useMemo(
    () => (currentYear?.startDate ? dayjs(currentYear.startDate) : null),
    [currentYear?.startDate]
  );
  const maxDate = useMemo(
    () => (currentYear?.endDate ? dayjs(currentYear.endDate) : null),
    [currentYear?.endDate]
  );

  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(() => {
    const today = dayjs();
    if (minDate && today.isBefore(minDate, 'month')) return minDate.startOf('month');
    if (maxDate && today.isAfter(maxDate, 'month')) return maxDate.startOf('month');
    return today.startOf('month');
  });

  useEffect(() => {
    if (currentYear?.startDate && currentYear?.endDate) {
      const today = dayjs();
      const start = dayjs(currentYear.startDate);
      const end = dayjs(currentYear.endDate);
      if (today.isBefore(start, 'month')) {
        setSelectedMonth(start.startOf('month'));
      } else if (today.isAfter(end, 'month')) {
        setSelectedMonth(end.startOf('month'));
      } else {
        setSelectedMonth(today.startOf('month'));
      }
    }
  }, [currentYear]);

  const canGoPrev = useMemo(() => {
    if (!minDate) return true;
    return selectedMonth.subtract(1, 'month').isSameOrAfter(minDate, 'month');
  }, [minDate, selectedMonth]);

  const canGoNext = useMemo(() => {
    if (!maxDate) return true;
    return selectedMonth.add(1, 'month').isSameOrBefore(maxDate, 'month');
  }, [maxDate, selectedMonth]);

  const records = attendance?.recentHistory || [];

  // Generate complete day-wise rows for the selected month
  const tableData = useMemo(() => {
    const recordMap = new Map<string, Academic360Record>();
    records.forEach((rec) => {
      const dateStr = readOptionalText(rec.date ?? rec.attendanceDate ?? rec.creationTime);
      const parsed = dayjs(dateStr);
      if (parsed.isValid()) {
        recordMap.set(parsed.format('YYYY-MM-DD'), rec);
      }
    });

    const daysInMonth = selectedMonth.daysInMonth();
    const rows = [];
    const today = dayjs();

    for (let d = 1; d <= daysInMonth; d += 1) {
      const dateObj = selectedMonth.date(d);
      const dateStr = dateObj.format('YYYY-MM-DD');
      const rec = recordMap.get(dateStr);
      const dayOfWeek = dateObj.format('dddd');
      const isSunday = dateObj.day() === 0;
      const isFuture = dateObj.isAfter(today, 'day');

      let status: DayStatus = 'No Record';
      let remarks = '-';

      if (rec) {
        const rawStatus = readOptionalText(rec.status ?? rec.attendanceStatus ?? rec.attendance).toLowerCase();
        const isPresent = rec.isPresent === true || rawStatus === 'present' || rawStatus === 'p';
        remarks = readOptionalText(rec.remarks) || '-';

        if (isPresent) {
          status = 'Present';
        } else if (rawStatus.includes('leave') || rawStatus === 'l') {
          status = 'Leave';
        } else if (rawStatus.includes('half')) {
          status = 'Half Day';
        } else if (rawStatus.includes('holiday') || rawStatus === 'h') {
          status = 'Holiday';
        } else if (rawStatus.includes('absent') || rawStatus === 'a') {
          status = 'Absent';
        } else {
          status = 'Absent';
        }
      } else if (isSunday) {
        status = 'Weekend';
        remarks = 'Weekly Off';
      } else if (isFuture) {
        status = 'Upcoming';
        remarks = '-';
      }

      rows.push({
        id: dateStr,
        date: dateObj.format('YYYY-MM-DD'),
        displayDate: dateObj.format('DD MMM YYYY'),
        day: dayOfWeek,
        status,
        statusColor: STATUS_COLOR_MAP[status],
        remarks,
        isFuture,
        isSunday,
      });
    }

    return rows;
  }, [records, selectedMonth]);

  // Calculate monthly stats
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let totalWorking = 0;

    tableData.forEach((row) => {
      if (row.status === 'Present') {
        present += 1;
        totalWorking += 1;
      } else if (row.status === 'Absent') {
        absent += 1;
        totalWorking += 1;
      } else if (row.status === 'Leave' || row.status === 'Half Day') {
        leave += 1;
        totalWorking += 1;
      }
    });

    const percent = totalWorking > 0 ? Math.round((present / totalWorking) * 100) : 0;
    return { present, absent, leave, totalWorking, percent };
  }, [tableData]);

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'date',
        label: 'Date',
        sticky: true,
        minWidth: 140,
        render: (_val, row: any) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.displayDate}
          </Typography>
        ),
      },
      {
        id: 'day',
        label: 'Day',
        minWidth: 120,
        render: (val: any, row: any) => (
          <Typography
            variant="body2"
            color={row.isSunday ? 'error.main' : 'text.primary'}
            sx={{ fontWeight: row.isSunday ? 600 : 400 }}
          >
            {val}
          </Typography>
        ),
      },
      {
        id: 'remarks',
        label: 'Remarks',
        minWidth: 200,
        render: (val: any) => (
          <Typography variant="body2" color="text.secondary">
            {val || '-'}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        sticky: true,
        stickyPosition: 'right',
        minWidth: 120,
        filterType: 'enum',
        enumOptions: STATUS_OPTIONS,
        render: (_val: any, row: any) => (
          <Label color={row.statusColor} variant="soft">
            {row.status}
          </Label>
        ),
      },
    ],
    []
  );

  return (
    <Stack spacing={1.5}>
      {/* Month Selector Bar & Summary Status Badges outside the card */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={1.5}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          <DatePicker
            label="Month-Year"
            format="MMM-YYYY"
            value={selectedMonth}
            minDate={minDate ?? undefined}
            maxDate={maxDate ?? undefined}
            views={['year', 'month']}
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: 170 },
              },
            }}
            onChange={(newMonth) => {
              if (newMonth) setSelectedMonth(newMonth.startOf('month'));
            }}
          />

          <IconButton
            size="small"
            disabled={!canGoPrev}
            onClick={() => setSelectedMonth((m) => m.subtract(1, 'month'))}
          >
            <Iconify icon="mdi:chevron-left" width={20} />
          </IconButton>

          <IconButton
            size="small"
            disabled={!canGoNext}
            onClick={() => setSelectedMonth((m) => m.add(1, 'month'))}
          >
            <Iconify icon="mdi:chevron-right" width={20} />
          </IconButton>
        </Stack>

        {/* Quick summary status badges using Label components */}
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Label color="success" variant="soft">
            Present: {stats.present}
          </Label>
          <Label color="error" variant="soft">
            Absent: {stats.absent}
          </Label>
          <Label color="warning" variant="soft">
            Leave: {stats.leave}
          </Label>
          <Label
            color={stats.percent >= 75 ? 'success' : stats.percent >= 50 ? 'warning' : 'error'}
            variant="filled"
          >
            Rate: {stats.percent}%
          </Label>
        </Stack>
      </Stack>

      {/* Monthly Table rendered directly */}
      <CustomizableTable
        tableId="student-academic-360-attendance-monthly-table"
        data={tableData}
        columns={columns}
        isLoading={isLoading}
        noDataText="No attendance records for this month."
        isShowedDense
        defaultRowsPerPage={35}
      />
    </Stack>
  );
}

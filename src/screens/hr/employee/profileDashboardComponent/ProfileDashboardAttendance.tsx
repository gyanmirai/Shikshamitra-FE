import type { PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import type {
  EmployeeDashboardData,
  EmployeeDashboardHoliday,
  EmployeeDashboardAttendanceDay,
} from 'src/redux/hr/employeeApi';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { PickersDay, DateCalendar } from '@mui/x-date-pickers';
import { Box, Paper, Tooltip, Typography, useMediaQuery } from '@mui/material';

import {
  formatDashboardDate,
  getEmployeeCalendarStart,
  employeeDashboardStatusCopy,
  findEmployeeDashboardHoliday,
  buildEmployeeAttendanceDayLookup,
} from '../employee-dashboard-utils';

type AttendanceDayProps = PickersDayProps & {
  attendanceByDate?: Map<string, EmployeeDashboardAttendanceDay>;
  holidays?: EmployeeDashboardHoliday[];
};

function AttendanceDay({ attendanceByDate, holidays = [], ...props }: AttendanceDayProps) {
  const key = props.day.format('YYYY-MM-DD');
  const attendance = attendanceByDate?.get(key);
  const holiday = findEmployeeDashboardHoliday(holidays, key);
  const status = attendance ? employeeDashboardStatusCopy[attendance.status] : null;
  const detail = attendance
    ? `${status?.label}${attendance.remarks ? `: ${attendance.remarks}` : ''}`
    : holiday
      ? `Holiday: ${holiday.name}`
      : props.disabled
        ? 'Not available'
        : 'Not marked';
  const label = `${formatDashboardDate(key, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}: ${detail}`;
  const color =
    status?.color.replace('.main', '.darker') ?? (holiday ? 'text.secondary' : 'text.primary');
  const background = status?.background ?? (holiday ? 'background.neutral' : 'transparent');

  return (
    <Tooltip title={detail} arrow describeChild>
      <PickersDay
        {...props}
        aria-label={label}
        sx={{
          borderRadius: 1,
          color,
          bgcolor: background,
          fontWeight: 500,
          '&.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus': {
            color,
            bgcolor: background,
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: -2,
          },
          '&.Mui-focusVisible': {
            outline: '2px solid',
            outlineColor: 'text.primary',
            outlineOffset: -2,
          },
        }}
      />
    </Tooltip>
  );
}

const legend = [
  ['Present', 'success.main'],
  ['Half day', 'warning.main'],
  ['Absent', 'error.main'],
  ['Half-day leave', 'secondary.main'],
  ['Full-day leave', 'info.main'],
  ['Holiday', 'text.disabled'],
];

const ProfileDashboardAttendance = ({ data }: { data: EmployeeDashboardData }) => {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const attendanceByDate = useMemo(
    () => buildEmployeeAttendanceDayLookup(data.attendanceDays),
    [data.attendanceDays]
  );

  return (
    <Paper
      component="section"
      aria-label="Attendance calendar"
      variant="outlined"
      sx={{ minWidth: 0, borderRadius: 2, p: 2 }}
    >
      <Typography variant="subtitle2" component="h3">
        Attendance calendar
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        {data.academicYearName || 'No academic year available'}
      </Typography>
      <DateCalendar
        key={`${data.employeeId}-${data.date}`}
        value={dayjs(data.date)}
        readOnly
        reduceAnimations={reduceMotion}
        minDate={dayjs(getEmployeeCalendarStart(data))}
        maxDate={dayjs(data.date)}
        showDaysOutsideCurrentMonth
        sx={{
          width: '100%',
          maxWidth: 400,
          m: '0 auto',
          '& .MuiPickersCalendarHeader-root': { mx: 0, pl: 0, pr: 0 },
          '& .MuiPickersCalendarHeader-label': { typography: 'body2', fontWeight: 600 },
          '& .MuiDayCalendar-header, & .MuiDayCalendar-weekContainer': {
            justifyContent: 'space-around',
          },
          '& .MuiDayCalendar-weekDayLabel': { fontSize: '0.75rem', fontWeight: 500 },
          '& .MuiPickersArrowSwitcher-button': { width: 44, height: 44, p: 1 },
          '& .MuiDayCalendar-slideTransition': { minHeight: 240 },
          '& .MuiPickersDay-root': { width: { xs: 32, sm: 36 }, mx: 0 },
        }}
        slots={{ day: AttendanceDay }}
        slotProps={{
          day: { attendanceByDate, holidays: data.holidays } as Partial<AttendanceDayProps>,
        }}
      />
      <Box
        component="ul"
        aria-label="Attendance status legend"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          columnGap: 1.5,
          rowGap: 0.75,
          listStyle: 'none',
          m: 0,
          pt: 1.5,
          px: 0,
          pb: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {legend.map(([label, color]) => (
          <Box component="li" key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              aria-hidden="true"
              sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }}
            />
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default ProfileDashboardAttendance;

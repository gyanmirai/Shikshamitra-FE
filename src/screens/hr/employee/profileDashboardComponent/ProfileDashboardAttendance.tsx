import type { Dayjs } from 'dayjs';
import type { EmployeeDashboardData } from 'src/redux/hr/employeeApi';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { PickersDay, DateCalendar } from '@mui/x-date-pickers';

import {
  employeeDashboardStatusCopy,
  findEmployeeDashboardHoliday,
  buildEmployeeAttendanceDayLookup,
} from '../employee-dashboard-utils';

const ProfileDashboardAttendance = ({ data }: { data: EmployeeDashboardData }) => {
  const date = dayjs(data.date) as Dayjs;
  const attendanceByDate = useMemo(
    () => buildEmployeeAttendanceDayLookup(data.attendanceDays),
    [data.attendanceDays]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        flexGrow: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        p: 2,
      }}
    >
      <Box sx={{ pb: 0 }}>
        <Typography variant="h6">Attendance Calendar</Typography>
      </Box>

      <DateCalendar
        value={date}
        readOnly
        disableFuture
        showDaysOutsideCurrentMonth
        sx={{
          width: '100%',
          flexGrow: 2,
          maxHeight: '100%',
          height: '100%',
          justifyContent: 'center',
          '& .MuiDayCalendar-header': {
            justifyContent: 'space-around',
            '& .MuiDayCalendar-weekDayLabel': {
              fontWeight: 600,
              color: 'text.primary',
            },
          },
          '& .MuiDayCalendar-weekContainer': { justifyContent: 'space-around' },
        }}
        slots={{
          day: (prop: any) => {
            const { day } = prop;
            const key = day.format('YYYY-MM-DD');
            const attendance = attendanceByDate.get(key);
            const holiday = findEmployeeDashboardHoliday(data.holidays, key);
            const status = attendance ? employeeDashboardStatusCopy[attendance.status] : null;
            const toolTipTitle = attendance
              ? `${status?.label}${attendance.remarks ? `: ${attendance.remarks}` : ''}`
              : holiday
                ? `Holiday: ${holiday.name}`
                : '';

            return (
              <CustomTooltip title={toolTipTitle} arrow placement="top">
                <Box>
                  <PickersDay
                    {...prop}
                    day={day}
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      overflow: 'hidden',
                      fontWeight: 500,
                      borderRadius: 1.5,
                      bgcolor: holiday ? 'background.neutral' : undefined,
                      color: holiday ? 'text.secondary' : 'text.primary',
                      '&:hover': { bgcolor: 'action.hover' },
                      ...(attendance?.status === 'Present' && {
                        bgcolor: 'success.lighter',
                        color: 'success.dark',
                      }),
                      ...(attendance?.status === 'HalfDay' && {
                        background: (theme) =>
                          `linear-gradient(135deg, ${theme.palette.warning.lighter} 50%, transparent 50%)`,
                        color: 'warning.dark',
                      }),
                      ...(attendance?.status === 'Absent' && {
                        bgcolor: 'error.lighter',
                        color: 'error.dark',
                      }),
                      ...(attendance?.status === 'HalfDayLeave' && {
                        background: (theme) =>
                          `linear-gradient(135deg, ${theme.palette.secondary.lighter} 50%, transparent 50%)`,
                        color: 'secondary.dark',
                      }),
                      ...(attendance?.status === 'FullDayLeave' && {
                        bgcolor: 'info.lighter',
                        color: 'info.dark',
                      }),
                    }}
                  />
                </Box>
              </CustomTooltip>
            );
          },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Present
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Half day
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Absent
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'secondary.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Half-day leave
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Full-day leave
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.disabled' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Holiday
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileDashboardAttendance;

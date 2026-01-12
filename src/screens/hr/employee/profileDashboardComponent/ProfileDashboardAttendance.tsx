import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { PickersDay, DateCalendar } from '@mui/x-date-pickers';

const ProfileDashboardAttendance = () => {
  const [date] = useState<Dayjs | null>(dayjs());

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
      }}
    >
      <Box sx={{ p: 3, pb: 0 }}>
        <Typography variant="h6">Attendance Calendar</Typography>
      </Box>

      <DateCalendar
        value={date}
        disableFuture
        showDaysOutsideCurrentMonth
        sx={{
          width: '100%',
          flexGrow: 2,
          maxHeight: '100%',
          height: '100%',
          justifyContent: 'center',
          '& .MuiPickersCalendarHeader-root': {
            display: 'none', // Hides the header (Month, Year, and Arrows)
          },
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

            const absent = day.format('DD-MM-YYYY') === '10-06-2025';
            const isSunday = day.day() === 0;
            const isHalfDay = day.format('DD-MM-YYYY') === '11-06-2025';
            const isHoliday = day.format('DD-MM-YYYY') === '09-06-2025';

            const disabled = isSunday || isHoliday || prop.disabled;
            let toolTipTitle = '';
            let backgroundColor = '';

            if (absent) {
              backgroundColor = 'error.lighter';
              toolTipTitle = 'Doctors Appointment';
            }
            if (isHalfDay) {
              toolTipTitle = 'Half Day';
            }
            if (isHoliday) {
              toolTipTitle = 'Public Holiday';
            }
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
                      bgcolor: backgroundColor,
                      color: absent ? 'error.main' : 'text.primary',
                      '&:hover': { bgcolor: 'action.hover' },
                      ...(isHalfDay && {
                        background: (theme) =>
                          `linear-gradient(135deg, ${theme.palette.warning.lighter} 50%, transparent 50%)`,
                        color: 'warning.dark',
                      }),
                      ...(isHoliday && {
                        bgcolor: 'background.neutral',
                        color: 'text.disabled',
                      }),
                    }}
                    disabled={disabled}
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
          gap: 3,
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
            Holiday
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Absent
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileDashboardAttendance;

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Badge, Paper, Typography } from '@mui/material';
import { PickersDay, DateCalendar } from '@mui/x-date-pickers';
import { Dot } from 'src/screens/student/studentProfile/attendance';

const ProfileDashboardAttendance = () => {
  const [date, setDate] = useState<Dayjs | null>(dayjs());

  return (
    <Paper
      elevation={0}
      sx={{
        flexGrow: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadows-2)',
        borderRadius: 2,
      }}
    >
      <Typography variant="subtitle1" sx={{ padding: '24px 24px 0px' }}>
        Attendance Calender
      </Typography>
      <DateCalendar
        value={date}
        disableFuture
        sx={{
          width: '100%',
          flexGrow: 2,
          maxHeight: '100%',
          height: '100%',
          justifyContent: 'center',
          '& .MuiPickersCalendarHeader-root': {
            display: 'none', // Hides the header (Month, Year, and Arrows)
          },
          '& .MuiDayCalendar-header': { justifyContent: 'space-around' },
          '& .MuiDayCalendar-weekContainer': { justifyContent: 'space-around' },
        }}
        slots={{
          day: (prop: any) => {
            const { day, today } = prop;

            const absent = day.format('DD-MM-YYYY') === '10-06-2025';
            const isSunday = day.day() === 0;
            const isHalfDay = day.format('DD-MM-YYYY') === '11-06-2025';
            const isHoliday = day.format('DD-MM-YYYY') === '09-06-2025';

            const disabled = isSunday || isHoliday || prop.disabled;
            let toolTipTitle = '';
            let backgroundColor = '';

            if (absent) {
              backgroundColor = 'error.main';
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
                <Badge overlap="circular" variant={isHoliday ? 'dot' : undefined} color="warning">
                  <PickersDay
                    {...prop}
                    day={day}
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      overflow: 'hidden',
                      fontWeight: disabled ? 400 : 600,
                      bgcolor: backgroundColor,
                      '&:hover': { ...(absent ? { backgroundColor: 'unset' } : {}) },
                      // background: (theme) =>
                      //   absent
                      //     ? `${theme.palette.error.main} !important`
                      //     : today
                      //       ? 'transparent !important'
                      //       : '',
                      // ...(absent
                      //   ? { color: 'white !important' }
                      //   : { color: (theme) => `${theme.vars.palette.text.primary} !important` }),
                      // border: (theme) =>
                      //   today ? `2px solid ${theme.palette.primary.main}` : 'none !important',
                      ...(isHalfDay
                        ? {
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: '0',
                              left: '0',

                              width: '50%',
                              height: '100%',
                              // eslint-disable-next-line @typescript-eslint/no-shadow
                              backgroundColor: (theme) => `${theme.palette.error.main} !important`,
                              border: '2px solid transparent',
                              zIndex: -1,
                            },
                          }
                        : {}),
                    }}
                    disabled={disabled}
                  />
                </Badge>
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
          borderTop: '1px dashed #ddd',
          p: 3,
          // height: '100%',
          // mt: 9.3,
          // pt: 3,
          color: 'text.primary',
        }}
      >
        <Dot color="success.main" sx={{ marginLeft: 2 }}>
          Today
        </Dot>
        <Dot color="warning.main" sx={{ marginLeft: 2 }}>
          Holiday
        </Dot>
        <Dot color="error.main" sx={{ marginLeft: 2 }}>
          Absent/ Half-Day
        </Dot>
      </Box>
    </Paper>
  );
};

export default ProfileDashboardAttendance;

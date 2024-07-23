import dayjs from 'dayjs';
import React, { useState } from 'react';

import { PickersDay, DateCalendar } from '@mui/x-date-pickers';
import { Box, Paper, Badge, Button, Tooltip, Typography, ButtonGroup } from '@mui/material';

import DataTable from 'src/components/commonTable';

import { AttendanceChart, YearlyAttendance } from './attendanceChart';

type DotProps = {
  sx?: React.CSSProperties;
  color?: string;
  children?: React.ReactNode;
};

const Dot: React.FC<DotProps> = ({
  sx = {},
  color = 'primary.main',
  children = null,
  ...props
}) => (
  <Box display="flex" alignItems="center">
    <Box
      component="span"
      bgcolor={color}
      sx={{
        height: '10px',
        width: '10px',
        borderRadius: '50%',
        display: 'inline-block',
        marginRight: '5px',
        ...sx,
      }}
      {...props}
    />
    <Typography color={color} fontSize="14px !important">
      {' '}
      {children}
    </Typography>
  </Box>
);

const Attendance = () => {
  const [activeButton, setActiveButton] = useState('monthly');

  return (
    <Box
      sx={{
        mt: 1,
        '& *': {
          fontSize: '12px !important',
        },
        '& svg': {
          fontSize: '18px !important',
        },
      }}
    >
      <Box width="100%" display="flex" alignItems="center" gap={2} mb={2}>
        <Dot color="primary.main"> {'>80% '}</Dot>
        <Dot color="warning.main">70% - 80%</Dot>
        <Dot color="info.main">50% - 70%</Dot>
        <Dot color="error.main">{'<50%'}</Dot>
      </Box>
      <Box display="flex" gap={3} alignItems="center" sx={{ flexWrap: 'wrap', mb: 2 }}>
        <Typography variant="h6" fontSize="14px !important" fontWeight="bold">
          Overall Attendance Percentage :{' '}
          <Box
            component="span"
            sx={{
              border: (theme) => `2px dashed ${theme.palette.text.primary}`,
              p: 1,
              color: (theme) => theme.palette.primary.main,
              borderRadius: '5px',
              fontSize: '14px !important',
              fontWeight: 'bold',
            }}
          >
            {' '}
            92%{' '}
          </Box>
        </Typography>
        <ButtonGroup color="inherit" variant="outlined" aria-label="outlined button group">
          <Button
            size="small"
            variant={activeButton === 'yearly' ? 'contained' : 'outlined'}
            sx={{ borderRadius: '5px' }}
            onClick={() => setActiveButton('yearly')}
          >
            Year Wise Trends
          </Button>
          <Button
            size="small"
            variant={activeButton === 'monthly' ? 'contained' : 'outlined'}
            sx={{ borderRadius: '5px' }}
            onClick={() => setActiveButton('monthly')}
          >
            Month Wise Trends
          </Button>
        </ButtonGroup>
      </Box>
      <Box display="flex" gap={3} sx={{ flexWrap: 'wrap', mb: 2 }}>
        <Box flexGrow={1}>
          {activeButton === 'monthly' ? (
            <AttendanceChart
              title="Attendance progress"
              chart={{
                series: [
                  { label: 'Present', value: 75 },
                  { label: 'Absent', value: 10 },
                  { label: 'Seek Leave', value: 20 },
                  { label: 'Family Function', value: 5 },
                ],
                // colors: [colors.red[500], colors.blue[500], colors.green[500], colors.yellow[500]],
              }}
            />
          ) : (
            <YearlyAttendance
              title="Yearly Attendance"
              // subheader="(+43%) than last year"
              chart={{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                series: [
                  { name: 'Present', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                  { name: 'Absent', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
                ],
              }}
              sx={{ width: '100%' }}
            />
          )}
        </Box>
        <Paper elevation={4} sx={{ flexGrow: 1 }}>
          <DateCalendar
            value={dayjs(new Date())}
            disableFuture
            sx={{
              width: '100%',
              '& .MuiDayCalendar-header': {
                justifyContent: 'space-around',
              },
              '& .MuiDayCalendar-weekContainer': {
                justifyContent: 'space-around',
              },
            }}
            slots={{
              day: (props: any) => {
                const { day, today } = props;
                const absent = day.format('DD-MM-YYYY') === '22-07-2024';
                const isSunday = day.day() === 0;
                const isHalfDay = day.format('DD-MM-YYYY') === '17-07-2024';
                const isHoliday = day.format('DD-MM-YYYY') === '18-07-2024';
                let toolTipTitle = '';
                if (absent) {
                  toolTipTitle = 'Doctors Appointment';
                } else if (isHoliday) {
                  toolTipTitle = 'Public Holiday';
                } else if (isHalfDay) {
                  toolTipTitle = 'Half Day';
                } else if (today) {
                  toolTipTitle = 'Today date';
                }

                return (
                  <Tooltip title={toolTipTitle} arrow placement="top">
                    <Badge
                      overlap="circular"
                      variant={isHoliday ? 'dot' : undefined}
                      color="warning"
                    >
                      <PickersDay
                        {...props}
                        day={day}
                        sx={{
                          position: 'relative',
                          zIndex: 1,
                          overflow: 'hidden',
                          background: (theme) =>
                            absent
                              ? `${theme.palette.error.main} !important`
                              : today
                                ? 'transparent !important'
                                : '',
                          color: absent ? `white !important` : '',
                          border: (theme) =>
                            today || isHalfDay
                              ? `2px solid ${isHalfDay ? theme.palette.error.main : theme.palette.primary.main}`
                              : 'none !important',
                          ...(isHalfDay
                            ? {
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: '0',
                                  left: '0',

                                  width: '100%',
                                  height: '50%',
                                  backgroundColor: (theme) =>
                                    `${theme.palette.error.main} !important`,
                                  border: '2px solid transparent',
                                  zIndex: -1,
                                },
                              }
                            : {}),
                        }}
                        disabled={isSunday || props.disabled}
                      />
                    </Badge>
                  </Tooltip>
                );
              },
            }}
          />
        </Paper>
      </Box>
      <DataTable
        data={[
          {
            date: '18/07/2024',
            status: 'Present',
            reason: 'Doctors Appointment',
            remarks: 'Student attended half-day due to medical checkup',
          },
          {
            date: '17/07/2024',
            status: 'Absent',
            reason: 'Traffic',
            remarks: 'Student informed about heavy traffic congestion',
          },
        ]}
        columns={[
          { key: 'date', label: 'Date', width: '10%' },
          { key: 'status', label: 'Status', width: '10%' },
          { key: 'reason', label: 'Reason', width: '10%' },
          { key: 'remarks', label: 'Remarks', width: '20%' },
        ]}
      />
    </Box>
  );
};
export default Attendance;

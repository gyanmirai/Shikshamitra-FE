import dayjs from 'dayjs';
import React, { useState } from 'react';

import { PickersDay, DateCalendar } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Stack,
  Paper,
  Badge,
  Button,
  Divider,
  Tooltip,
  Typography,
  ButtonGroup,
} from '@mui/material';

import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';

import { AttendanceChart, YearlyAttendance } from './attendanceChart';

import type { StudentTabsComponentType } from '.';

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

const Attendance = (props: StudentTabsComponentType) => {
  const [activeButton, setActiveButton] = useState<'monthly' | 'yearly'>('monthly');

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
      <Stack direction="row" spacing={2} alignItems="center">
        <Card
          elevation={3}
          sx={{
            py: 2,
            textAlign: 'center',
            typography: 'h4',
            maxWidth: '250px',
            width: '100%',
          }}
        >
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          >
            <Stack width={1}>
              <Box fontSize="14px">
                Overall Attendance Percentage &nbsp;
                <Label variant="soft" color="success">
                  90%
                </Label>
              </Box>
            </Stack>
          </Stack>
        </Card>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Box display="flex" gap={3} sx={{ flexWrap: 'wrap', mb: 2 }}>
        <Box flexGrow={1}>
          {activeButton === 'monthly' ? (
            <AttendanceChart
              title={
                <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
                  Attendance progress{' '}
                  <ButtonGroup
                    color="inherit"
                    variant="outlined"
                    aria-label="outlined button group"
                  >
                    <Button
                      size="small"
                      variant={
                        (activeButton as 'yearly' | 'monthly') === 'yearly'
                          ? 'contained'
                          : 'outlined'
                      }
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
              }
              chart={{
                series: [
                  { label: 'Present', value: 75 },
                  { label: 'Absent', value: 10 },
                  { label: 'Seek Leave', value: 20 },
                  { label: 'Family Function', value: 5 },
                ],
              }}
            />
          ) : (
            <YearlyAttendance
              title={
                <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
                  Attendance progress{' '}
                  <ButtonGroup
                    color="inherit"
                    variant="outlined"
                    aria-label="outlined button group"
                  >
                    <Button
                      size="small"
                      variant={
                        (activeButton as 'yearly' | 'monthly') === 'yearly'
                          ? 'contained'
                          : 'outlined'
                      }
                      sx={{ borderRadius: '5px' }}
                      onClick={() => setActiveButton('yearly')}
                    >
                      Year Wise Trends
                    </Button>
                    <Button
                      size="small"
                      variant={
                        (activeButton as 'yearly' | 'monthly') === 'monthly'
                          ? 'contained'
                          : 'outlined'
                      }
                      sx={{ borderRadius: '5px' }}
                      onClick={() => setActiveButton('monthly')}
                    >
                      Month Wise Trends
                    </Button>
                  </ButtonGroup>
                </Box>
              }
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
              day: (prop: any) => {
                const { day, today } = prop;
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
                        {...prop}
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
                          ...(absent
                            ? { color: 'white !important' }
                            : { color: (theme) => `${theme.palette.text.primary} !important` }),
                          border: (theme) =>
                            today ? `2px solid ${theme.palette.primary.main}` : 'none !important',
                          ...(isHalfDay
                            ? {
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: '0',
                                  left: '0',

                                  width: '50%',
                                  height: '100%',
                                  backgroundColor: (theme) =>
                                    `${theme.palette.error.main} !important`,
                                  border: '2px solid transparent',
                                  zIndex: -1,
                                },
                              }
                            : {}),
                        }}
                        disabled={isSunday || isHoliday || prop.disabled}
                      />
                    </Badge>
                  </Tooltip>
                );
              },
            }}
          />
        </Paper>
      </Box>
      <CustomizableTable
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
          { id: 'date', label: 'Date', minWidth: '10%' },
          { id: 'status', label: 'Status', minWidth: '10%' },
          { id: 'reason', label: 'Reason', minWidth: '10%' },
          { id: 'remarks', label: 'Remarks', minWidth: '20%' },
        ]}
      />
    </Box>
  );
};
export default Attendance;

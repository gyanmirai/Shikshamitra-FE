import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { PickersDay, DatePicker, DateCalendar } from '@mui/x-date-pickers';
import {
  AttendanceStatusType,
  AttendanceStatusOptions,
  AttendanceStatusTypeColors,
} from 'src/enums/attendance-type';
import {
  Box,
  Grid,
  Card,
  Stack,
  Badge,
  Button,
  Divider,
  CardHeader,
  Typography,
  ButtonGroup,
  CircularProgress,
} from '@mui/material';

import { AttendanceChart, YearlyAttendance } from './attendanceChart';

import type { StudentTabsComponentType } from '.';

type DotProps = { sx?: React.CSSProperties; color?: string; children?: React.ReactNode };

export const Dot: React.FC<DotProps> = ({
  sx = {},
  color = 'primary.main',
  children = null,
  ...props
}) => (
  <Box display="flex" alignItems="center" sx={{ ...sx }} {...props}>
    <Box
      component="span"
      bgcolor={color}
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        mr: 1,
      }}
    />
    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
      {children}
    </Typography>
  </Box>
);

const Attendance = (props: StudentTabsComponentType) => {
  // State to track active view mode (monthly or yearly)
  const [activeButton, setActiveButton] = useState<'monthly' | 'yearly'>('monthly');

  const [date, setDate] = useState<Dayjs | null>(dayjs());

  // Get theme object for styling
  const theme = useTheme();

  return (
    <Box
      sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}
    >
      <Scrollbar>
        <Grid container spacing={3} sx={{ p: 1, mb: 1 }}>
          {/* Header Section */}
          <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 3 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <DatePicker
                  format="MMM-YYYY"
                  views={['year', 'month']}
                  label="Select Month Year"
                  value={date}
                  onChange={(newValue) => {
                    setDate(newValue);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: { minWidth: 200 },
                    },
                  }}
                />

                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Overall Attendance
                  </Typography>

                  <Box position="relative" display="inline-flex">
                    <CircularProgress
                      variant="determinate"
                      value={90}
                      size={40}
                      thickness={4}
                      sx={{ color: 'info.main' }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        component="div"
                        color="text.primary"
                        fontWeight="bold"
                      >
                        90%
                      </Typography>
                    </Box>
                  </Box>

                  <CustomTooltip
                    placement="top"
                    title={
                      <Stack spacing={1} sx={{ p: 1 }}>
                        <Dot color="primary.main">{'>80%'}</Dot>
                        <Dot color="warning.main">70% - 80%</Dot>
                        <Dot color="info.main">50% - 70%</Dot>
                        <Dot color="error.main">{'<50%'}</Dot>
                      </Stack>
                    }
                  >
                    <Iconify icon="mdi:help-circle-outline" sx={{ color: 'text.disabled' }} />
                  </CustomTooltip>
                </Stack>
              </Stack>
            </Card>
          </Grid>

          {/* Charts & Calendar */}
          <Grid size={{ xs: 12, md: 6 }}>
            {activeButton === 'monthly' ? (
              // @ts-ignore
              <AttendanceChart
                title={
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Typography variant="h6">Attendance Progress</Typography>
                    <ButtonGroup size="small" variant="outlined" color="inherit">
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => setActiveButton('yearly')}
                      >
                        Yearly
                      </Button>
                      <Button
                        variant={activeButton === 'monthly' ? 'contained' : 'outlined'}
                        color={activeButton === 'monthly' ? 'primary' : 'inherit'}
                        onClick={() => setActiveButton('monthly')}
                      >
                        Monthly
                      </Button>
                    </ButtonGroup>
                  </Stack>
                }
                chart={{
                  colors: [theme.palette.primary.main, theme.palette.error.main],
                  series: [
                    { label: 'Present', value: 75 },
                    { label: 'Absent', value: 10 },
                  ],
                }}
                sx={{ height: '100%' }}
              />
            ) : (
              <YearlyAttendance
                title={
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Typography variant="h6">Attendance Progress</Typography>
                    <ButtonGroup size="small" variant="outlined" color="inherit">
                      <Button
                        variant={activeButton === 'yearly' ? 'contained' : 'outlined'}
                        color={activeButton === 'yearly' ? 'primary' : 'inherit'}
                        onClick={() => setActiveButton('yearly')}
                      >
                        Yearly
                      </Button>
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => setActiveButton('monthly')}
                      >
                        Monthly
                      </Button>
                    </ButtonGroup>
                  </Stack>
                }
                chart={{
                  colors: [theme.palette.primary.main, theme.palette.error.main],
                  categories: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                  ],
                  series: [
                    { name: 'Present', data: [12, 25, 18, 22, 15, 28, 20, 17, 24, 17, 11, 30] },
                    { name: 'Absent', data: [18, 5, 12, 8, 15, 2, 10, 13, 6, 13, 19, 0] },
                  ],
                }}
                sx={{ height: '100%' }}
              />
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader title="Attendance Calendar" />
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <DateCalendar
                  value={date}
                  disableFuture
                  sx={{
                    width: '100%',
                    '& .MuiPickersCalendarHeader-root': { display: 'none' },
                    '& .MuiDayCalendar-header': { justifyContent: 'space-around' },
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
                        backgroundColor = alpha(theme.palette.error.main, 0.1);
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
                          <Badge
                            overlap="circular"
                            variant={isHoliday ? 'dot' : undefined}
                            color="warning"
                          >
                            <PickersDay
                              {...prop}
                              day={day}
                              sx={{
                                fontSize: 12,
                                fontWeight: disabled ? 400 : 600,
                                bgcolor: backgroundColor || 'transparent',
                                borderRadius: '50%',
                                color: absent ? 'common.white' : 'text.primary',
                                '&:hover': {
                                  bgcolor: absent
                                    ? theme.palette.error.dark
                                    : alpha(theme.palette.primary.main, 0.08),
                                },
                                ...(isHalfDay && {
                                  background: `linear-gradient(90deg, ${theme.palette.error.main} 50%, transparent 50%)`,
                                  color: 'common.white',
                                }),
                              }}
                              disabled={disabled}
                            />
                          </Badge>
                        </CustomTooltip>
                      );
                    },
                  }}
                />
              </Box>

              <Divider sx={{ borderStyle: 'dashed' }} />

              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{ p: 3, bgcolor: 'background.neutral' }}
              >
                <Dot color="success.main">Today</Dot>
                <Dot color="warning.main">Holiday</Dot>
                <Dot color="error.main">Absent / Half-Day</Dot>
              </Stack>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomizableTable
              tableId="student-attendance-table"
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
                { id: 'date', label: 'Date', minWidth: '10%', filterType: 'date' },
                {
                  id: 'status',
                  label: 'Status',
                  minWidth: '10%',
                  filterType: 'enum',
                  enumOptions: AttendanceStatusOptions,
                  render(value, row) {
                    const color = AttendanceStatusTypeColors[
                      value as AttendanceStatusType
                    ] as LabelColor;
                    return (
                      <Label variant="soft" color={color}>
                        {AttendanceStatusType[value as AttendanceStatusType]}
                      </Label>
                    );
                  },
                },
                { id: 'reason', label: 'Reason', minWidth: '10%' },
                { id: 'remarks', label: 'Remarks', minWidth: '20%' },
              ]}
            />
          </Grid>
        </Grid>
      </Scrollbar>
    </Box>
  );
};
export default Attendance;

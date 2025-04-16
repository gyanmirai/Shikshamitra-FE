import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import { PickersDay, DateCalendar } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Grid,
  Stack,
  Paper,
  Badge,
  alpha,
  Button,
  Divider,
  Tooltip,
  useTheme,
  Typography,
  ButtonGroup,
} from '@mui/material';

import {
  AttendanceStatusType,
  AttendanceStatusOptions,
  AttendanceStatusTypeColors,
} from 'src/enums/attendance-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
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
        wordWrap: 'normal',
        whiteSpace: 'nowrap',

        ...sx,
      }}
      {...props}
    />
    <Typography color={color} fontSize="12px !important" whiteSpace="nowrap">
      {' '}
      {children}
    </Typography>
  </Box>
);

const Attendance = (props: StudentTabsComponentType) => {
  // State to track active view mode (monthly or yearly)
  const [activeButton, setActiveButton] = useState<'monthly' | 'yearly'>('monthly');

  // Get theme object for styling
  const theme = useTheme();

  // State to store selected year (defaults to current year)
  const [year, setYear] = useState<string>(dayjs().format('YYYY'));

  // State to store selected month (defaults to current month)
  const [month, setMonth] = useState<string>(dayjs().format('MM'));
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
      <Stack direction="row" spacing={2} alignItems="center">
        <Card
          elevation={3}
          sx={{
            p: 2,
            // textAlign: 'center',
            typography: 'h4',
            maxWidth: '300px',
            width: '100%',
          }}
        >
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          >
            <Stack>
              <Box fontSize="14px" display="flex" alignItems="center" gap={1}>
                Overall Attendance Percentage &nbsp;
                <Label variant="soft" color="success">
                  90%
                </Label>
                <CustomTooltip
                  placement="top"
                  title={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Dot color="primary.main"> {'>80% '}</Dot>
                      <Dot color="warning.main">70% - 80%</Dot>
                      <Dot color="info.main">50% - 70%</Dot>
                      <Dot color="error.main">{'<50%'}</Dot>
                    </Box>
                  }
                >
                  <Iconify icon="mdi:help-circle-outline" />
                </CustomTooltip>
              </Box>
            </Stack>
          </Stack>
        </Card>
      </Stack>
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <CustomSelect
          label="Year"
          options={[
            { value: '2025', label: '2025' },
            { value: '2024', label: '2024' },
            { value: '2023', label: '2023' },
            { value: '2022', label: '2022' },
          ]}
          onChange={(val) => {
            setMonth(val as string);
          }}
          value={year}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
        <CustomSelect
          label="Month"
          options={[
            { value: '01', label: 'January' },
            { value: '02', label: 'February' },
            { value: '03', label: 'March' },
            { value: '04', label: 'April' },
            { value: '05', label: 'May' },
            { value: '06', label: 'June' },
            { value: '07', label: 'July' },
            { value: '08', label: 'August' },
            { value: '09', label: 'September' },
            { value: '10', label: 'October' },
            { value: '11', label: 'November' },
            { value: '12', label: 'December' },
          ]}
          onChange={(val) => {
            setMonth(val as string);
          }}
          value={month}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
      </Box>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6}>
          <Box flexGrow={1}>
            {activeButton === 'monthly' ? (
              // @ts-ignore
              <AttendanceChart
                title={
                  <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
                    <Typography variant="h5">Attendance progress</Typography>
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
                  colors: [
                    alpha(theme.palette.primary.main, 0.8),
                    alpha(theme.palette.error.main, 0.8),
                  ],
                  series: [
                    { label: 'Present', value: 75 },
                    { label: 'Absent', value: 10 },
                  ],
                }}
              />
            ) : (
              <YearlyAttendance
                title={
                  <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
                    <Typography variant="h5">Attendance progress</Typography>
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
                  colors: [
                    alpha(theme.palette.primary.main, 0.8),
                    alpha(theme.palette.error.main, 0.8),
                  ],
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                  series: [
                    {
                      name: 'Present',
                      data: [43, 33, 22, 37, 67, 68, 37, 24, 55],
                    },
                    {
                      name: 'Absent',
                      data: [51, 70, 47, 67, 40, 37, 24, 70, 24],
                    },
                  ],
                }}
                sx={{ width: '100%' }}
              />
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper elevation={4} sx={{ flexGrow: 1, height: '100%' }}>
            <DateCalendar
              value={dayjs(new Date())}
              disableFuture
              sx={{
                width: '100%',
                pt: '7%',
                '& .MuiPickersCalendarHeader-root': {
                  display: 'none', // Hides the header (Month, Year, and Arrows)
                },
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
                  console.log('day----', day);

                  const absent = day.format('DD-MM-YYYY') === '01-04-2025';
                  const isSunday = day.day() === 0;
                  const isHalfDay = day.format('DD-MM-YYYY') === '04-04-2025';
                  const isHoliday = day.format('DD-MM-YYYY') === '03-04-2025';

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
                            fontWeight: disabled ? 400 : 600,
                            bgcolor: backgroundColor,
                            // background: (theme) =>
                            //   absent
                            //     ? `${theme.palette.error.main} !important`
                            //     : today
                            //       ? 'transparent !important'
                            //       : '',
                            // ...(absent
                            //   ? { color: 'white !important' }
                            //   : { color: (theme) => `${theme.palette.text.primary} !important` }),
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
                                    backgroundColor: (theme) =>
                                      `${theme.palette.error.main} !important`,
                                    border: '2px solid transparent',
                                    zIndex: -1,
                                  },
                                }
                              : {}),
                          }}
                          disabled={disabled}
                        />
                      </Badge>
                    </Tooltip>
                  );
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>
      <CustomizableTable
        tableId="student-attendance-table"
        searchFieldProps={{
          placeholder: 'Search by Date, Status, Reason, Remarks...',
          label: 'Search by Date, Status, Reason, Remarks...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
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
          {
            id: 'status',
            label: 'Status',
            minWidth: '10%',
            filterType: 'enum',
            enumOptions: AttendanceStatusOptions,
            render(value, row) {
              const color = AttendanceStatusTypeColors[value as AttendanceStatusType] as LabelColor;
              return (
                <Label color={color}>{AttendanceStatusType[value as AttendanceStatusType]}</Label>
              );
            },
          },
          { id: 'reason', label: 'Reason', minWidth: '10%' },
          { id: 'remarks', label: 'Remarks', minWidth: '20%' },
        ]}
      />{' '}
    </Box>
  );
};
export default Attendance;

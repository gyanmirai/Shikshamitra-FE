import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import { PickersDay, DatePicker, DateCalendar } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Paper,
  Badge,
  alpha,
  Button,
  Divider,
  useTheme,
  Typography,
  ButtonGroup,
  CircularProgress,
} from '@mui/material';

import {
  AttendanceStatusType,
  AttendanceStatusOptions,
  AttendanceStatusTypeColors,
} from 'src/enums/attendance-type';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';

import { AttendanceChart, YearlyAttendance } from './attendanceChart';

import type { StudentTabsComponentType } from '.';

type DotProps = {
  sx?: React.CSSProperties;
  color?: string;
  children?: React.ReactNode;
};

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
        height: '12px',
        width: '12px',
        borderRadius: '50%',
        display: 'inline-block',
        marginRight: '5px',
      }}
    />
    <Typography sx={{ color: '#000', fontSize: '12px', whiteSpace: 'nowrap' }}>
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
      sx={{
        mt: 1,
      }}
    >
      {/* <Stack direction="row" spacing={2} alignItems="center">
        <Card
          elevation={3}
          sx={{
            p: 2,
            // textAlign: 'center',
            typography: 'h4',
            // maxWidth: '300px',
            // width: '100%',
          }}
        >
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          >
            <Stack>
              <Box fontSize="14px" display="flex" alignItems="center" gap={1}>
                Overall Attendance&nbsp;
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress variant="determinate" value={90} />
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
                    <Typography variant="caption" component="div" color="text.secondary">
                      {`${90}%`}
                    </Typography>
                  </Box>
                </Box>
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
      </Stack> */}
      <Paper
        elevation={2}
        sx={{ display: 'flex', gap: 2, mt: 2, p: 2, justifyContent: 'space-between' }}
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
            },
          }}
        />
        <Box fontSize="14px" display="flex" alignItems="center" gap={1}>
          Overall Attendance&nbsp;
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" value={90} />
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
              <Typography variant="caption" component="div" color="text.secondary">
                {`${90}%`}
              </Typography>
            </Box>
          </Box>
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
      </Paper>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6}>
          <Box flexGrow={1}>
            {activeButton === 'monthly' ? (
              // @ts-ignore
              <AttendanceChart
                title={
                  <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
                    <Typography variant="subtitle1">Attendance progress</Typography>
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
                sx={{ boxShadow: 'var(--shadows-2)', borderRadius: 2 }}
              />
            ) : (
              <YearlyAttendance
                title={
                  <Box display="flex" alignItems="center" gap={1} justifyContent="space-between">
                    <Typography variant="subtitle1">Attendance progress</Typography>
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
                    {
                      name: 'Present',
                      data: [12, 25, 18, 22, 15, 28, 20, 17, 24, 17, 11, 30],
                    },
                    {
                      name: 'Absent',
                      data: [18, 5, 12, 8, 15, 2, 10, 13, 6, 13, 19, 0],
                    },
                  ],
                }}
                sx={{ width: '100%', boxShadow: 'var(--shadows-2)', borderRadius: 2 }}
              />
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
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
                            '&:hover': {
                              ...(absent ? { backgroundColor: 'unset' } : {}),
                            },
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
        </Grid>
      </Grid>
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

import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizable-table';
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
  Divider,
  CardHeader,
  Typography,
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)' }}>
      <Scrollbar sx={{ flexGrow: 1, height: '100%' }}>
        <Grid container spacing={1}>
          {/* Header Section */}
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                p: 2,
                boxShadow: (t) => `0 8px 24px -4px ${alpha(t.palette.primary.main, 0.08)}`,
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems="center"
                justifyContent="space-between"
                spacing={3}
              >
                {/* Left Side */}
                <Box>
                  <DatePicker
                    format="MMM YYYY"
                    views={['year', 'month']}
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    slotProps={{
                      textField: {
                        variant: 'standard',
                        InputProps: {
                          disableUnderline: true,
                          sx: { typography: 'h4', fontWeight: 700, color: 'text.primary' },
                        },
                        sx: { width: 160 },
                      },
                    }}
                  />
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      22 Working Days
                    </Typography>
                    <Box
                      sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }}
                    />
                    <Typography variant="body2" color="error.main" fontWeight={600}>
                      2 Absent
                    </Typography>
                  </Stack>
                </Box>

                {/* Right Side */}
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Box position="relative" display="inline-flex">
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={64}
                      thickness={3}
                      sx={{ color: 'grey.200', position: 'absolute' }}
                    />
                    <CircularProgress
                      variant="determinate"
                      value={90}
                      size={64}
                      thickness={3}
                      sx={{
                        color: 'success.main',
                        strokeLinecap: 'round',
                        filter: (t) =>
                          `drop-shadow(0 4px 8px ${alpha(t.palette.success.main, 0.24)})`,
                      }}
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
                      <Typography variant="h6" fontWeight={800} color="success.dark">
                        90%
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Good Attendance
                    </Typography>
                  </Box>
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
                    sx={{ ml: -1, mt: -1 }}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Typography variant="h6">Attendance Progress</Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ bgcolor: 'background.neutral', p: 0.5, borderRadius: 1.5 }}
                    >
                      {['Monthly', 'Yearly'].map((view) => (
                        <Box
                          key={view}
                          onClick={() =>
                            setActiveButton(view.toLowerCase() as 'monthly' | 'yearly')
                          }
                          sx={{
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            ...(activeButton === view.toLowerCase()
                              ? {
                                  bgcolor: 'background.paper',
                                  boxShadow: (t) =>
                                    t.palette.mode === 'light'
                                      ? `0 2px 4px ${alpha(t.palette.grey[500], 0.16)}`
                                      : `0 2px 4px ${alpha(t.palette.common.black, 0.4)}`,
                                  color: 'text.primary',
                                  fontWeight: 600,
                                }
                              : {
                                  color: 'text.secondary',
                                  '&:hover': { color: 'text.primary' },
                                }),
                          }}
                        >
                          <Typography variant="subtitle2">{view}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                }
                chart={{
                  colors: [
                    theme.palette.primary.main,
                    theme.palette.error.main,
                    theme.palette.warning.main,
                  ],
                  series: [
                    { label: 'Present', value: 22 },
                    { label: 'Absent', value: 2 },
                    { label: 'Holiday', value: 3 },
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ bgcolor: 'background.neutral', p: 0.5, borderRadius: 1.5 }}
                    >
                      {['Monthly', 'Yearly'].map((view) => (
                        <Box
                          key={view}
                          onClick={() =>
                            setActiveButton(view.toLowerCase() as 'monthly' | 'yearly')
                          }
                          sx={{
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            ...(activeButton === view.toLowerCase()
                              ? {
                                  bgcolor: 'background.paper',
                                  boxShadow: (t) =>
                                    t.palette.mode === 'light'
                                      ? `0 2px 4px ${alpha(t.palette.grey[500], 0.16)}`
                                      : `0 2px 4px ${alpha(t.palette.common.black, 0.4)}`,
                                  color: 'text.primary',
                                  fontWeight: 600,
                                }
                              : {
                                  color: 'text.secondary',
                                  '&:hover': { color: 'text.primary' },
                                }),
                          }}
                        >
                          <Typography variant="subtitle2">{view}</Typography>
                        </Box>
                      ))}
                    </Stack>
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
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: -1, mt: -1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Attendance Calendar
                    </Typography>
                  </Box>
                }
                sx={{ pb: 1.5 }}
              />
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', px: 2 }}>
                <DateCalendar
                  value={date}
                  disableFuture
                  showDaysOutsideCurrentMonth
                  sx={{
                    width: '100%',
                    maxHeight: '100%',
                    '& .MuiPickersCalendarHeader-root': { display: 'none' },
                    '& .MuiDayCalendar-header': {
                      justifyContent: 'space-around',
                      pb: 1,
                      '& .MuiDayCalendar-weekDayLabel': {
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      },
                    },
                    '& .MuiDayCalendar-weekContainer': {
                      justifyContent: 'space-around',
                      mt: 0.75,
                    },
                  }}
                  slots={{
                    day: (prop: any) => {
                      const { day } = prop;
                      const dateStr = day.format('DD-MM-YYYY');
                      const absent = dateStr === '10-06-2025';
                      const isSunday = day.day() === 0;
                      const isHalfDay = dateStr === '11-06-2025';
                      const isHoliday = dateStr === '09-06-2025';
                      const isLate = dateStr === '12-06-2025';
                      const isPresent =
                        !absent &&
                        !isHalfDay &&
                        !isHoliday &&
                        !isSunday &&
                        !prop.outsideCurrentMonth &&
                        day.isBefore(dayjs());

                      const disabled = isSunday || isHoliday || prop.disabled;
                      let backgroundColor = '';
                      let textColor = 'text.primary';
                      let tooltipContent: React.ReactNode = '';

                      if (absent) {
                        backgroundColor = 'error.lighter';
                        textColor = 'error.main';
                        tooltipContent = (
                          <Box sx={{ p: 0.5 }}>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              sx={{ mb: 0.5 }}
                            >
                              <Iconify
                                icon="solar:close-circle-bold"
                                sx={{ width: 14, color: 'error.light' }}
                              />
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                Absent
                              </Typography>
                            </Stack>
                            <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
                              Doctors Appointment
                            </Typography>
                          </Box>
                        );
                      } else if (isHalfDay) {
                        tooltipContent = (
                          <Box sx={{ p: 0.5 }}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Iconify
                                icon="solar:clock-circle-bold"
                                sx={{ width: 14, color: 'warning.light' }}
                              />
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                Half Day
                              </Typography>
                            </Stack>
                          </Box>
                        );
                      } else if (isHoliday) {
                        backgroundColor = 'background.neutral';
                        textColor = 'text.disabled';
                        tooltipContent = (
                          <Box sx={{ p: 0.5 }}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Iconify
                                icon="solar:calendar-mark-bold"
                                sx={{ width: 14, color: 'warning.light' }}
                              />
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                Public Holiday
                              </Typography>
                            </Stack>
                          </Box>
                        );
                      } else if (isLate) {
                        backgroundColor = 'warning.lighter';
                        textColor = 'warning.dark';
                        tooltipContent = (
                          <Box sx={{ p: 0.5 }}>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              sx={{ mb: 0.5 }}
                            >
                              <Iconify
                                icon="solar:clock-circle-bold"
                                sx={{ width: 14, color: 'warning.light' }}
                              />
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                Late Arrival
                              </Typography>
                            </Stack>
                            <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
                              Arrived at 8:15 AM
                            </Typography>
                          </Box>
                        );
                      } else if (isPresent) {
                        tooltipContent = (
                          <Box sx={{ p: 0.5 }}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Iconify
                                icon="solar:check-circle-bold"
                                sx={{ width: 14, color: 'success.light' }}
                              />
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                Present
                              </Typography>
                            </Stack>
                          </Box>
                        );
                      }

                      return (
                        <CustomTooltip title={tooltipContent} arrow placement="top">
                          <Box sx={{ position: 'relative' }}>
                            <PickersDay
                              {...prop}
                              day={day}
                              sx={{
                                position: 'relative',
                                fontSize: '0.875rem',
                                fontWeight: disabled ? 400 : 600,
                                bgcolor: backgroundColor || 'transparent',
                                borderRadius: 1.5,
                                color: textColor,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: 'none',
                                '&:hover': {
                                  bgcolor: backgroundColor || 'action.hover',
                                  transform: 'translateY(-2px)',
                                  boxShadow: (t) => `0 4px 8px ${alpha(t.palette.grey[500], 0.16)}`,
                                },
                                '&.Mui-selected': {
                                  bgcolor: 'primary.main',
                                  color: 'primary.contrastText',
                                  fontWeight: 700,
                                  boxShadow: (t) =>
                                    `0 0 0 2px ${alpha(t.palette.primary.main, 0.24)}`,
                                  '&:hover': {
                                    bgcolor: 'primary.dark',
                                  },
                                },
                                ...(isHalfDay && {
                                  background: (t) =>
                                    `linear-gradient(135deg, ${t.palette.warning.lighter} 50%, ${alpha(t.palette.warning.lighter, 0.3)} 50%)`,
                                  color: 'warning.dark',
                                  fontWeight: 600,
                                }),
                              }}
                              disabled={disabled}
                            />
                            {isPresent && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: 2,
                                  right: 2,
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  bgcolor: 'success.main',
                                  boxShadow: (t) => `0 0 0 2px ${t.palette.background.paper}`,
                                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                  '@keyframes pulse': {
                                    '0%, 100%': {
                                      opacity: 1,
                                    },
                                    '50%': {
                                      opacity: 0.5,
                                    },
                                  },
                                }}
                              />
                            )}
                          </Box>
                        </CustomTooltip>
                      );
                    },
                  }}
                />
              </Box>

              <Divider sx={{ borderStyle: 'dashed', mx: 0.5 }} />

              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 3,
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.2px' }}
                  >
                    Present
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 'warning.main',
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.2px' }}
                  >
                    Holiday
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 'error.main',
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.2px' }}
                  >
                    Absent
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 'info.main',
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, fontSize: '0.8125rem', letterSpacing: '0.2px' }}
                  >
                    Half-Day
                  </Typography>
                </Box>
              </Box>
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
              isPagination={false}
              isShowedDense={false}
              isFilter={false}
            />
          </Grid>
        </Grid>
      </Scrollbar>
    </Box>
  );
};
export default Attendance;

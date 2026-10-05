'use client';

import type { OperationalOverview } from 'src/redux/hr/hrOperationalDashboardApi';

import { useTheme } from '@mui/material/styles';
import { hrPaths } from 'src/constants/hr-menus';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Chart, useChart } from 'src/components/chart';
import {
  Box,
  Paper,
  Stack,
  Alert,
  Button,
  Tooltip,
  Skeleton,
  TextField,
  ButtonBase,
  IconButton,
  Typography,
  useMediaQuery,
  LinearProgress,
} from '@mui/material';

import {
  indiaToday,
  dailyStatus,
  formatCount,
  formatUpdatedAt,
  formatSchoolDate,
  previousSchoolDay,
} from '../operational-dashboard-state';

const statusKeys = [
  'present',
  'absent',
  'onLeave',
  'halfDay',
  'notMarked',
  'notScheduled',
  'needsSetup',
] as const;
type Props = {
  data?: OperationalOverview;
  date: string;
  onDate: (date: string) => void;
  canViewAttendance: boolean;
  canViewPayroll: boolean;
  canOpenPayroll: boolean;
  canMarkAttendance: boolean;
};

export default function OperationalDashboardSecondary({
  data,
  date,
  onDate,
  canViewAttendance,
  canViewPayroll,
  canOpenPayroll,
  canMarkAttendance,
}: Props) {
  const theme = useTheme();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const trend = data?.trend || [];
  const colours = [
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.text.disabled,
    theme.palette.divider,
    theme.palette.warning.light,
  ];
  const statuses = Object.values(dailyStatus);
  const chartOptions = useChart({
    chart: { height: 210, stacked: true, animations: { enabled: !reducedMotion } },
    highcharts: {
      accessibility: { enabled: false },
      chart: { animation: !reducedMotion },
      yAxis: { title: { text: null } },
      plotOptions: {
        series: { animation: !reducedMotion },
        column: { dataLabels: { enabled: false } },
      },
    },
    colors: colours,
    legend: { show: false },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    plotOptions: { bar: { columnWidth: '48%', borderRadius: 2 } },
    xaxis: {
      categories: trend.map((day) => formatSchoolDate(day.date).split(' ').slice(0, 2).join(' ')),
    },
    yaxis: { min: 0, decimalsInFloat: 0 },
    tooltip: { shared: true, intersect: false },
  });
  const series = statusKeys.map((key, i) => ({
    name: statuses[i].label,
    data: trend.map((day) => day[key]),
  }));
  const payroll = data?.payroll;
  const completed = payroll ? payroll.reviewedCount + payroll.lockedCount : 0;
  const sectionStyle = { p: 2, borderRadius: 2, minWidth: 0 };

  return (
    <Box
      sx={{
        display: 'grid',
        alignItems: 'start',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          lg:
            canViewAttendance && canViewPayroll
              ? 'minmax(0, 1.7fr) minmax(0, 1fr)'
              : 'minmax(0, 1fr)',
        },
        gap: 1.5,
      }}
    >
      {canViewAttendance && (
        <Paper
          component="section"
          aria-label="Seven-day staff attendance"
          variant="outlined"
          sx={sectionStyle}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            useFlexGap
            flexWrap="wrap"
            gap={1}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify
                icon="mdi:calendar-check-outline"
                width={20}
                sx={{ color: 'text.secondary' }}
                aria-hidden="true"
              />
              <Typography variant="h6" component="h2">
                Seven-day attendance
              </Typography>
            </Stack>
            <Button
              component={RouterLink}
              href={`${hrPaths.attendance.dashboard}?date=${date}`}
              size="small"
              variant="outlined"
              endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
            >
              Open Attendance
            </Button>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            useFlexGap
            flexWrap="wrap"
            gap={0.75}
            sx={{ mt: 1.5, pb: 1.5, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tooltip title="Previous day">
              <IconButton
                aria-label="Previous attendance day"
                onClick={() => onDate(previousSchoolDay(date))}
                sx={{ width: 44, height: 44 }}
              >
                <Iconify icon="mdi:chevron-left" />
              </IconButton>
            </Tooltip>
            <TextField
              label="Attendance date"
              type="date"
              size="small"
              value={date}
              onChange={(event) => {
                const { value } = event.target;
                if (/^\d{4}-\d{2}-\d{2}$/.test(value) && value <= indiaToday()) onDate(value);
              }}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { max: indiaToday(), 'aria-label': 'Attendance date' },
              }}
              sx={{ width: 175 }}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => onDate(indiaToday())}
              disabled={date === indiaToday()}
            >
              Today
            </Button>
            {canMarkAttendance && (
              <Button
                component={RouterLink}
                href={`${hrPaths.attendance.markAttendance}?date=${date}`}
                size="small"
                variant="contained"
                sx={{ ml: { sm: 'auto' } }}
              >
                Mark Attendance
              </Button>
            )}
          </Stack>
          {!data ? (
            <Skeleton variant="rounded" height={300} sx={{ mt: 2 }} />
          ) : data.attendanceState !== 'Available' || !data.summary || !data.trend ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Attendance summary is unavailable. Refresh to retry.
            </Alert>
          ) : (
            <>
              <Box sx={{ mt: 1 }} aria-hidden="true">
                <Chart type="bar" series={series} options={chartOptions} height={210} />
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  gap: 0.25,
                }}
              >
                {trend.map((day) => {
                  const description = `${formatSchoolDate(day.date)}: ${statusKeys.map((key, i) => `${formatCount(day[key])} ${statuses[i].label.toLowerCase()}`).join(', ')}, ${formatCount(day.staffCount)} total staff`;
                  return (
                    <Tooltip key={day.date} title={description}>
                      <ButtonBase
                        onClick={() => onDate(day.date)}
                        aria-label={description}
                        aria-pressed={day.date === date}
                        sx={{
                          minWidth: 0,
                          minHeight: 44,
                          p: 0.25,
                          display: 'flex',
                          flexDirection: 'column',
                          color: 'text.primary',
                          border: 1,
                          borderColor: day.date === date ? 'primary.main' : 'transparent',
                          bgcolor: day.date === date ? 'action.selected' : 'transparent',
                          borderRadius: 1,
                          '&.Mui-focusVisible': {
                            outline: '2px solid',
                            outlineColor: 'primary.main',
                            outlineOffset: 2,
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1.4 }}
                        >
                          {formatCount(day.present)} / {formatCount(day.staffCount)}
                        </Typography>
                      </ButtonBase>
                    </Tooltip>
                  );
                })}
              </Box>
              <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5 }}>
                Present / total staff. Select a day to view its attendance.
              </Typography>
              <Stack direction="row" flexWrap="wrap" useFlexGap gap={1.25} sx={{ mt: 1.5 }}>
                {statusKeys.map((key, i) => (
                  <Stack key={key} direction="row" gap={0.5} alignItems="center">
                    <Box
                      aria-hidden="true"
                      sx={{ width: 8, height: 8, borderRadius: 0.25, bgcolor: colours[i] }}
                    />
                    <Typography variant="caption">
                      {statuses[i].label} <strong>{formatCount(data.summary![key])}</strong>
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
                {formatSchoolDate(date)} · Daily counts in your permitted scope. Not marked means
                attendance has not been recorded.
              </Typography>
              {data.summary.needsSetup + data.summary.needsReview > 0 && (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.75 }}>
                  <Iconify icon="mdi:alert-circle-outline" width={16} aria-hidden="true" />
                  <Typography variant="caption" color="text.primary">
                    {formatCount(data.summary.needsSetup)} need setup ·{' '}
                    {formatCount(data.summary.needsReview)} need review
                  </Typography>
                </Stack>
              )}
            </>
          )}
        </Paper>
      )}
      {canViewPayroll && (
        <Paper
          component="section"
          aria-label="Payroll progress"
          variant="outlined"
          sx={sectionStyle}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify
                icon="mdi:wallet-outline"
                width={20}
                sx={{ color: 'text.secondary' }}
                aria-hidden="true"
              />
              <Typography variant="h6" component="h2">
                Payroll progress
              </Typography>
            </Stack>
            {!data ? (
              <Skeleton variant="rounded" height={260} />
            ) : data.payrollState !== 'Available' || !payroll ? (
              <Alert severity="info">Payroll progress is unavailable. Refresh to retry.</Alert>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary">
                  {new Intl.DateTimeFormat('en-IN', {
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'Asia/Kolkata',
                  }).format(new Date(`${payroll.month}-01T00:00:00+05:30`))}
                </Typography>
                <Box>
                  <Typography
                    variant="h4"
                    component="p"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatCount(completed)}{' '}
                    <Typography component="span" variant="h6" color="text.secondary">
                      of {formatCount(payroll.savedStaffCount)}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    staff reviewed or locked
                  </Typography>
                </Box>
                {payroll.savedStaffCount ? (
                  <LinearProgress
                    variant="determinate"
                    value={(completed / payroll.savedStaffCount) * 100}
                    aria-label="Saved payroll reviewed or locked"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No saved payroll records for this month.
                  </Typography>
                )}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  useFlexGap
                  flexWrap="wrap"
                  gap={1}
                  sx={{ py: 1.5, borderTop: 1, borderBottom: 1, borderColor: 'divider' }}
                >
                  {[
                    ['Reviewed', payroll.reviewedCount],
                    ['Locked', payroll.lockedCount],
                    ['Pending', payroll.pendingCount],
                  ].map(([label, count]) => (
                    <Box key={String(label)}>
                      <Typography variant="h6" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatCount(Number(count))}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {payroll.lastUpdatedAt
                    ? `Saved ${formatUpdatedAt(payroll.lastUpdatedAt)} IST`
                    : 'No saved timestamp'}
                </Typography>
              </>
            )}
            {canOpenPayroll && payroll && (
              <Button
                component={RouterLink}
                href={`${hrPaths.payroll.runPayroll}?month=${payroll.month}`}
                size="small"
                variant="outlined"
                endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
                sx={{ alignSelf: 'flex-start' }}
              >
                Open Payroll
              </Button>
            )}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}

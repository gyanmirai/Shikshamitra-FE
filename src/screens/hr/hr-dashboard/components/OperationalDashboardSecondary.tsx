'use client';

import type { OperationalOverview } from 'src/redux/hr/hrOperationalDashboardApi';

import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import {
  Box,
  Paper,
  Stack,
  Alert,
  TextField,
  Typography,
  useMediaQuery,
  LinearProgress,
} from '@mui/material';

import {
  PayrollSkeleton,
  DashboardSkeleton,
  AttendanceSkeleton,
} from './OperationalDashboardSkeletons';
import {
  indiaToday,
  dailyStatus,
  formatCount,
  formatUpdatedAt,
  formatSchoolDate,
  getPayrollGuidance,
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
};

export default function OperationalDashboardSecondary({
  data,
  date,
  onDate,
  canViewAttendance,
  canViewPayroll,
}: Props) {
  const theme = useTheme();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const trend = data?.trend || [];
  const statuses = Object.values(dailyStatus);
  const chartOptions = useChart({
    chart: { height: 210, animations: { enabled: !reducedMotion } },
    highcharts: {
      accessibility: { enabled: false },
      chart: { animation: !reducedMotion },
      yAxis: { title: { text: null } },
      plotOptions: {
        series: { animation: !reducedMotion },
        column: { dataLabels: { enabled: false } },
      },
    },
    colors: [theme.palette.primary.main],
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
  const series = [{ name: 'Present', data: trend.map((day) => day.present) }];
  const payroll = data?.payroll;
  const completed = payroll ? payroll.reviewedCount + payroll.lockedCount : 0;
  const payrollGuidance = getPayrollGuidance(data?.payrollState, payroll);
  const sectionStyle = { p: 2, borderRadius: 2, minWidth: 0 };

  return (
    <Box
      sx={{
        display: 'grid',
        alignItems: 'stretch',
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
          aria-busy={!data}
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
          </Stack>
          {!data ? (
            <AttendanceSkeleton />
          ) : data.attendanceState !== 'Available' || !data.summary || !data.trend ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Attendance summary is unavailable. Refresh to retry.
            </Alert>
          ) : (
            <>
              <Typography
                variant="h4"
                component="p"
                sx={{ mt: 2, fontVariantNumeric: 'tabular-nums' }}
              >
                {formatCount(data.summary.present)}{' '}
                <Typography component="span" variant="body2" color="text.secondary">
                  / {formatCount(data.summary.staffCount)} staff present
                </Typography>
              </Typography>
              <Box sx={{ mt: 1 }} aria-hidden="true">
                <Chart type="bar" series={series} options={chartOptions} height={210} />
              </Box>
              <Box
                component="ul"
                aria-label="Daily present staff counts"
                sx={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  p: 0,
                  m: 0,
                  overflow: 'hidden',
                  clipPath: 'inset(50%)',
                }}
              >
                {trend.map((day) => (
                  <li key={day.date}>
                    {formatSchoolDate(day.date)}: {formatCount(day.present)} of{' '}
                    {formatCount(day.staffCount)} staff present
                  </li>
                ))}
              </Box>
              <Box
                component="dl"
                aria-label="Selected day attendance summary"
                sx={{
                  m: 0,
                  display: 'flex',
                  flexWrap: 'wrap',
                  columnGap: 2,
                  rowGap: 0.75,
                  pt: 1.5,
                  borderTop: 1,
                  borderColor: 'divider',
                }}
              >
                {statusKeys.slice(1).map((key, i) => (
                  <Box key={key} sx={{ display: 'flex', gap: 0.5 }}>
                    <Typography component="dt" variant="caption" color="text.secondary">
                      {statuses[i + 1].label}:
                    </Typography>
                    <Typography
                      component="dd"
                      variant="caption"
                      sx={{ m: 0, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatCount(data.summary![key])}
                    </Typography>
                  </Box>
                ))}
              </Box>
              {data.summary.needsReview > 0 && (
                <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
                  Needs review: {formatCount(data.summary.needsReview)} staff · May overlap the
                  counts above.
                </Typography>
              )}
            </>
          )}
        </Paper>
      )}
      {canViewPayroll && (
        <Paper
          component="section"
          aria-label="Payroll progress"
          aria-busy={!data}
          variant="outlined"
          sx={{ ...sectionStyle, display: 'flex', flexDirection: 'column' }}
        >
          <Stack spacing={1.5} useFlexGap sx={{ flex: 1 }}>
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
              <PayrollSkeleton />
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
                {payrollGuidance && (
                  <Box sx={{ minHeight: { xs: 72, sm: 50 } }}>
                    {payrollGuidance.color === 'info' ? (
                      <Label color="info" sx={{ color: 'text.primary' }}>
                        Review pending
                      </Label>
                    ) : null}
                    <Typography
                      variant="body2"
                      sx={{ mt: payrollGuidance.color === 'info' ? 0.5 : 0 }}
                    >
                      {payrollGuidance.message}
                    </Typography>
                  </Box>
                )}
                {payroll.savedStaffCount ? (
                  <LinearProgress
                    variant="determinate"
                    value={(completed / payroll.savedStaffCount) * 100}
                    aria-label="Saved payroll reviewed or locked"
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                ) : null}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: 1.5,
                    pt: 1.5,
                    borderTop: 1,
                    borderColor: 'divider',
                  }}
                >
                  {[
                    ['Reviewed', payroll.reviewedCount],
                    ['Locked', payroll.lockedCount],
                    ['Pending', payroll.pendingCount],
                  ].map(([label, count]) => (
                    <Box key={String(label)}>
                      <Typography
                        component="p"
                        variant="h6"
                        sx={{ fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}
                      >
                        {formatCount(Number(count))}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
            {(!data || (data.payrollState === 'Available' && payroll)) && (
              <Stack
                spacing={1.5}
                sx={{ mt: 'auto', pt: 1.5, borderTop: 1, borderColor: 'divider' }}
              >
                {!data ? (
                  <DashboardSkeleton aria-hidden="true" variant="text" width="65%" height={18} />
                ) : data.payrollState === 'Available' && payroll ? (
                  <Typography variant="caption" color="text.secondary">
                    Based on saved payroll records ·{' '}
                    {payroll?.lastUpdatedAt
                      ? `Saved ${formatUpdatedAt(payroll.lastUpdatedAt)} IST`
                      : 'No saved timestamp'}
                  </Typography>
                ) : null}
              </Stack>
            )}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}

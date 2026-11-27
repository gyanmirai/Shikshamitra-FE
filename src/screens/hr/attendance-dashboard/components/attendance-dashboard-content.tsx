'use client';

import type { AttendanceDashboard } from 'src/redux/hr/hrOperationalDashboardApi';

import Link from 'next/link';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import {
  Box,
  Stack,
  Paper,
  Alert,
  Button,
  Divider,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  dailyStatus,
  formatCount,
  attendanceHref,
  formatSchoolDate,
} from 'src/screens/hr/hr-dashboard/operational-dashboard-state';

const tiles = [
  { key: 'present', label: 'Present', icon: 'mdi:account-check-outline', color: 'success.main' },
  {
    key: 'notMarked',
    label: 'Not marked',
    icon: 'mdi:clipboard-text-clock-outline',
    color: 'warning.main',
  },
  { key: 'onLeave', label: 'On leave', icon: 'mdi:calendar-minus-outline', color: 'info.main' },
  { key: 'absent', label: 'Absent', icon: 'mdi:account-off-outline', color: 'error.main' },
] as const;

const supportingStatuses = [
  { key: 'halfDay', label: 'Half day' },
  { key: 'notScheduled', label: 'Not scheduled' },
  { key: 'needsSetup', label: 'Needs setup' },
] as const;

const trendMetrics = tiles.filter(({ key }) => key !== 'onLeave');

function AttendanceTrend({ data }: { data: AttendanceDashboard }) {
  const theme = useTheme();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const available = data.trend.filter((day) => !data.unavailableDates.includes(day.date));
  const hasStaff = available.some((day) => day.staffCount > 0);
  const series = trendMetrics.map(({ key, label }) => ({
    name: label,
    data: data.trend.map((day) => (data.unavailableDates.includes(day.date) ? null : day[key])),
  }));
  const options = useChart({
    colors: [theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main],
    chart: { animations: { enabled: !reducedMotion } },
    highcharts: {
      accessibility: { enabled: false },
      chart: { animation: !reducedMotion },
      plotOptions: { series: { animation: !reducedMotion } },
      yAxis: { title: { text: null } },
    },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: { show: true, position: 'bottom' },
    xaxis: {
      categories: data.trend.map((day) =>
        formatSchoolDate(day.date).split(' ').slice(0, 2).join(' ')
      ),
    },
    yaxis: { min: 0, decimalsInFloat: 0 },
    tooltip: { shared: true, intersect: false },
  });

  return (
    <Paper
      component="section"
      aria-labelledby="attendance-trend"
      variant="outlined"
      sx={{ p: 2, minWidth: 0 }}
    >
      <Typography id="attendance-trend" component="h2" variant="h6">
        Seven-Day Attendance
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
        {formatSchoolDate(data.trend[0].date)} to {formatSchoolDate(data.summary.date)}
      </Typography>
      {hasStaff ? (
        <>
          <Box aria-hidden="true" sx={{ mt: 1.5 }}>
            <Chart type="bar" series={series} options={options} height={250} />
          </Box>
          <Box component="details" sx={{ mt: 1 }}>
            <Typography
              component="summary"
              variant="body2"
              sx={{ cursor: 'pointer', width: 'fit-content', py: 1 }}
            >
              View daily counts
            </Typography>
            <Stack component="ul" spacing={0.75} sx={{ pl: 3, my: 1 }}>
              {data.trend.map((day) => (
                <Typography component="li" variant="body2" key={day.date}>
                  {formatSchoolDate(day.date)}
                  {' · '}
                  {data.unavailableDates.includes(day.date)
                    ? 'Academic year unavailable'
                    : trendMetrics
                        .map(({ key, label }) => `${formatCount(day[key])} ${label.toLowerCase()}`)
                        .join(', ')}
                </Typography>
              ))}
            </Stack>
          </Box>
        </>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          {available.length
            ? 'No eligible staff on the available dates.'
            : 'No academic year could be resolved for this period.'}
        </Alert>
      )}
      {hasStaff && data.unavailableDates.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          Dates without a resolved academic year are omitted from the chart.
        </Typography>
      )}
    </Paper>
  );
}

function AttendanceReview({
  data,
  canTrack,
  registerHref,
}: {
  data: AttendanceDashboard;
  canTrack: boolean;
  registerHref?: string;
}) {
  const { summary, review } = data;
  const canViewNames = canTrack && review !== undefined;
  const unavailable = data.unavailableDates.includes(summary.date);

  return (
    <Paper
      component="section"
      aria-labelledby="attendance-review"
      variant="outlined"
      sx={{ p: 2, minWidth: 0 }}
    >
      <Stack
        direction="row"
        gap={1}
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
      >
        <Typography id="attendance-review" component="h2" variant="h6">
          Needs Review
        </Typography>
        {canViewNames && registerHref && !unavailable && (
          <Button component={Link} size="small" href={registerHref} sx={{ minHeight: 44 }}>
            Open register
          </Button>
        )}
      </Stack>
      {unavailable ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Review is unavailable for this date.
        </Typography>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {summary.staffCount === 0
              ? 'Review applies to eligible staff on the selected date.'
              : summary.needsReview === 0
                ? 'No staff records have review flags for this date.'
                : `${formatCount(summary.needsReview)} of ${formatCount(summary.staffCount)} staff have review flags.`}
          </Typography>
          {summary.needsReview > 0 && canViewNames && (
            <>
              <Stack
                component="ul"
                divider={<Divider flexItem />}
                sx={{ listStyle: 'none', m: 0, mt: 1, p: 0 }}
              >
                {review.map((row) => (
                  <Box component="li" key={row.employeeId} sx={{ py: 1 }}>
                    <Stack
                      direction="row"
                      gap={1}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Button
                        component={Link}
                        href={attendanceHref(row.employeeId, summary.date)}
                        aria-label={`View attendance for ${row.name}`}
                        size="small"
                        sx={{
                          justifyContent: 'flex-start',
                          minWidth: 0,
                          minHeight: 44,
                          px: 0,
                          textAlign: 'left',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {row.name}
                      </Button>
                      <Label color={dailyStatus[row.status].color} sx={{ flexShrink: 0 }}>
                        {dailyStatus[row.status].label}
                      </Label>
                    </Stack>
                    {row.flags.map((flag) => (
                      <Typography
                        key={flag.code}
                        variant="caption"
                        color="text.secondary"
                        component="p"
                      >
                        {flag.message}
                      </Typography>
                    ))}
                  </Box>
                ))}
              </Stack>
              {summary.needsReview > review.length && (
                <Typography variant="caption" color="text.secondary">
                  Showing {review.length} of {formatCount(summary.needsReview)} flagged staff.
                </Typography>
              )}
            </>
          )}
          {summary.needsReview > 0 && !canViewNames && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Individual records are available to staff with Attendance Tracking access.
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
}

export function AttendanceDashboardContent({
  data,
  canTrack,
  registerHref,
}: {
  data: AttendanceDashboard;
  canTrack: boolean;
  registerHref?: string;
}) {
  const { summary } = data;
  const unavailable = data.unavailableDates.includes(summary.date);

  return (
    <>
      <Stack component="section" aria-labelledby="attendance-summary" spacing={1.25}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
          flexWrap="wrap"
          gap={0.75}
        >
          <Typography id="attendance-summary" component="h2" variant="h6">
            Daily Status
          </Typography>
          {!unavailable && (
            <Typography variant="body2" color="text.secondary">
              {formatCount(summary.staffCount)} eligible staff
            </Typography>
          )}
        </Stack>
        {unavailable ? (
          <Alert severity="info">
            Staff scope could not be resolved for this date because the academic year is missing or
            overlaps another year.
          </Alert>
        ) : summary.staffCount === 0 ? (
          <Alert severity="info">No eligible staff in your scope for this date.</Alert>
        ) : (
          <>
            <Box
              component="dl"
              sx={{
                m: 0,
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(4, minmax(0, 1fr))',
                },
                gap: { xs: 1, sm: 2 },
              }}
            >
              {tiles.map(({ key, label, icon, color }) => (
                <Paper
                  key={key}
                  component="div"
                  variant="outlined"
                  sx={{ p: { xs: 1.25, sm: 2 }, minWidth: 0 }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                    <Typography component="dt" variant="subtitle2" color="text.secondary">
                      {key === 'notMarked' && summary.date === data.asOfDate
                        ? 'Not marked yet'
                        : label}
                    </Typography>
                    <Iconify icon={icon} width={22} aria-hidden sx={{ color, flexShrink: 0 }} />
                  </Stack>
                  <Typography
                    component="dd"
                    variant="h3"
                    sx={{ m: 0, mt: 0.75, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatCount(summary[key])}
                  </Typography>
                </Paper>
              ))}
            </Box>
            <Stack
              component="dl"
              direction="row"
              useFlexGap
              flexWrap="wrap"
              gap={{ xs: 1, sm: 2.5 }}
              sx={{ m: 0, px: 1 }}
            >
              {supportingStatuses.map(({ key, label }) => (
                <Stack component="div" key={key} direction="row" alignItems="baseline" gap={0.75}>
                  <Typography component="dt" variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography component="dd" variant="subtitle2" sx={{ m: 0 }}>
                    {formatCount(summary[key])}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </>
        )}
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.5fr) minmax(0, 1fr)' },
          alignItems: 'start',
          gap: 2,
        }}
      >
        <AttendanceTrend data={data} />
        <AttendanceReview data={data} canTrack={canTrack} registerHref={registerHref} />
      </Box>
    </>
  );
}

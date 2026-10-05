'use client';

import type { OperationalOverview } from 'src/redux/hr/hrOperationalDashboardApi';

import { hrPaths } from 'src/constants/hr-menus';
import { RouterLink } from 'src/routes/components';
import {
  Box,
  Card,
  Stack,
  Alert,
  Table,
  Button,
  Tooltip,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  ToggleButton,
  TableContainer,
  ToggleButtonGroup,
} from '@mui/material';

import {
  dailyStatus,
  formatCount,
  formatUpdatedAt,
  formatSchoolDate,
} from '../operational-dashboard-state';

type Props = {
  data: OperationalOverview;
  canViewPayroll: boolean;
  canOpenPayroll: boolean;
  canViewAttendance: boolean;
  trendView: 'chart' | 'counts';
  onView: (view: 'chart' | 'counts') => void;
  onDate: (date: string) => void;
};

export default function OperationalDashboardSecondary(props: Props) {
  const { data, canViewPayroll, canOpenPayroll, canViewAttendance, trendView, onView, onDate } =
    props;
  const chartColors = {
    present: 'success.main',
    absent: 'error.main',
    onLeave: 'info.main',
    halfDay: 'warning.main',
    notMarked: 'action.disabled',
    notScheduled: 'action.hover',
    needsSetup: 'warning.light',
  };
  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: canViewPayroll ? 'minmax(0, 1.7fr) minmax(0, 1fr)' : '1fr',
          },
          gap: 2.5,
        }}
      >
        {canViewAttendance && data.trend ? (
          <Card
            component="section"
            aria-label="Seven-day staff attendance"
            sx={{ p: 2.5, minWidth: 0 }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
            >
              <Typography variant="h6" component="h2">
                Seven-day attendance
              </Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={trendView}
                onChange={(_, next) => {
                  if (next) onView(next);
                }}
                aria-label="Attendance trend view"
              >
                <ToggleButton value="chart">Chart</ToggleButton>
                <ToggleButton value="counts">Counts</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Daily counts for eligible staff in the selected filters.
            </Typography>
            {trendView === 'counts' ? (
              <TableContainer
                tabIndex={0}
                role="region"
                aria-label="Seven-day attendance counts, scroll horizontally for all statuses"
                sx={{
                  mt: 2,
                  overflowX: 'auto',
                  '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
                }}
              >
                <Table size="small" aria-label="Seven-day attendance counts" sx={{ minWidth: 790 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      {Object.values(dailyStatus).map((item) => (
                        <TableCell key={item.label} align="right">
                          {item.label}
                        </TableCell>
                      ))}
                      <TableCell align="right">Total staff</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.trend.map((day) => (
                      <TableRow key={day.date} selected={day.date === data.date}>
                        <TableCell component="th" scope="row">
                          <Button
                            size="small"
                            onClick={() => onDate(day.date)}
                            aria-label={`View ${formatSchoolDate(day.date)}`}
                            aria-pressed={day.date === data.date}
                          >
                            {formatSchoolDate(day.date)}
                          </Button>
                        </TableCell>
                        {Object.keys(chartColors).map((key) => (
                          <TableCell
                            key={key}
                            align="right"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {formatCount(Number(day[key as keyof typeof day]))}
                          </TableCell>
                        ))}
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatCount(day.staffCount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <>
                <Stack spacing={0.75} sx={{ mt: 2 }}>
                  {data.trend.map((day) => {
                    const description = `${formatSchoolDate(day.date)}: ${day.present} present, ${day.absent} absent, ${day.onLeave} on leave, ${day.halfDay} half day, ${day.notMarked} not marked, ${day.notScheduled} not scheduled, ${day.needsSetup} need setup, ${day.staffCount} total staff`;
                    return (
                      <Tooltip key={day.date} title={description}>
                        <Box
                          component="button"
                          onClick={() => onDate(day.date)}
                          aria-label={`View ${description}`}
                          aria-pressed={day.date === data.date}
                          sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                            width: 1,
                            p: 0.75,
                            border: 1,
                            borderColor: day.date === data.date ? 'primary.main' : 'transparent',
                            borderRadius: 0.75,
                            bgcolor: day.date === data.date ? 'action.selected' : 'transparent',
                            color: 'text.primary',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                            '&:focus-visible': {
                              outline: '2px solid',
                              outlineColor: 'primary.main',
                              outlineOffset: 2,
                            },
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ flex: '0 0 44px', textAlign: 'left' }}
                          >
                            {formatSchoolDate(day.date).split(' ').slice(0, 2).join(' ')}
                          </Typography>
                          <Stack
                            direction="row"
                            sx={{
                              flex: 1,
                              height: 14,
                              overflow: 'hidden',
                              borderRadius: 0.5,
                              bgcolor: 'action.hover',
                            }}
                          >
                            {Object.entries(chartColors).map(([key, color]) => (
                              <Box
                                key={key}
                                sx={{
                                  width: `${day.staffCount ? (Number(day[key as keyof typeof day]) / day.staffCount) * 100 : 0}%`,
                                  bgcolor: color,
                                }}
                              />
                            ))}
                          </Stack>
                          <Typography
                            variant="caption"
                            sx={{
                              textAlign: 'right',
                              fontVariantNumeric: 'tabular-nums',
                              flex: '0 0 104px',
                            }}
                          >
                            {formatCount(day.present)} present / {formatCount(day.staffCount)} total
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Stack>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} sx={{ mt: 2 }}>
                  {Object.entries(dailyStatus).map(([status, item]) => (
                    <Stack key={status} direction="row" spacing={0.5} alignItems="center">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: 0.25,
                          bgcolor:
                            chartColors[
                              `${status[0].toLowerCase()}${status.slice(1)}` as keyof typeof chartColors
                            ],
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </>
            )}
          </Card>
        ) : null}
        {canViewPayroll ? (
          <Card component="section" aria-label="Payroll cycle" sx={{ p: 2.5 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" component="h2">
                Payroll cycle
              </Typography>
              {data.payrollState !== 'Available' || !data.payroll ? (
                <Alert severity="info">Payroll cycle data is unavailable.</Alert>
              ) : (
                <>
                  <Typography variant="subtitle2">
                    {new Intl.DateTimeFormat('en-IN', {
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'Asia/Kolkata',
                    }).format(new Date(`${data.payroll.month}-01T00:00:00+05:30`))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {data.payroll.savedStaffCount
                      ? `${formatCount(data.payroll.savedStaffCount)} staff in the saved payroll preview.`
                      : 'No saved payroll preview for this month.'}
                  </Typography>
                  <Divider />
                  {[
                    ['Reviewed', data.payroll.reviewedCount],
                    ['Locked', data.payroll.lockedCount],
                    ['Pending review', data.payroll.pendingCount],
                  ].map(([label, value]) => (
                    <Stack direction="row" key={String(label)} justifyContent="space-between">
                      <Typography variant="body2">{label}</Typography>
                      <Typography variant="subtitle2">{formatCount(Number(value))}</Typography>
                    </Stack>
                  ))}
                  {data.payroll.lastUpdatedAt ? (
                    <Typography variant="caption" color="text.secondary">
                      Saved {formatUpdatedAt(data.payroll.lastUpdatedAt)} IST
                    </Typography>
                  ) : null}
                </>
              )}
              {canOpenPayroll ? (
                <Button
                  component={RouterLink}
                  href={`${hrPaths.payroll.runPayroll}?month=${data.date.slice(0, 7)}`}
                  variant="outlined"
                  size="small"
                >
                  Open payroll
                </Button>
              ) : null}
            </Stack>
          </Card>
        ) : null}
      </Box>
    </Stack>
  );
}

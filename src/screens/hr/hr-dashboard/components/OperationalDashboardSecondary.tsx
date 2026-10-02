'use client';

import type { OperationalOverview } from 'src/redux/hr/hrOperationalDashboardApi';

import { hrPaths } from 'src/constants/hr-menus';
import { RouterLink } from 'src/routes/components';
import { Box, Card, Stack, Alert, Button, Tooltip, Divider, Typography } from '@mui/material';

import {
  dailyStatus,
  formatCount,
  formatSchoolDate,
  formatSchoolTime,
} from '../operational-dashboard-state';

type Props = {
  data: OperationalOverview;
  canViewStaff: boolean;
  canViewLeave: boolean;
  canViewPayroll: boolean;
  canOpenPayroll: boolean;
  canViewAttendance: boolean;
  onStatus: (status: string) => void;
  onDate: (date: string) => void;
};

export default function OperationalDashboardSecondary(props: Props) {
  const {
    data,
    canViewStaff,
    canViewLeave,
    canViewPayroll,
    canOpenPayroll,
    canViewAttendance,
    onStatus,
    onDate,
  } = props;
  const attention = data.attention.filter((item) =>
    item.kind === 'Leave' ? canViewLeave : canViewAttendance
  );
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
      <Card component="section" aria-label="Needs attention" sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Typography variant="h6" component="h2">
            Needs attention
          </Typography>
          {attention.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {data.attendanceState === 'Available'
                ? 'No outstanding items in the available dashboard sections.'
                : 'Attention items are unavailable for your current access or data state.'}
            </Typography>
          ) : (
            attention.map((item) => (
              <Stack
                key={item.kind}
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2">{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCount(item.count)}{' '}
                    {item.kind === 'Leave'
                      ? 'pending requests now'
                      : 'staff in the selected date and scope'}
                  </Typography>
                </Box>
                {item.action === 'Leave' ? (
                  <Button
                    component={RouterLink}
                    href={hrPaths.leaveManagement.approvals}
                    size="small"
                  >
                    Open requests
                  </Button>
                ) : canViewStaff ? (
                  <Button size="small" onClick={() => onStatus(item.action)}>
                    View staff
                  </Button>
                ) : null}
              </Stack>
            ))
          )}
          {canViewLeave && ['Failed', 'Unavailable'].includes(data.leaveState) ? (
            <Alert severity="info">
              Pending leave requests are unavailable. Open Leave Center to review your access and
              requests.
            </Alert>
          ) : null}
        </Stack>
      </Card>
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
            <Typography variant="h6" component="h2">
              Staff attendance over seven days
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Daily staff counts, using each date’s eligible staff and calendar.
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {data.trend.map((day) => (
                <Tooltip
                  key={day.date}
                  title={`${formatSchoolDate(day.date)}: ${day.present} present, ${day.absent} absent, ${day.onLeave} on leave, ${day.halfDay} half day, ${day.notMarked} not marked, ${day.notScheduled} not scheduled, ${day.needsSetup} need setup`}
                >
                  <Box
                    component="button"
                    onClick={() => onDate(day.date)}
                    aria-label={`View ${formatSchoolDate(day.date)}: ${day.present} present, ${day.absent} absent, ${day.onLeave} on leave, ${day.halfDay} half day, ${day.notMarked} not marked, ${day.notScheduled} not scheduled, ${day.needsSetup} need setup`}
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      alignItems: 'center',
                      width: 1,
                      py: 0.5,
                      px: 0,
                      border: 0,
                      bgcolor: 'transparent',
                      color: 'text.primary',
                      cursor: 'pointer',
                      '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        outlineOffset: 3,
                      },
                    }}
                  >
                    <Typography variant="caption" sx={{ flex: '0 0 56px', textAlign: 'left' }}>
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
                    <Typography variant="caption" sx={{ minWidth: 24, textAlign: 'right' }}>
                      {formatCount(day.staffCount)}
                    </Typography>
                  </Box>
                </Tooltip>
              ))}
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
                      Saved {formatSchoolDate(data.payroll.lastUpdatedAt.slice(0, 10))} at{' '}
                      {formatSchoolTime(data.payroll.lastUpdatedAt)} IST
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

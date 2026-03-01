'use client';

import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

import { DashboardWidgetWrapper } from '../component/dashboard-widget-wrapper';

// ----------------------------------------------------------------------

const TODAY_EVENTS = [
  { title: 'Parent-Teacher Meeting', time: '10:00 AM', location: 'Hall A' },
  { title: 'Science Fair Exhibition', time: '2:00 PM', location: 'Lab Block' },
  { title: 'Staff Weekly Briefing', time: '4:30 PM', location: 'Conference Room' },
];

const UPCOMING_HOLIDAYS = [
  { title: 'Republic Day', date: 'Jan 26', type: 'National' },
  { title: 'Holi', date: 'Mar 14', type: 'National' },
  { title: 'Easter', date: 'Apr 20', type: 'Religious' },
];

const EXAMS_TODAY = [
  { subject: 'Mathematics', class: '10-A', time: '8:00 AM', room: '101' },
  { subject: 'Physics', class: '12-B', time: '10:30 AM', room: '204' },
  { subject: 'Chemistry', class: '11-C', time: '2:00 PM', room: '103' },
];

const TRANSPORT_ALERTS = [
  {
    route: 'Route 3 – Sector 14',
    issue: 'Vehicle delayed by 20 mins',
    severity: 'warning' as const,
  },
  { route: 'Route 7 – Anand Nagar', issue: 'Driver absent today', severity: 'error' as const },
  { route: 'Route 11 – Main Street', issue: 'GPS tracker offline', severity: 'info' as const },
];

const QUICK_ACTIONS = [
  { label: 'Create Event / Holiday', icon: 'solar:calendar-add-bold', color: 'primary' },
  { label: 'Generate Fee Invoice', icon: 'solar:bill-list-bold', color: 'success' },
  { label: 'Upload Staff Documents', icon: 'solar:document-add-bold', color: 'info' },
  { label: 'System Configuration', icon: 'solar:settings-bold', color: 'warning' },
  { label: 'Send Announcement', icon: 'solar:megaphone-bold', color: 'error' },
  { label: 'Add New Staff', icon: 'solar:user-plus-bold', color: 'secondary' },
];

const SYSTEM_ALERTS = [
  {
    title: 'Failed Payments',
    desc: '4 transactions failed this morning',
    time: '10 mins ago',
    color: 'error',
  },
  {
    title: 'Unassigned Teachers',
    desc: '3 classes need teachers for Period 4',
    time: '25 mins ago',
    color: 'warning',
  },
  {
    title: 'Certificate Expiry',
    desc: '5 vehicle permits expire this week',
    time: '1 hour ago',
    color: 'info',
  },
  {
    title: 'Low Stock – Books',
    desc: 'Library inventory below threshold',
    time: '2 hours ago',
    color: 'success',
  },
];

// ----------------------------------------------------------------------

const AdminLists = () => (
  <Grid container spacing={2}>
    {/* ── Today's Events ──────────────────────────────────── */}
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <DashboardWidgetWrapper
        title="Today's Events"
        subheader={`${TODAY_EVENTS.length} events scheduled`}
      >
        <Stack spacing={1.5}>
          {TODAY_EVENTS.map((ev, i) => (
            <Box key={i} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.neutral' }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Stack spacing={0.25}>
                  <Typography variant="subtitle2">{ev.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ev.time} &middot; {ev.location}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      </DashboardWidgetWrapper>
    </Grid>

    {/* ── Upcoming Holidays ───────────────────────────────── */}
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <DashboardWidgetWrapper title="Upcoming Holidays" subheader="School holiday schedule">
        <Stack spacing={1.5}>
          {UPCOMING_HOLIDAYS.map((h, i) => (
            <Box key={i} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.neutral' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={0.25}>
                  <Typography variant="subtitle2">{h.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {h.type} Holiday
                  </Typography>
                </Stack>
                <Chip label={h.date} size="small" color="primary" />
              </Stack>
            </Box>
          ))}
        </Stack>
      </DashboardWidgetWrapper>
    </Grid>

    {/* ── Exams Today ─────────────────────────────────────── */}
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <DashboardWidgetWrapper
        title="Exams Today"
        subheader={`${EXAMS_TODAY.length} exams scheduled`}
      >
        <Stack spacing={1.5}>
          {EXAMS_TODAY.map((ex, i) => (
            <Box key={i} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.neutral' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={0.25}>
                  <Typography variant="subtitle2">{ex.subject}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ex.class} &middot; Room {ex.room}
                  </Typography>
                </Stack>
                <Chip label={ex.time} size="small" color="info" />
              </Stack>
            </Box>
          ))}
        </Stack>
      </DashboardWidgetWrapper>
    </Grid>

    {/* ── Transport Alerts ────────────────────────────────── */}
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <DashboardWidgetWrapper title="Transport Alerts" subheader="Vehicle issues & delays">
        <Stack spacing={1.5}>
          {TRANSPORT_ALERTS.map((alert, i) => (
            <Box key={i} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.neutral' }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: `${alert.severity}.main`,
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Stack spacing={0.25}>
                  <Typography variant="subtitle2">{alert.route}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {alert.issue}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      </DashboardWidgetWrapper>
    </Grid>

    {/* ── Quick Actions ────────────────────────────────────── */}
    <Grid size={{ xs: 12, md: 8 }}>
      <DashboardWidgetWrapper title="Quick Actions" subheader="Frequently used admin shortcuts">
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          }}
        >
          {QUICK_ACTIONS.map((action, index) => (
            <Button
              key={index}
              fullWidth
              variant="outlined"
              color="inherit"
              size="large"
              startIcon={<Iconify icon={action.icon} sx={{ color: `${action.color}.main` }} />}
              sx={{
                py: 1.5,
                borderRadius: '12px',
                borderStyle: 'dashed',
                justifyContent: 'flex-start',
                '&:hover': {
                  bgcolor: (t: any) =>
                    `rgba(${t.palette[action.color]?.mainChannel ?? '37 99 235'} / 0.05)`,
                  borderColor: `${action.color}.main`,
                },
              }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </DashboardWidgetWrapper>
    </Grid>

    {/* ── System Alerts ────────────────────────────────────── */}
    <Grid size={{ xs: 12, md: 4 }}>
      <DashboardWidgetWrapper title="System Alerts" subheader="Items requiring immediate attention">
        <Stack spacing={2}>
          {SYSTEM_ALERTS.map((alert, index) => (
            <Stack key={index} direction="row" spacing={2}>
              <Box
                sx={{
                  width: 4,
                  height: 44,
                  borderRadius: 1,
                  bgcolor: `${alert.color}.main`,
                  flexShrink: 0,
                }}
              />
              <Stack spacing={0.25} flexGrow={1}>
                <Typography variant="subtitle2">{alert.title}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {alert.desc}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {alert.time}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </DashboardWidgetWrapper>
    </Grid>
  </Grid>
);

export default AdminLists;

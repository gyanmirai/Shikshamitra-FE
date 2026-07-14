'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { hasGrantedPermission } from 'src/utils/permissions';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { academicPaths, academicPermissions } from 'src/constants/academic-menu';
import {
  useGetCalendarsQuery,
  useGetImpactLogsQuery,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';
import {
  Box,
  Card,
  Grid,
  Paper,
  Stack,
  Table,
  Button,
  Avatar,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  CardContent,
  TableContainer,
  LinearProgress,
} from '@mui/material';
import {
  CalendarStatus,
  CalendarImpactType,
  CalendarImpactStatus,
  CALENDAR_STATUS_LABELS,
  CALENDAR_STATUS_COLORS,
  CALENDAR_IMPACT_TYPE_LABELS,
  CALENDAR_IMPACT_STATUS_LABELS,
  CALENDAR_IMPACT_STATUS_COLORS,
} from 'src/enums/academic-calendar';

// ─── Mock data (shown when API returns empty) ─────────────────────────────────

const MOCK_PUBLISHED = {
  id: 'mock-cal-1',
  name: 'Academic Year 2025–26',
  startDate: '2025-06-01',
  endDate: '2026-03-31',
  status: CalendarStatus.Published,
  isDefault: true,
  totalWorkingDays: 220,
  totalHolidays: 15,
  totalVacationDays: 30,
  totalHalfDays: 4,
  totalEvents: 8,
  totalExamDays: 12,
  totalPtmDays: 3,
  totalEmergencyClosures: 1,
};

const MOCK_CALENDARS = {
  items: [
    MOCK_PUBLISHED,
    {
      id: 'mock-cal-2',
      name: 'Academic Year 2024–25',
      startDate: '2024-06-01',
      endDate: '2025-03-31',
      status: CalendarStatus.Archived,
      isDefault: false,
      totalWorkingDays: 218,
      totalHolidays: 17,
    },
    {
      id: 'mock-cal-3',
      name: 'Summer Term 2025',
      startDate: '2025-04-01',
      endDate: '2025-05-31',
      status: CalendarStatus.Draft,
      isDefault: false,
      totalWorkingDays: 42,
      totalHolidays: 2,
    },
  ],
  totalCount: 3,
};

const MOCK_IMPACT_LOGS = {
  items: [
    {
      id: 'imp-1',
      affectedDate: '2025-07-15',
      impactType: CalendarImpactType.TimetableSlot,
      affectedEntityName: 'Math — Class 10A',
      message: 'Timetable slot blocked due to Independence Day',
      status: CalendarImpactStatus.Pending,
    },
    {
      id: 'imp-2',
      affectedDate: '2025-07-15',
      impactType: CalendarImpactType.HomeworkDueDate,
      affectedEntityName: 'Science Assignment',
      message: 'Due date falls on holiday',
      status: CalendarImpactStatus.Pending,
    },
    {
      id: 'imp-3',
      affectedDate: '2025-08-10',
      impactType: CalendarImpactType.OnlineClass,
      affectedEntityName: 'English Online Session',
      message: 'Online class on school closure day',
      status: CalendarImpactStatus.Suggested,
    },
  ],
  totalCount: 3,
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  subtitle?: string;
  onClick?: () => void;
}

const StatCard = ({ label, value, icon, color, subtitle, onClick }: StatCardProps) => {
  const theme = useTheme();
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 2.5,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        boxShadow: `0 2px 8px ${alpha(theme.palette.grey[500], 0.04)}`,
        transition: 'all 0.2s ease',
        '&:hover': onClick
          ? {
              transform: 'translateY(-3px)',
              boxShadow: `0 6px 16px ${alpha(color, 0.12)}`,
              borderColor: alpha(color, 0.35),
              backgroundColor: alpha(color, 0.005),
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ color: theme.vars.palette.text.primary, lineHeight: 1.1, mb: 0.25 }}
            >
              {value}
            </Typography>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ lineHeight: 1.2, display: 'block' }}
              noWrap
            >
              {label}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              backgroundColor: alpha(color, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon={icon} width={18} sx={{ color }} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// ─── Quick Action Button ──────────────────────────────────────────────────────

const QuickAction = ({
  icon,
  label,
  color,
  onClick,
}: {
  icon: string;
  label: string;
  color: string;
  onClick: () => void;
}) => {
  const theme = useTheme();
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.75,
        p: 1.5,
        borderRadius: 2,
        border: `1.5px solid ${alpha(color, 0.15)}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          backgroundColor: alpha(color, 0.05),
          borderColor: alpha(color, 0.4),
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          backgroundColor: alpha(color, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Iconify icon={icon} width={22} sx={{ color }} />
      </Box>
      <Typography
        variant="caption"
        fontWeight={600}
        textAlign="center"
        color="text.secondary"
        sx={{ lineHeight: 1.3 }}
      >
        {label}
      </Typography>
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AcademicCalendarDashboard = () => {
  const router = useRouter();
  const theme = useTheme();
  const { permissions } = useSelector((state: RootState) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const canManage = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.management}.View`
  );
  const canViewImpact = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.impactLogs}.View`
  );
  const canDeclareEmergency = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.emergencyClosure}.View`
  );

  const { data: calendarsRaw, isLoading: calendarsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCalendarsQuery,
    params: { academicYearId: currentYear?.id },
    popupConfig: { error: false },
  });

  const { data: impactRaw, isLoading: impactLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetImpactLogsQuery,
    params: { status: CalendarImpactStatus.Pending, maxResultCount: 5 },
    popupConfig: { error: false },
  });

  const calendarsData = calendarsRaw ?? { items: [], totalCount: 0 };
  const impactLogsData = impactRaw ?? { items: [], totalCount: 0 };

  const publishedCalendar =
    calendarsData?.items?.find((c: any) => c.status === CalendarStatus.Published);

  // Year progress
  const yearStart = dayjs(publishedCalendar?.startDate);
  const yearEnd = dayjs(publishedCalendar?.endDate);
  const today = dayjs();
  const totalDays = yearEnd.diff(yearStart, 'day');
  const passedDays = Math.max(0, Math.min(totalDays, today.diff(yearStart, 'day')));
  const yearProgress = totalDays > 0 ? Math.round((passedDays / totalDays) * 100) : 0;

  const colors = {
    primary: theme.palette.primary.main,
    info: theme.palette.info.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
  };

  const STATS = [
    {
      label: 'Working Days',
      value: publishedCalendar?.totalWorkingDays ?? '—',
      icon: 'mdi:briefcase-check-outline',
      color: colors.primary,
      path: academicPaths.academicCalendar.management,
    },
    {
      label: 'Holidays',
      value: publishedCalendar?.totalHolidays ?? '—',
      icon: 'mdi:flag-outline',
      color: colors.primary,
      path: academicPaths.academicCalendar.management,
    },
    {
      label: 'Vacation Days',
      value: publishedCalendar?.totalVacationDays ?? '—',
      icon: 'mdi:beach',
      color: colors.primary,
      path: academicPaths.academicCalendar.management,
    },
    {
      label: 'Half Days',
      value: publishedCalendar?.totalHalfDays ?? '—',
      icon: 'mdi:clock-time-four-outline',
      color: colors.primary,
      path: academicPaths.academicCalendar.management,
    },
    {
      label: 'Events',
      value: publishedCalendar?.totalEvents ?? '—',
      icon: 'mdi:party-popper',
      color: colors.primary,
      path: academicPaths.academicCalendar.management,
    },
    {
      label: 'Exam Days',
      value: publishedCalendar?.totalExamDays ?? '—',
      icon: 'mdi:file-document-edit-outline',
      color: colors.primary,
      path: academicPaths.academicCalendar.management,
    },
    {
      label: 'PTM Days',
      value: publishedCalendar?.totalPtmDays ?? '—',
      icon: 'mdi:account-group-outline',
      color: colors.primary,
      path: academicPaths.academicCalendar.management,
    },
    {
      label: 'Emergency Closures',
      value: publishedCalendar?.totalEmergencyClosures ?? '—',
      icon: 'mdi:alert-octagon-outline',
      color: colors.error,
      path: academicPaths.academicCalendar.emergencyClosure,
    },
    {
      label: 'Pending Impact Logs',
      value: impactLogsData?.totalCount ?? '—',
      icon: 'mdi:alert-circle-outline',
      color: colors.warning,
      path: academicPaths.academicCalendar.impactLogs,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <CustomBreadcrumbs
        heading="Academic Calendar"
        description="Manage your school's academic year — holidays, vacations, events, and scheduling rules."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Academic Calendar' },
          { name: 'Dashboard' },
        ]}
        action={
          canManage && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon="mdi:calendar-edit-outline" />}
              onClick={() => router.push(academicPaths.academicCalendar.management)}
              sx={{ borderRadius: 2 }}
            >
              Manage Calendar
            </Button>
          )
        }
      />

      {/* ── Active Calendar Hero ─────────────────────────────────────── */}
      <Paper
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
        }}
      >
        <Box
          sx={{
            p: 2,
            backgroundColor:
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.primary.dark, 0.15)
                : alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Stack direction="row" alignItems="center" gap={1.75}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify
                icon="mdi:calendar-month"
                width={22}
                sx={{ color: theme.palette.primary.main }}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                }}
              >
                Active Calendar
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                color="text.primary"
                lineHeight={1.2}
              >
                {currentYear?.name || publishedCalendar?.name || 'Academic Calendar'}
              </Typography>
              <Typography
                variant="caption"
                display="block"
                sx={{ color: 'text.secondary', mt: 0.15 }}
              >
                {dayjs((currentYear as any)?.startDate || publishedCalendar?.startDate).format(
                  'DD MMM YYYY'
                )}{' '}
                —{' '}
                {dayjs((currentYear as any)?.endDate || publishedCalendar?.endDate).format(
                  'DD MMM YYYY'
                )}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Year Progress Bar */}
        <Box sx={{ px: 2, py: 1.5, backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Iconify icon="mdi:progress-clock" width={14} color="primary.main" />
              <Typography variant="caption" fontWeight={600} color="primary.main">
                Academic Year Progress
              </Typography>
            </Stack>
            <Typography variant="caption" fontWeight={700} color="primary.main">
              {yearProgress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={yearProgress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
              },
            }}
          />
          <Stack direction="row" justifyContent="space-between" mt={0.25}>
            <Typography variant="caption" color="text.secondary">
              {passedDays} days passed
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {totalDays - passedDays} days remaining
            </Typography>
          </Stack>
        </Box>
      </Paper>

      {/* ── Stats Grid ── */}
      <Grid container spacing={1.5} columns={10}>
        {STATS.map((stat) => (
          <Grid
            size={{ xs: 5, sm: 2, md: 2 }}
            key={stat.label}
            sx={{
              display: {
                xs: stat.label === 'PTM Days' || stat.label === 'Exam Days' ? 'none' : 'block',
                sm: 'block',
              },
            }}
          >
            <StatCard
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              onClick={() => router.push(stat.path)}
            />
          </Grid>
        ))}
      </Grid>

      {/* ── Bottom: Calendars + Pending Logs + Quick Actions ── */}
      <Grid container spacing={2}>
        {/* All Calendars */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              height: '100%',
              border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                background: alpha(theme.palette.primary.main, 0.03),
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" gap={1}>
                  <Iconify icon="mdi:calendar-multiple" width={18} color="primary.main" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    All Calendars
                  </Typography>
                </Stack>
                {canManage && (
                  <Button
                    size="small"
                    variant="text"
                    sx={{ fontSize: '12px' }}
                    endIcon={<Iconify icon="mdi:arrow-right" width={14} />}
                    onClick={() => router.push(academicPaths.academicCalendar.management)}
                  >
                    View All
                  </Button>
                )}
              </Stack>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: '11px',
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: '11px',
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Period
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: '11px',
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(calendarsData?.items ?? []).slice(0, 5).map((cal: any) => (
                    <TableRow
                      key={cal.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => router.push(academicPaths.academicCalendar.management)}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor:
                                cal.status === CalendarStatus.Published
                                  ? alpha(theme.palette.success.main, 0.15)
                                  : cal.status === CalendarStatus.Archived
                                    ? alpha(theme.palette.warning.main, 0.15)
                                    : alpha(theme.palette.grey[500], 0.15),
                              color:
                                cal.status === CalendarStatus.Published
                                  ? theme.palette.success.dark
                                  : cal.status === CalendarStatus.Archived
                                    ? theme.palette.warning.dark
                                    : theme.palette.grey[600],
                            }}
                          >
                            {cal.name.slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              noWrap
                              sx={{ maxWidth: 130 }}
                            >
                              {cal.name}
                            </Typography>
                            {cal.isDefault && (
                              <Label
                                variant="soft"
                                color="primary"
                                sx={{
                                  height: 14,
                                  fontSize: '9px',
                                  textTransform: 'uppercase',
                                  fontWeight: 700,
                                }}
                              >
                                Default
                              </Label>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(cal.startDate).format('MMM YY')} –{' '}
                          {dayjs(cal.endDate).format('MMM YY')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Label
                          variant="soft"
                          color={CALENDAR_STATUS_COLORS[cal.status as CalendarStatus] as any}
                          sx={{ textTransform: 'uppercase', fontWeight: 600 }}
                        >
                          {CALENDAR_STATUS_LABELS[cal.status as CalendarStatus]}
                        </Label>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Pending Impact Logs */}
        {canViewImpact && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                height: '100%',
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: `1px solid ${alpha(theme.palette.error.main, 0.12)}`,
                  background: alpha(theme.palette.error.main, 0.04),
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Iconify icon="mdi:alert-circle" width={18} color="error.main" />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Pending Impact Logs
                    </Typography>
                    {(impactLogsData?.totalCount ?? 0) > 0 && (
                      <Label
                        variant="soft"
                        color="error"
                        sx={{ height: 18, fontSize: '11px', fontWeight: 700 }}
                      >
                        {impactLogsData?.totalCount}
                      </Label>
                    )}
                  </Stack>
                  <Button
                    size="small"
                    variant="text"
                    color="error"
                    sx={{ fontSize: '12px' }}
                    endIcon={<Iconify icon="mdi:arrow-right" width={14} />}
                    onClick={() => router.push(academicPaths.academicCalendar.impactLogs)}
                  >
                    View All
                  </Button>
                </Stack>
              </Box>
              <Stack
                spacing={0}
                divider={<Box sx={{ borderBottom: `1px solid`, borderColor: 'divider' }} />}
              >
                {(impactLogsData?.items ?? []).slice(0, 4).map((log: any) => (
                  <Box
                    key={log.id}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.04) },
                      transition: 'background-color 0.15s',
                    }}
                    onClick={() => router.push(academicPaths.academicCalendar.impactLogs)}
                  >
                    <Stack direction="row" alignItems="flex-start" gap={1.5}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1.5,
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Iconify icon="mdi:alert-circle-outline" width={18} color="error.main" />
                      </Box>
                      <Box flex={1} minWidth={0}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {log.affectedEntityName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {CALENDAR_IMPACT_TYPE_LABELS[log.impactType as CalendarImpactType]} ·{' '}
                          {dayjs(log.affectedDate).format('DD MMM YYYY')}
                        </Typography>
                      </Box>
                      <Label
                        variant="soft"
                        color={
                          CALENDAR_IMPACT_STATUS_COLORS[log.status as CalendarImpactStatus] as any
                        }
                        sx={{ flexShrink: 0, fontWeight: 600 }}
                      >
                        {CALENDAR_IMPACT_STATUS_LABELS[log.status as CalendarImpactStatus]}
                      </Label>
                    </Stack>
                  </Box>
                ))}
                {(impactLogsData?.items?.length ?? 0) === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Iconify icon="mdi:check-circle-outline" width={36} color="success.main" />
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      No pending impact logs
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
        )}

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              height: '100%',
              border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            }}
          >
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <Iconify icon="mdi:lightning-bolt" width={18} color="warning.main" />
              <Typography variant="subtitle2" fontWeight={700}>
                Quick Actions
              </Typography>
            </Stack>
            <Grid container spacing={1.5}>
              {[
                {
                  icon: 'mdi:calendar-plus-outline',
                  label: 'Add Holiday',
                  color: colors.primary,
                  onClick: () => router.push(academicPaths.academicCalendar.management),
                  show: canManage,
                },
                {
                  icon: 'mdi:alert-octagon-outline',
                  label: 'Emergency Closure',
                  color: colors.error,
                  onClick: () => router.push(academicPaths.academicCalendar.emergencyClosure),
                  show: canDeclareEmergency,
                },
                {
                  icon: 'mdi:alert-circle-outline',
                  label: 'Resolve Impacts',
                  color: colors.warning,
                  onClick: () => router.push(academicPaths.academicCalendar.impactLogs),
                  show: canViewImpact,
                },
                {
                  icon: 'mdi:cog-outline',
                  label: 'Settings',
                  color: colors.primary,
                  onClick: () => router.push(academicPaths.academicCalendar.settings),
                  show: true,
                },
                {
                  icon: 'mdi:history',
                  label: 'Audit Logs',
                  color: colors.primary,
                  onClick: () => router.push(academicPaths.academicCalendar.auditLogs),
                  show: true,
                },
                {
                  icon: 'mdi:calendar-month-outline',
                  label: 'Year View',
                  color: colors.primary,
                  onClick: () =>
                    router.push(`${academicPaths.academicCalendar.management}?tab=yearView`),
                  show: canManage,
                },
              ]
                .filter((a) => a.show)
                .map((action) => (
                  <Grid size={{ xs: 6 }} key={action.label}>
                    <QuickAction
                      icon={action.icon}
                      label={action.label}
                      color={action.color}
                      onClick={action.onClick}
                    />
                  </Grid>
                ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AcademicCalendarDashboard;

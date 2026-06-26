'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { alpha, useTheme } from '@mui/material/styles';
import { CustomTabs } from 'src/components/custom-tabs';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Tab, Chip, Paper, Stack, Button, Avatar, Typography } from '@mui/material';
import {
  DayType,
  CalendarStatus,
  CALENDAR_STATUS_LABELS,
  CALENDAR_STATUS_COLORS,
} from 'src/enums/academic-calendar';
import {
  useGetCalendarsQuery,
  useGetCalendarDaysQuery,
  usePublishCalendarMutation,
  useArchiveCalendarMutation,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';

import CalendarYearView from './components/CalendarYearView';
import CalendarMonthView from './components/CalendarMonthView';
import CalendarDayFormDialog from './components/CalendarDayFormDialog';

// ─── Mock calendars for demo ──────────────────────────────────────────────────

const MOCK_CALENDARS_DATA = [
  {
    id: 'mock-1',
    name: 'AY 2025–26 (Primary)',
    status: CalendarStatus.Published,
    startDate: '2025-06-01',
    endDate: '2026-03-31',
    totalWorkingDays: 220,
    totalHolidays: 18,
  },
  {
    id: 'mock-2',
    name: 'AY 2024–25 (Archived)',
    status: CalendarStatus.Archived,
    startDate: '2024-06-01',
    endDate: '2025-03-31',
    totalWorkingDays: 215,
    totalHolidays: 16,
  },
  {
    id: 'mock-3',
    name: 'AY 2025–26 (Summer Draft)',
    status: CalendarStatus.Draft,
    startDate: '2025-04-01',
    endDate: '2025-05-31',
    totalWorkingDays: 40,
    totalHolidays: 3,
  },
];

// ─── Tabs ────────────────────────────────────────────────────────────────────

const TABS = [
  {
    value: 'yearView',
    label: 'Year View',
    icon: <Iconify icon="mdi:calendar-month-outline" width={18} />,
  },
  {
    value: 'monthView',
    label: 'Month View',
    icon: <Iconify icon="mdi:calendar-today-outline" width={18} />,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const CalendarManagement = () => {
  const theme = useTheme();
  const { getAllParams, setParam } = useCustomSearchParams({ tab: 'yearView' });
  const searchParams = getAllParams();
  const { permissions } = useSelector((state: RootState) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Permissions
  const canCreate = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.management}.Add`
  );
  const canEdit = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.management}.Edit`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.management}.Delete`
  );
  const canPublish = hasGrantedPermission(
    permissions,
    `${academicPermissions.academicCalendar.management}.Edit`
  );

  // Dialog states
  const addDayDialog = useBoolean(false);

  // Local state
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('');
  const [selectedDayDate, setSelectedDayDate] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  // Queries
  const { data: calendarsData, isLoading: calendarsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCalendarsQuery,
    params: { academicYearId: currentYear?.id },
    popupConfig: { error: true },
  });

  const { data: calendarDaysData, isLoading: daysLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCalendarDaysQuery,
    params: selectedCalendarId ? { calendarId: selectedCalendarId } : null,
    options: { skip: !selectedCalendarId },
    popupConfig: { error: false },
  });

  // Mutations
  const [publishCalendar, { isLoading: publishing }] = usePublishCalendarMutation();
  const [archiveCalendar, { isLoading: archiving }] = useArchiveCalendarMutation();

  const calendars: any[] = useMemo(() => {
    const rawCalendars =
      (calendarsData?.items?.length ?? 0) > 0 ? calendarsData.items : MOCK_CALENDARS_DATA;
    if (currentYear?.name) {
      const yearName = currentYear.name;
      const parts = yearName.split(/[-/]/);
      const startYear = parseInt(parts[0], 10) || 2025;
      const endYear = parseInt(parts[1], 10)
        ? parts[1].length === 2
          ? parseInt(`${String(startYear).slice(0, 2)}${parts[1]}`, 10)
          : parseInt(parts[1], 10)
        : startYear + 1;

      return rawCalendars.map((cal: any) => {
        if (cal.id.startsWith('mock-')) {
          const calStartMonthDay = dayjs(cal.startDate).format('MM-DD');
          const calEndMonthDay = dayjs(cal.endDate).format('MM-DD');

          const adjustedStart = `${startYear}-${calStartMonthDay}`;
          const isEndNextYear = dayjs(cal.endDate).year() > dayjs(cal.startDate).year();
          const adjustedEnd = `${isEndNextYear ? endYear : startYear}-${calEndMonthDay}`;

          const suffix = cal.name.includes('(Primary)')
            ? '(Primary)'
            : cal.name.includes('(Summer Draft)')
              ? '(Summer Draft)'
              : '(Archived)';

          const shortYear = `${startYear}-${String(endYear).slice(-2)}`;
          const adjustedName = `AY ${shortYear} ${suffix}`;

          return {
            ...cal,
            name: adjustedName,
            startDate: adjustedStart,
            endDate: adjustedEnd,
          };
        }
        return cal;
      });
    }
    return rawCalendars;
  }, [calendarsData, currentYear]);

  const selectedCalendar = useMemo(
    () => calendars.find((c) => c.id === selectedCalendarId),
    [calendars, selectedCalendarId]
  );

  const calendarDays: any[] = useMemo(() => {
    const rawDays = calendarDaysData?.items ?? [];
    if (rawDays.length > 0) return rawDays;

    if (selectedCalendar?.startDate) {
      const targetStartYear = dayjs(selectedCalendar.startDate).year();
      const mockDaysBase = [
        { date: '2025-08-15', dayType: DayType.Holiday, title: 'Independence Day' },
        { date: '2025-09-05', dayType: DayType.Event, title: "Teachers' Day" },
        { date: '2025-10-02', dayType: DayType.Holiday, title: 'Gandhi Jayanti' },
        { date: '2025-10-24', dayType: DayType.Vacation, title: 'Dussehra Break' },
        { date: '2025-10-25', dayType: DayType.Vacation, title: 'Dussehra Break' },
        { date: '2025-10-26', dayType: DayType.Vacation, title: 'Dussehra Break' },
        { date: '2025-11-12', dayType: DayType.Holiday, title: 'Diwali' },
        { date: '2025-11-13', dayType: DayType.Holiday, title: 'Diwali (2nd day)' },
        { date: '2025-11-14', dayType: DayType.HalfDay, title: "Children's Day" },
        { date: '2025-12-25', dayType: DayType.Holiday, title: 'Christmas' },
        { date: '2025-12-26', dayType: DayType.Vacation, title: 'Winter Vacation' },
        { date: '2025-12-27', dayType: DayType.Vacation, title: 'Winter Vacation' },
        { date: '2025-12-28', dayType: DayType.Vacation, title: 'Winter Vacation' },
        { date: '2025-12-29', dayType: DayType.Vacation, title: 'Winter Vacation' },
        { date: '2026-01-01', dayType: DayType.Holiday, title: "New Year's Day" },
        { date: '2026-01-26', dayType: DayType.Holiday, title: 'Republic Day' },
        { date: '2026-02-10', dayType: DayType.Exam, title: 'Annual Exam Day 1' },
        { date: '2026-02-11', dayType: DayType.Exam, title: 'Annual Exam Day 2' },
        { date: '2026-02-12', dayType: DayType.Exam, title: 'Annual Exam Day 3' },
        { date: '2026-02-13', dayType: DayType.Exam, title: 'Annual Exam Day 4' },
        { date: '2026-03-08', dayType: DayType.Event, title: "Women's Day Celebration" },
        { date: '2026-03-15', dayType: DayType.PTM, title: 'Parent-Teacher Meeting' },
      ];

      return mockDaysBase.map((d) => {
        const dMonth = dayjs(d.date).month();
        const year = dMonth < 5 ? targetStartYear + 1 : targetStartYear;
        return {
          ...d,
          date: dayjs(d.date).year(year).format('YYYY-MM-DD'),
        };
      });
    }
    return [];
  }, [calendarDaysData, selectedCalendar]);

  // Auto-select published calendar
  React.useEffect(() => {
    if (calendars.length > 0) {
      const published = calendars.find((c) => c.status === CalendarStatus.Published);
      setSelectedCalendarId(published?.id ?? calendars[0]?.id ?? '');
    } else {
      setSelectedCalendarId('');
    }
  }, [calendars]);

  // Sync Month View's active month to calendar start date
  React.useEffect(() => {
    if (selectedCalendar?.startDate) {
      setCurrentMonth(dayjs(selectedCalendar.startDate));
    }
  }, [selectedCalendarId, selectedCalendar?.startDate]);

  // Handlers

  const handlePublish = async (cal: any) => {
    try {
      await publishCalendar(cal.id).unwrap();
      shikshaMitraToast.success({ message: 'Calendar published successfully' });
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to publish' });
    }
  };

  const handleArchive = async (cal: any) => {
    try {
      await archiveCalendar(cal.id).unwrap();
      shikshaMitraToast.success({ message: 'Calendar archived' });
    } catch {
      shikshaMitraToast.error({ message: 'Failed to archive' });
    }
  };

  const handleDayClick = (date: string) => {
    setSelectedDayDate(date);
    addDayDialog.onTrue();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {/* Breadcrumbs */}
      <CustomBreadcrumbs
        heading="Calendar Management"
        description="Build and manage academic calendars — set holidays, vacations, events, and day markers."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Academic Calendar', href: '/academic/academicCalendarDashboard' },
          { name: 'Management' },
        ]}
        action={null}
      />

      {/* Calendar Selector + Status Banner */}
      <Paper
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.05)}`,
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            gap={2.5}
            flexWrap="wrap"
          >
            {/* Static Selected Calendar Indicator */}
            {selectedCalendar ? (
              <Stack direction="row" alignItems="center" gap={1.5}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon="mdi:calendar-month-outline" width={18} sx={{ color: '#fff' }} />
                </Avatar>
                <Stack spacing={0.1}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Selected Calendar
                  </Typography>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {selectedCalendar.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={CALENDAR_STATUS_LABELS[selectedCalendar.status as CalendarStatus]}
                      color={CALENDAR_STATUS_COLORS[selectedCalendar.status as CalendarStatus]}
                      sx={{ height: 18, fontSize: '10px', fontWeight: 700, pointerEvents: 'none' }}
                    />
                  </Stack>
                </Stack>
              </Stack>
            ) : (
              <Stack direction="row" alignItems="center" gap={1.5}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    background: theme.palette.grey[400],
                    flexShrink: 0,
                  }}
                >
                  <Iconify icon="mdi:calendar-remove-outline" width={18} sx={{ color: '#fff' }} />
                </Avatar>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  No active calendar for this academic year
                </Typography>
              </Stack>
            )}

            {/* Stats */}
            {selectedCalendar && (
              <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <Iconify icon="mdi:calendar-range-outline" width={15} color="text.secondary" />
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {dayjs(selectedCalendar.startDate).format('DD MMM YYYY')} –{' '}
                    {dayjs(selectedCalendar.endDate).format('DD MMM YYYY')}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.25,
                    py: 0.4,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.25)}`,
                  }}
                >
                  <Iconify icon="mdi:briefcase-check-outline" width={13} color="success.main" />
                  <Typography variant="caption" fontWeight={700} color="success.main">
                    {selectedCalendar.totalWorkingDays ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Working Days
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.25,
                    py: 0.4,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.25)}`,
                  }}
                >
                  <Iconify icon="mdi:flag-outline" width={13} color="error.main" />
                  <Typography variant="caption" fontWeight={700} color="error.main">
                    {selectedCalendar.totalHolidays ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Holidays
                  </Typography>
                </Box>
              </Stack>
            )}

            {/* Actions */}
            {selectedCalendar && canPublish && (
              <Stack direction="row" gap={1} ml="auto">
                {selectedCalendar.status === CalendarStatus.Draft && (
                  <LoadingButton
                    size="small"
                    variant="contained"
                    color="success"
                    loading={publishing}
                    startIcon={<Iconify icon="mdi:publish" width={16} />}
                    onClick={() => handlePublish(selectedCalendar)}
                    sx={{ borderRadius: 2 }}
                  >
                    Publish
                  </LoadingButton>
                )}
                {selectedCalendar.status === CalendarStatus.Published && canCreate && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:calendar-plus-outline" width={16} />}
                    onClick={() => addDayDialog.onTrue()}
                    sx={{ borderRadius: 2 }}
                  >
                    Add Day Marker
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper
        sx={{ '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } } }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(_, val) => setParam('tab', val)}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 }, borderRadius: '12px' }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* YEAR VIEW TAB */}
        {searchParams.tab === 'yearView' && (
          <>
            {!selectedCalendarId ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Typography color="text.secondary">Select a calendar to view</Typography>
              </Paper>
            ) : (
              <>
                {selectedCalendar && canCreate && (
                  <Box sx={{ mb: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mdi:calendar-plus-outline" width={16} />}
                      onClick={() => addDayDialog.onTrue()}
                    >
                      Add Day Marker
                    </Button>
                  </Box>
                )}
                <CalendarYearView
                  calendarDays={calendarDays}
                  calendarStartDate={selectedCalendar?.startDate ?? ''}
                  calendarEndDate={selectedCalendar?.endDate ?? ''}
                  isLoading={daysLoading}
                  onDayClick={handleDayClick}
                />
              </>
            )}
          </>
        )}

        {/* MONTH VIEW TAB */}
        {searchParams.tab === 'monthView' && (
          <>
            {!selectedCalendarId ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Typography color="text.secondary">Select a calendar to view</Typography>
              </Paper>
            ) : (
              <CalendarMonthView
                calendarDays={calendarDays}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                onDayClick={handleDayClick}
                isLoading={daysLoading}
              />
            )}
          </>
        )}
      </Box>

      {/* ── Dialogs ─────────────────────────────────────────────────────── */}

      {/* Add Day Marker */}
      {selectedCalendarId && selectedCalendar && (
        <CalendarDayFormDialog
          open={addDayDialog.value}
          onClose={() => {
            addDayDialog.onFalse();
            setSelectedDayDate('');
          }}
          calendarId={selectedCalendarId}
          calendarStatus={selectedCalendar.status}
          prefillDate={selectedDayDate || undefined}
        />
      )}
    </Box>
  );
};

export default CalendarManagement;

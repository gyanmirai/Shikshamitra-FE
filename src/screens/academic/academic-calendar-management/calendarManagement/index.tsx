'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { alpha, useTheme } from '@mui/material/styles';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomSelect from 'src/components/custom-select';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Tab, Paper, Stack, Avatar, Skeleton, Typography, Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { DayType, CalendarStatus, CalendarDayStatus } from 'src/enums/academic-calendar';
import {
  useGetCalendarsQuery,
  useGetCalendarDaysQuery,
  useCreateCalendarMutation,
  usePublishCalendarMutation,
  useArchiveCalendarMutation,
  useDeleteCalendarDayMutation,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';

import CalendarYearView from './components/CalendarYearView';
import CalendarMonthView from './components/CalendarMonthView';
import CalendarDayFormDialog from './components/CalendarDayFormDialog';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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

const NON_WORKING_DAY_TYPES = new Set<number>([
  DayType.Holiday,
  DayType.Vacation,
  DayType.EmergencyClosure,
]);

const addDateRangeToSet = (dateSet: Set<string>, startDate?: string, endDate?: string) => {
  if (!startDate) return;

  let cursor = dayjs(startDate).startOf('day');
  let end = dayjs(endDate || startDate).startOf('day');

  if (!cursor.isValid()) return;
  if (!end.isValid() || end.isBefore(cursor, 'day')) end = cursor;

  while (cursor.isBefore(end, 'day') || cursor.isSame(end, 'day')) {
    dateSet.add(cursor.format('YYYY-MM-DD'));
    cursor = cursor.add(1, 'day');
  }
};

const expandCalendarDayRanges = (days: any[]) =>
  days.flatMap((day) => {
    let cursor = dayjs(day.date).startOf('day');
    let end = dayjs(day.endDate || day.date).startOf('day');

    if (!cursor.isValid()) return [];
    if (!end.isValid() || end.isBefore(cursor, 'day')) end = cursor;

    const expandedDays: any[] = [];
    while (cursor.isBefore(end, 'day') || cursor.isSame(end, 'day')) {
      expandedDays.push({
        ...day,
        date: cursor.format('YYYY-MM-DDTHH:mm:ssZ'),
        rangeStartDate: day.date,
        rangeEndDate: day.endDate,
      });
      cursor = cursor.add(1, 'day');
    }
    return expandedDays;
  });

const calculateCalendarSummary = (
  days: any[],
  calendarStartDate?: string,
  calendarEndDate?: string
) => {
  const start = dayjs(calendarStartDate).startOf('day');
  const end = dayjs(calendarEndDate).startOf('day');
  const holidayDates = new Set<string>();
  const nonWorkingDates = new Set<string>();
  const workingOverrideDates = new Set<string>();

  days
    .filter((day) => !day.status || Number(day.status) === CalendarDayStatus.Active)
    .forEach((day) => {
      const dayType = Number(day.dayType);

      if (dayType === DayType.Holiday) {
        addDateRangeToSet(holidayDates, day.date, day.endDate);
      }

      if (NON_WORKING_DAY_TYPES.has(dayType)) {
        addDateRangeToSet(nonWorkingDates, day.date, day.endDate);
      }

      if (dayType === DayType.WorkingDay) {
        addDateRangeToSet(workingOverrideDates, day.date, day.endDate);
      }
    });

  if (!start.isValid() || !end.isValid()) {
    return { totalWorkingDays: 0, totalHolidays: holidayDates.size };
  }

  let totalWorkingDays = 0;
  let cursor = start;

  while (cursor.isBefore(end, 'day') || cursor.isSame(end, 'day')) {
    const dateKey = cursor.format('YYYY-MM-DD');
    const isWeekend = cursor.day() === 0 || cursor.day() === 6;

    if (workingOverrideDates.has(dateKey)) {
      totalWorkingDays += 1;
    } else if (!isWeekend && !nonWorkingDates.has(dateKey)) {
      totalWorkingDays += 1;
    }

    cursor = cursor.add(1, 'day');
  }

  return { totalWorkingDays, totalHolidays: holidayDates.size };
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CalendarManagement = () => {
  const theme = useTheme();
  const { getAllParams, setParam } = useCustomSearchParams({ tab: 'yearView' });
  const searchParams = getAllParams();
  const { permissions } = useSelector((state: RootState) => state.auth);
  const {
    currentYear,
    currentBoard,
    currentMedium: medium,
  } = useSelector((state: RootState) => state.globalState);

  // Extract standards list from the selected medium stages
  const standards = useMemo(
    () => medium?.educationMediumStages?.flatMap((stage: any) => stage.standards || []) || [],
    [medium]
  );

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
  const createCalendarDialog = useBoolean(false);
  const publishConfirm = useBoolean(false);

  // Local state
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('');
  const [selectedDayDate, setSelectedDayDate] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [filterStandardId, setFilterStandardId] = useState<string>('all');
  const [activeDayType, setActiveDayType] = useState<DayType | null>(null);

  // Auto-creation lock ref
  const autoCreatingRef = React.useRef(false);

  // Queries
  const {
    data: calendarsData,
    isLoading: calendarsLoading,
    isFetching: calendarsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCalendarsQuery,
    params: { academicMediumId: medium?.id },
    options: { skip: !medium?.id },
    popupConfig: { error: true },
  });

  const {
    data: calendarDaysData,
    isLoading: daysLoading,
    isFetching: daysFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCalendarDaysQuery,
    params: selectedCalendarId ? { calendarId: selectedCalendarId } : null,
    options: { skip: !selectedCalendarId },
    popupConfig: { error: false },
  });

  const isCalendarLoading = calendarsLoading || daysLoading || calendarsFetching || daysFetching;

  // Mutations
  const [createCalendar, { isLoading: creatingCal }] = useCreateCalendarMutation();
  const [publishCalendar, { isLoading: publishing }] = usePublishCalendarMutation();
  const [archiveCalendar, { isLoading: archiving }] = useArchiveCalendarMutation();
  const [deleteCalendarDay, { isLoading: deletingDay }] = useDeleteCalendarDayMutation();

  const calendars: any[] = useMemo(() => calendarsData?.items ?? [], [calendarsData]);

  const selectedCalendar = useMemo(
    () => calendars.find((c) => c.id === selectedCalendarId),
    [calendars, selectedCalendarId]
  );

  const calendarDays: any[] = useMemo(() => {
    if (Array.isArray(calendarDaysData)) return calendarDaysData;
    return calendarDaysData?.items ?? [];
  }, [calendarDaysData]);

  // Class filter options and the days visible for the selected class.
  // "All classes" markers always stay visible since they apply to every class.
  const classFilterOptions = useMemo(
    () => [{ id: 'all', name: 'All Classes' }, ...standards],
    [standards]
  );

  const filteredCalendarDays = useMemo(() => {
    if (filterStandardId === 'all') return calendarDays;
    return calendarDays.filter((d) => d.appliesToAll || d.standardId === filterStandardId);
  }, [calendarDays, filterStandardId]);

  const visibleCalendarDays = useMemo(
    () => expandCalendarDayRanges(filteredCalendarDays),
    [filteredCalendarDays]
  );

  const calendarStartDate = selectedCalendar?.startDate || currentBoard?.startDate || '';
  const calendarEndDate = selectedCalendar?.endDate || currentBoard?.endDate || '';
  const calendarSummary = calculateCalendarSummary(
    calendarDays,
    calendarStartDate,
    calendarEndDate
  );

  // Auto-create calendar if none exists for the selected academic medium.
  React.useEffect(() => {
    if (
      !calendarsLoading &&
      calendars.length === 0 &&
      medium?.id &&
      currentYear?.name &&
      !autoCreatingRef.current
    ) {
      autoCreatingRef.current = true;
      const yearName = currentYear.name;
      const parts = yearName.split(/[-/]/);
      const startYear = parseInt(parts[0], 10) || 2026;
      const endYear = parseInt(parts[1], 10)
        ? parts[1].length === 2
          ? parseInt(`${String(startYear).slice(0, 2)}${parts[1]}`, 10)
          : parseInt(parts[1], 10)
        : startYear + 1;

      const startDate =
        currentYear.startDate || currentBoard?.startDate || `${startYear}-06-01T00:00:00Z`;
      const endDate = currentYear.endDate || currentBoard?.endDate || `${endYear}-03-31T00:00:00Z`;

      createCalendar({
        academicMediumId: medium.id,
        academicYearId: currentYear.id,
        name: `${medium.name} Academic Calendar`,
        startDate,
        endDate,
        description: `Automatically generated default calendar for ${medium.name}`,
        isDefault: true,
      })
        .unwrap()
        .then((newCal) => {
          setSelectedCalendarId(newCal.id);
        })
        .catch((err) => {
          console.error('Failed to auto-create calendar:', err);
        })
        .finally(() => {
          autoCreatingRef.current = false;
        });
    }
  }, [calendars, calendarsLoading, currentYear, medium, createCalendar, currentBoard]);

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
    const startD = selectedCalendar?.startDate || currentBoard?.startDate;
    if (startD) {
      setCurrentMonth(dayjs(startD));
    }
  }, [selectedCalendarId, selectedCalendar?.startDate, currentBoard?.startDate]);

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

  const handleDeleteDay = async (day: any) => {
    const ids =
      Array.isArray(day?.deleteIds) && day.deleteIds.length > 0 ? day.deleteIds : [day?.id];
    const uniqueIds = Array.from(new Set(ids.filter(Boolean))) as string[];

    if (uniqueIds.length === 0) return;

    try {
      await Promise.all(uniqueIds.map((id) => deleteCalendarDay(id).unwrap()));
      shikshaMitraToast.success({ message: 'Calendar day deleted successfully' });
      addDayDialog.onFalse();
      setSelectedDayDate('');
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to delete calendar day' });
    }
  };

  // Existing marker(s) on the clicked date — opens the dialog pre-filled in edit mode.
  // A multi-class marker is stored as one row per class, so sibling rows with the
  // same title and day type are merged back into a single standardIds selection.
  const selectedDayEditData = useMemo(() => {
    if (!selectedDayDate) return undefined;
    const key = dayjs(selectedDayDate).format('YYYY-MM-DD');
    const markers = filteredCalendarDays.filter((d) => {
      const start = dayjs(d.date).startOf('day');
      const end = dayjs(d.endDate || d.date).startOf('day');
      const selected = dayjs(key).startOf('day');
      const isActive = !d.status || Number(d.status) === CalendarDayStatus.Active;

      return (
        isActive &&
        start.isValid() &&
        selected.isSameOrAfter(start, 'day') &&
        selected.isSameOrBefore(end.isValid() ? end : start, 'day')
      );
    });
    if (markers.length === 0) return undefined;
    const first = markers[0];
    const group = markers.filter((m) => m.title === first.title && m.dayType === first.dayType);
    return {
      ...first,
      standardIds: group.map((m) => m.standardId).filter(Boolean),
      deleteIds: group.map((m) => m.id).filter(Boolean),
    };
  }, [filteredCalendarDays, selectedDayDate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1 }}>
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
            gap={1}
            flexWrap="wrap"
          >
            {/* Selected Calendar Indicator / Skeleton Loader */}
            {isCalendarLoading ? (
              <Stack direction="row" alignItems="center" gap={1.5}>
                <Stack spacing={0.75}>
                  <Skeleton variant="text" width={100} height={14} />
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Skeleton variant="text" width={160} height={22} />
                    <Skeleton variant="rounded" width={115} height={24} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: 2 }} />
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Skeleton variant="text" width={170} height={14} />
                    <Skeleton variant="rounded" width={65} height={20} sx={{ borderRadius: 1 }} />
                  </Stack>
                </Stack>
              </Stack>
            ) : selectedCalendar ? (
              <Stack direction="row" alignItems="center" gap={1}>
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
                <Stack spacing={1}>
                  <Box display="flex" gap={1} alignItems="center">
                    <Typography variant="subtitle2" fontWeight={700}>
                      {selectedCalendar.name}
                    </Typography>
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
                        {calendarSummary.totalWorkingDays}
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
                        {calendarSummary.totalHolidays}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Holidays
                      </Typography>
                    </Box>
                  </Box>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Iconify icon="mdi:calendar-range-outline" width={15} color="text.secondary" />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {dayjs(calendarStartDate).format('DD MMM YYYY')} –{' '}
                      {dayjs(calendarEndDate).format('DD MMM YYYY')}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            ) : (
              <Stack direction="row" alignItems="center" gap={1}>
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
                  No active calendar for this academic medium
                </Typography>
              </Stack>
            )}

            {/* Actions */}
            {selectedCalendar && (
              <Stack direction="row" gap={1.5} alignItems="center" ml="auto">
                {canPublish && selectedCalendar?.status === CalendarStatus.Draft && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Iconify icon="mdi:publish" width={16} />}
                    onClick={publishConfirm.onTrue}
                  >
                    Publish
                  </Button>
                )}
                <Label
                  variant="soft"
                  color={selectedCalendar?.status === CalendarStatus.Draft ? 'info' : 'success'}
                >
                  {CalendarStatus[selectedCalendar?.status]}
                </Label>
              </Stack>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Class Filter + Tabs */}
      <Stack direction="row" alignItems="center" gap={1}>
        <CustomSelect
          label="Class"
          options={classFilterOptions}
          labelKey="name"
          valueKey="id"
          value={filterStandardId}
          onChange={(val) => setFilterStandardId(val as string)}
          size="small"
          formControlProps={{ size: 'small', sx: { minWidth: 180 } }}
        />
        <Paper
          sx={{
            flex: 1,
            '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
          }}
        >
          <CustomTabs
            value={searchParams.tab}
            onChange={(_, val) => setParam('tab', val)}
            sx={{ '& .MuiTabs-flexContainer': { gap: 1 }, borderRadius: '12px' }}
          >
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
            ))}
          </CustomTabs>
        </Paper>
      </Stack>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* YEAR VIEW TAB */}
        {searchParams.tab === 'yearView' && (
          <>
            {!selectedCalendarId ? (
              <Paper sx={{ p: 1, textAlign: 'center', borderRadius: 2 }}>
                <Typography color="text.secondary">Select a calendar to view</Typography>
              </Paper>
            ) : (
              <CalendarYearView
                calendarDays={visibleCalendarDays}
                calendarStartDate={calendarStartDate}
                calendarEndDate={calendarEndDate}
                isLoading={daysLoading}
                onDayClick={handleDayClick}
                activeDayType={activeDayType}
                onToggleDayType={(type) =>
                  setActiveDayType((prev) => (prev === type ? null : type))
                }
              />
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
                calendarDays={visibleCalendarDays}
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
          editData={selectedDayEditData}
          prefillDate={selectedDayDate || undefined}
          canDelete={canDelete}
          deleting={deletingDay}
          onDelete={handleDeleteDay}
          standards={standards}
        />
      )}

      {/* Publish Confirmation Dialog */}
      {selectedCalendar && (
        <ConfirmDialog
          open={publishConfirm.value}
          onClose={publishConfirm.onFalse}
          title="Publish Calendar"
          content="Are you sure you want to publish this academic calendar?"
          icon="warning"
          action={
            <LoadingButton
              variant="contained"
              loading={publishing}
              startIcon={<Iconify icon="mdi:publish" width={16} />}
              onClick={async () => {
                await handlePublish(selectedCalendar);
                publishConfirm.onFalse();
              }}
            >
              Publish
            </LoadingButton>
          }
        />
      )}
    </Box>
  );
};

export default CalendarManagement;

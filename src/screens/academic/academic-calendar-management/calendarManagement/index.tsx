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
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { academicPermissions } from 'src/constants/academic-menu';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { resolveAcademicCalendarId } from 'src/utils/academic-calendar-selection';
import { Box, Paper, Stack, Avatar, Button, Skeleton, Typography } from '@mui/material';
import { DayType, CalendarStatus, CalendarDayStatus } from 'src/enums/academic-calendar';
import { AcademicContextContent } from 'src/screens/academic/components/AcademicContextContent';
import {
  useGetCalendarsQuery,
  useGetCalendarDaysQuery,
  useCreateCalendarMutation,
  usePublishCalendarMutation,
  useArchiveCalendarMutation,
  useDeleteCalendarDayMutation,
} from 'src/redux/academicAPI/AcademicCalendarApi/academic-calendar-api';

import { buildCalendarDayMap } from './calendarViewModel';
import CalendarYearView from './components/CalendarYearView';
import { calculateCalendarSummary } from './calendarSummary';
import AcademicCalendarView from './components/AcademicCalendarView';
import CalendarViewControls from './components/CalendarViewControls';
import CalendarDayFormDialog from './components/CalendarDayFormDialog';
import { CalendarYearSkeleton, CalendarMonthSkeleton } from './components/CalendarSkeleton';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// ─── Main Component ───────────────────────────────────────────────────────────

const CalendarManagement = () => {
  const theme = useTheme();
  const { getAllParams, setParam } = useCustomSearchParams({ tab: 'monthView' });
  const searchParams = getAllParams();
  const activeTab = searchParams.tab || 'monthView';
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
  const [selectedDayMarkerId, setSelectedDayMarkerId] = useState<string>('');
  const [filterStandardId, setFilterStandardId] = useState<string>('all');
  const [activeDayType, setActiveDayType] = useState<DayType | null>(null);

  // Auto-creation lock ref
  const autoCreatingRef = React.useRef(false);

  // Memoized query params
  const calendarsParams = useMemo(() => ({ academicMediumId: medium?.id }), [medium?.id]);
  const calendarDaysParams = useMemo(
    () => (selectedCalendarId ? { calendarId: selectedCalendarId } : null),
    [selectedCalendarId]
  );

  // Queries
  const { data: calendarsData, isLoading: calendarsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCalendarsQuery,
    params: calendarsParams,
    options: { skip: !medium?.id, refetchOnFocus: false, refetchOnMountOrArgChange: false },
    popupConfig: { error: true },
  });

  const { data: calendarDaysData, isLoading: daysLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCalendarDaysQuery,
    params: calendarDaysParams,
    options: { skip: !selectedCalendarId, refetchOnFocus: false, refetchOnMountOrArgChange: false },
    popupConfig: { error: false },
  });

  const isCalendarLoading =
    (calendarsLoading || daysLoading) && (!calendarsData || calendarsData?.items?.length === 0);

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

  const calendarStartDate = selectedCalendar?.startDate || currentBoard?.startDate || '';
  const calendarEndDate = selectedCalendar?.endDate || currentBoard?.endDate || '';

  /**
   * Memoization Justification:
   * - Range expansion and class-record deduplication can process hundreds of API rows.
   * - Reusing the index prevents that work on dialog, permission, and tab state renders.
   */
  const visibleCalendarDayMap = useMemo(
    () => buildCalendarDayMap(filteredCalendarDays, calendarStartDate, calendarEndDate),
    [filteredCalendarDays, calendarStartDate, calendarEndDate]
  );

  /**
   * Memoization Justification:
   * - Summary calculation scans the academic year and indexes all calendar markers.
   * - It only needs to rerun when the API data or selected calendar boundaries change.
   */
  const calendarSummary = useMemo(
    () => calculateCalendarSummary(calendarDays, calendarStartDate, calendarEndDate),
    [calendarDays, calendarStartDate, calendarEndDate]
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

  React.useEffect(() => {
    const today = dayjs().format('YYYY-MM-DD');
    const start = (currentBoard?.startDate || currentYear?.startDate)?.slice(0, 10);
    const end = (currentBoard?.endDate || currentYear?.endDate)?.slice(0, 10);
    const date = start && end && (today < start || today > end) ? start : today;
    setSelectedCalendarId(resolveAcademicCalendarId(calendars, date));
  }, [calendars, currentBoard?.endDate, currentBoard?.startDate, currentYear?.endDate, currentYear?.startDate]);

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

  const handleDayClick = (date: string, markerId?: string) => {
    setSelectedDayDate(date);
    setSelectedDayMarkerId(markerId ?? '');
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
      setSelectedDayMarkerId('');
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
    const first = markers.find((marker) => marker.id === selectedDayMarkerId) ?? markers[0];
    const group = markers.filter((m) => m.title === first.title && m.dayType === first.dayType);
    const rangeStartDate = group.reduce(
      (earliest, marker) =>
        dayjs(marker.date).isBefore(dayjs(earliest), 'day') ? marker.date : earliest,
      first.date
    );
    return {
      ...first,
      date: rangeStartDate,
      endDate: first.endDate ?? first.rangeEndDate ?? rangeStartDate,
      standardIds: group.map((m) => m.standardId).filter(Boolean),
      deleteIds: group.map((m) => m.id).filter(Boolean),
    };
  }, [filteredCalendarDays, selectedDayDate, selectedDayMarkerId]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 1 }}>
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
      <AcademicContextContent loading={calendarsLoading}>
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
                <Stack direction="row" alignItems="center" gap={1.5} width="100%">
                  <Skeleton
                    variant="rounded"
                    width={36}
                    height={36}
                    sx={{ borderRadius: 2, flexShrink: 0 }}
                  />
                  <Stack spacing={0.75} flex={1}>
                    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                      <Skeleton variant="text" width={180} height={22} sx={{ borderRadius: 1 }} />
                      <Skeleton
                        variant="rounded"
                        width={115}
                        height={24}
                        sx={{ borderRadius: 2 }}
                      />
                      <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: 2 }} />
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Skeleton variant="circular" width={14} height={14} />
                      <Skeleton variant="text" width={170} height={16} sx={{ borderRadius: 1 }} />
                    </Stack>
                  </Stack>
                  <Box sx={{ ml: 'auto' }}>
                    <Skeleton variant="rounded" width={75} height={24} sx={{ borderRadius: 1 }} />
                  </Box>
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
                        <Iconify
                          icon="mdi:briefcase-check-outline"
                          width={13}
                          color="success.main"
                        />
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
                      <Iconify
                        icon="mdi:calendar-range-outline"
                        width={15}
                        color="text.secondary"
                      />
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

        <CalendarViewControls
          activeTab={activeTab}
          onTabChange={(tab) => setParam('tab', tab)}
          classOptions={classFilterOptions}
          classId={filterStandardId}
          onClassChange={setFilterStandardId}
        />

        {/* Tab Content */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {/* YEAR VIEW TAB */}
          {activeTab === 'yearView' && (
            <>
              {calendarsLoading ? (
                <CalendarYearSkeleton />
              ) : !selectedCalendarId ? (
                <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                  <Typography color="text.secondary">Select a calendar to view</Typography>
                </Paper>
              ) : (
                <CalendarYearView
                  dayMap={visibleCalendarDayMap}
                  calendarStartDate={calendarStartDate}
                  calendarEndDate={calendarEndDate}
                  isLoading={daysLoading && calendarDays.length === 0}
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
          {activeTab === 'monthView' && (
            <>
              {calendarsLoading ? (
                <CalendarMonthSkeleton />
              ) : !selectedCalendar ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <Typography color="text.secondary">Select a calendar to view</Typography>
                </Paper>
              ) : (
                <AcademicCalendarView
                  calendarId={selectedCalendarId}
                  dayMap={visibleCalendarDayMap}
                  calendarStartDate={calendarStartDate}
                  calendarEndDate={calendarEndDate}
                  onDayClick={handleDayClick}
                  isLoading={daysLoading || calendarsLoading}
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
              setSelectedDayMarkerId('');
            }}
            calendarId={selectedCalendarId}
            calendarStatus={selectedCalendar.status}
            academicMediumId={selectedCalendar.academicMediumId}
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
      </AcademicContextContent>
    </Box>
  );
};

export default CalendarManagement;

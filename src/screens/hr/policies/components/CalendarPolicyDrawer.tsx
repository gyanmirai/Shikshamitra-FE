'use client';

import type { PolicyStatus } from 'src/redux/hr/hr-policy-api';

import dayjs from 'dayjs';
import React from 'react';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Table,
  Button,
  Select,
  Tooltip,
  MenuItem,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  IconButton,
  Typography,
  FormControl,
  InputAdornment,
  LinearProgress,
  TableContainer,
} from '@mui/material';

import { getHolidayFromDate } from '../holiday-overlap-utils';
import { WEEKDAY_OPTIONS, WEEKLY_RULE_OPTIONS } from '../hr-policy-workspace.constants';
import {
  EmptyRows,
  DrawerField,
  PolicySection,
  DrawerFormGrid,
  InfoTooltipIcon,
  DrawerSelectField,
  HolidayMetricCard,
  PolicyDrawerLayout,
} from './HRPolicySharedUI';
import {
  sortWeekDays,
  getHolidaySummary,
  getHolidayDayCount,
  getWeeklyOffsForRule,
  getWorkingDaysForRule,
  getHolidayMonthOptions,
  formatHolidayDateRange,
} from '../hr-policy-workspace-utils';

import type { HolidayReviewFilter } from '../types/hr-policy-workspace.types';
import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

// ─── CalendarPolicyDrawer ──────────────────────────────────────────────────────

export function CalendarPolicyDrawer({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    drawer,
    formError,
    calendarForm,
    setCalendarForm,
    currentCalendarUnchanged,
    createCalendarState,
    updateCalendarState,
    activePolicyOperation,
    academicYearId,
    canEditPolicy,
    canCreatePolicy,
    closeDrawer,
    saveCalendar,
    centralHolidayPreviewRows,
    holidayReviewFilters,
    setHolidayReviewFilters,
    holidayReviewError,
    holidayReviewInfo,
    loadCalendarHolidaysState,
    loadHolidayImportPreviewState,
    importCentralHolidays,
    openManualHolidayDialog,
    removeManualHoliday,
    updateCalendarHoliday,
  } = ctx;

  if (!drawer || drawer.kind !== 'calendar') return null;

  const isCurrentSaveOperation =
    activePolicyOperation?.key === 'save-calendar' ||
    activePolicyOperation?.key === 'save-payroll' ||
    activePolicyOperation?.key === 'save-attendance' ||
    activePolicyOperation?.key === 'save-assignment';

  const previewWeeklyOffs = getWeeklyOffsForRule(
    calendarForm.weeklyOffPattern,
    calendarForm.customWeeklyOffs
  );
  const previewWorkingDays = getWorkingDaysForRule(
    calendarForm.weeklyOffPattern,
    calendarForm.customWeeklyOffs
  );
  const holidaySummary = getHolidaySummary(calendarForm.holidays);

  const filtersActive = Boolean(
    holidayReviewFilters.search ||
    holidayReviewFilters.month ||
    holidayReviewFilters.source !== 'all'
  );

  const hasCentralPreview = centralHolidayPreviewRows.length > 0;
  const hasFinalizedHolidays = calendarForm.holidays.length > 0;
  const reviewHolidayRows = hasFinalizedHolidays
    ? calendarForm.holidays
    : centralHolidayPreviewRows;

  const holidayMonthOptions = getHolidayMonthOptions(reviewHolidayRows);

  const filteredHolidays = reviewHolidayRows.filter((holiday) => {
    const search = holidayReviewFilters.search.trim().toLowerCase();
    const matchesSearch = !search || holiday.holidayName.toLowerCase().includes(search);
    const matchesMonth =
      !holidayReviewFilters.month ||
      dayjs(getHolidayFromDate(holiday)).format('YYYY-MM') === holidayReviewFilters.month;
    const matchesSource =
      holidayReviewFilters.source === 'all' ||
      (holidayReviewFilters.source === 'included' && holiday.isIncluded) ||
      (holidayReviewFilters.source === 'removed' && !holiday.isIncluded) ||
      holiday.source === holidayReviewFilters.source;
    return matchesSearch && matchesMonth && matchesSource;
  });

  return (
    <PolicyDrawerLayout
      title={`${drawer.mode === 'edit' ? 'Edit' : 'New'} Work Calendar`}
      helpText="Define the active working pattern and holiday set used by attendance and payroll policies."
      error={formError}
      onClose={closeDrawer}
      onSave={saveCalendar}
      disabled={
        drawer.mode === 'edit'
          ? !canEditPolicy || Boolean(currentCalendarUnchanged)
          : !canCreatePolicy
      }
      disabledReason={currentCalendarUnchanged ? 'No changes to save' : undefined}
      loading={createCalendarState.isLoading || updateCalendarState.isLoading}
      operation={isCurrentSaveOperation ? activePolicyOperation : null}
    >
      <PolicySection
        title="Policy Details"
        help="Basic calendar identity and validity dates used by attendance and payroll policy calculations."
      >
        <DrawerFormGrid>
          <DrawerField label="Name *">
            <TextField
              fullWidth
              size="small"
              value={calendarForm.name}
              onChange={(event) =>
                setCalendarForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </DrawerField>
          <DrawerSelectField
            label="Status"
            value={calendarForm.status}
            onChange={(event) =>
              setCalendarForm((current) => ({
                ...current,
                status: event.target.value as PolicyStatus,
              }))
            }
          >
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </DrawerSelectField>
          <DrawerField
            label="Effective From *"
            help="The first date this work calendar can be used for attendance and payroll calculations."
          >
            <DatePicker
              value={calendarForm.effectiveFrom ? dayjs(calendarForm.effectiveFrom) : null}
              onChange={(val) =>
                setCalendarForm((current) => ({
                  ...current,
                  effectiveFrom: val?.format('YYYY-MM-DD') || '',
                }))
              }
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </DrawerField>
          <DrawerField
            label="Effective To"
            help="Optional end date. Leave blank when this calendar should remain available until replaced."
          >
            <DatePicker
              value={calendarForm.effectiveTo ? dayjs(calendarForm.effectiveTo) : null}
              onChange={(val) =>
                setCalendarForm((current) => ({
                  ...current,
                  effectiveTo: val?.format('YYYY-MM-DD') || '',
                }))
              }
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </DrawerField>
        </DrawerFormGrid>
      </PolicySection>
      <PolicySection
        title="Weekly Schedule"
        help="Defines the weekly working pattern. Use custom weekly offs only when the default rules do not match the institution schedule."
        description="Weekly offs repeat every week. Use Holiday Rules for one-time dates."
      >
        <DrawerFormGrid>
          <DrawerSelectField
            label="Weekly Rule *"
            help="Choose the repeating weekly off rule that determines normal working days for this calendar."
            value={calendarForm.weeklyOffPattern}
            onChange={(event) =>
              setCalendarForm((current) => ({
                ...current,
                weeklyOffPattern: event.target.value,
              }))
            }
          >
            {WEEKLY_RULE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </DrawerSelectField>
          <Box>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                height: 1,
                bgcolor: 'background.default',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(145, 158, 171, 0.24)' : 'divider',
              }}
            >
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Typography variant="subtitle2">Weekly preview</Typography>
                  <InfoTooltipIcon title="Preview of working days and weekly offs generated from the selected weekly rule." />
                </Stack>
                <Stack spacing={1}>
                  {[
                    { label: 'Working days', days: previewWorkingDays, color: 'success' },
                    { label: 'Weekly offs', days: previewWeeklyOffs, color: 'warning' },
                  ].map((row) => (
                    <Stack
                      key={row.label}
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={0.75}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ minWidth: 86, flexShrink: 0 }}
                      >
                        {row.label}
                      </Typography>
                      <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                        {row.days.length ? (
                          row.days.map((day) => (
                            <Chip
                              key={`${row.label}-${day}`}
                              size="small"
                              label={
                                WEEKDAY_OPTIONS.find((option) => option.value === day)?.short || day
                              }
                              color={row.color as 'success' | 'warning'}
                              variant="outlined"
                              sx={{ minWidth: 40 }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Box>
        </DrawerFormGrid>
        {calendarForm.weeklyOffPattern === 'custom' ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Select weekly off days</Typography>
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
              {WEEKDAY_OPTIONS.map((day) => {
                const selected = calendarForm.customWeeklyOffs.includes(day.value);
                return (
                  <Chip
                    key={day.value}
                    clickable
                    label={day.short}
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    onClick={() =>
                      setCalendarForm((current) => ({
                        ...current,
                        customWeeklyOffs: selected
                          ? current.customWeeklyOffs.filter((item) => item !== day.value)
                          : sortWeekDays([...current.customWeeklyOffs, day.value]),
                      }))
                    }
                  />
                );
              })}
            </Stack>
          </Stack>
        ) : null}
      </PolicySection>
      <PolicySection
        title="Holiday Review"
        help="Review central and manual holidays stored in this work calendar before saving it."
        description="These holidays belong to this work calendar. Payroll and Attendance policies decide how each holiday is treated."
      >
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <HolidayMetricCard
                label="Central Available"
                value={centralHolidayPreviewRows.length}
              />
              <HolidayMetricCard
                label="Included"
                value={holidaySummary.included}
                color="success.main"
              />
              <HolidayMetricCard
                label="Removed"
                value={holidaySummary.removed}
                color="warning.main"
              />
              <HolidayMetricCard label="Manual" value={holidaySummary.manual} color="info.main" />
            </Stack>
            <LoadingButton
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:calendar-import" />}
              disabled={!academicYearId}
              loading={loadHolidayImportPreviewState.isFetching}
              onClick={importCentralHolidays}
            >
              {hasFinalizedHolidays ? 'Import from central Calendar' : 'Add all to calendar'}
            </LoadingButton>
          </Stack>
          {holidayReviewError ? <Alert severity="error">{holidayReviewError}</Alert> : null}
          {holidayReviewInfo ? <Alert severity="info">{holidayReviewInfo}</Alert> : null}
          {!academicYearId ? (
            <Alert severity="warning">
              Select an academic year before importing central holidays.
            </Alert>
          ) : null}
          {academicYearId && !hasFinalizedHolidays && hasCentralPreview ? (
            <Alert severity="info">
              {centralHolidayPreviewRows.length} central holidays are available. Review them, then
              add all to this work calendar.
            </Alert>
          ) : null}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: filtersActive
                  ? 'minmax(0, 1fr) minmax(180px, 220px) auto'
                  : 'minmax(0, 1fr) minmax(180px, 220px)',
              },
              gap: 1.25,
              alignItems: 'flex-end',
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search holiday name"
                value={holidayReviewFilters.search}
                onChange={(event) =>
                  setHolidayReviewFilters((current) => ({
                    ...current,
                    search: event.target.value,
                  }))
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mdi:magnify" width={18} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <DrawerField label="Month">
                <FormControl fullWidth size="small">
                  <Select
                    value={holidayReviewFilters.month}
                    displayEmpty
                    renderValue={(selected) =>
                      selected ? dayjs(`${selected}-01`).format('MMM YYYY') : 'All months'
                    }
                    onChange={(event) =>
                      setHolidayReviewFilters((current) => ({
                        ...current,
                        month: event.target.value,
                      }))
                    }
                  >
                    <MenuItem value="">All months</MenuItem>
                    {holidayMonthOptions.map((month) => (
                      <MenuItem key={month} value={month}>
                        {dayjs(`${month}-01`).format('MMM YYYY')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </DrawerField>
            </Box>
            {filtersActive ? (
              <Button
                size="small"
                sx={{ whiteSpace: 'nowrap' }}
                onClick={() => setHolidayReviewFilters({ search: '', month: '', source: 'all' })}
              >
                Clear filters
              </Button>
            ) : null}
          </Box>
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
            {(
              [
                ['all', 'All'],
                ['included', 'Included'],
                ['removed', 'Removed'],
                ['central_calendar', 'Central'],
                ['manual', 'Manual'],
              ] as const
            ).map(([value, label]) => (
              <Chip
                key={value}
                size="small"
                clickable
                label={label}
                color={holidayReviewFilters.source === value ? 'primary' : 'default'}
                variant={holidayReviewFilters.source === value ? 'filled' : 'outlined'}
                onClick={() =>
                  setHolidayReviewFilters((current) => ({
                    ...current,
                    source: value as HolidayReviewFilter,
                  }))
                }
              />
            ))}
          </Stack>
          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => openManualHolidayDialog()}
              startIcon={<Iconify icon="mdi:plus" />}
              size="small"
            >
              Add Manual Holiday
            </Button>
          </Stack>
          {loadCalendarHolidaysState.isFetching ? <LinearProgress /> : null}
          <TableContainer
            sx={{
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
              borderRadius: 1,
              maxHeight: 360,
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {['Date / Range', 'Days', 'Holiday', 'Source', 'Notes', 'Status', 'Actions'].map(
                    (column) => (
                      <TableCell key={column} align={column === 'Actions' ? 'right' : 'left'}>
                        {column}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHolidays.length ? (
                  filteredHolidays.map((holiday) => {
                    const originalIndex = calendarForm.holidays.indexOf(holiday);
                    return (
                      <TableRow
                        key={`${holiday.calendarHolidayId || holiday.holidayName}-${getHolidayFromDate(holiday)}-${originalIndex}`}
                        hover
                        sx={{ opacity: holiday.isIncluded ? 1 : 0.55 }}
                      >
                        <TableCell sx={{ whiteSpace: 'nowrap', minWidth: 190 }}>
                          {formatHolidayDateRange(holiday)}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {getHolidayDayCount(holiday)}
                        </TableCell>
                        <TableCell sx={{ minWidth: 180 }}>{holiday.holidayName}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={holiday.source === 'manual' ? 'Manual' : 'Central'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 220, maxWidth: 300 }}>
                          <Tooltip
                            title={holiday.notes || ''}
                            disableHoverListener={!holiday.notes}
                          >
                            <Typography variant="body2" noWrap>
                              {holiday.notes || '-'}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={
                              hasFinalizedHolidays
                                ? holiday.isIncluded
                                  ? 'success'
                                  : 'default'
                                : 'info'
                            }
                            label={
                              hasFinalizedHolidays
                                ? holiday.isIncluded
                                  ? 'Included'
                                  : 'Removed'
                                : 'Available'
                            }
                            variant={holiday.isIncluded ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          {!hasFinalizedHolidays ? (
                            <Typography variant="caption" color="text.secondary">
                              Add all first
                            </Typography>
                          ) : holiday.source === 'manual' ? (
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Tooltip title="Edit manual holiday">
                                <IconButton
                                  size="small"
                                  onClick={() => openManualHolidayDialog(originalIndex)}
                                >
                                  <Iconify icon="mdi:pencil-outline" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete manual holiday">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => removeManualHoliday(originalIndex)}
                                >
                                  <Iconify icon="mdi:delete-outline" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          ) : (
                            <Tooltip
                              leaveDelay={0}
                              TransitionProps={{ timeout: 120 }}
                              slotProps={{ popper: { sx: { pointerEvents: 'none' } } }}
                              title={
                                holiday.isIncluded
                                  ? 'Remove from this calendar'
                                  : 'Restore to calendar'
                              }
                            >
                              <IconButton
                                size="small"
                                color={holiday.isIncluded ? 'error' : 'primary'}
                                onClick={() =>
                                  updateCalendarHoliday(originalIndex, {
                                    isIncluded: !holiday.isIncluded,
                                  })
                                }
                              >
                                <Iconify
                                  icon={
                                    holiday.isIncluded ? 'mdi:trash-can-outline' : 'mdi:restore'
                                  }
                                />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <EmptyRows
                    colSpan={7}
                    message={
                      hasCentralPreview && !hasFinalizedHolidays
                        ? 'Central holidays are available. Add them to finalize this calendar.'
                        : 'No holidays match current filters.'
                    }
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Paper variant="outlined" sx={{ p: 1.25, bgcolor: 'action.hover' }}>
            <Typography variant="caption" color="text.secondary">
              Save summary
            </Typography>
            <Typography variant="body2">
              This calendar will store {holidaySummary.included} included holidays,{' '}
              {holidaySummary.removed} removed central holidays, and {holidaySummary.manual} manual
              holidays.
            </Typography>
          </Paper>
        </Stack>
      </PolicySection>
    </PolicyDrawerLayout>
  );
}

'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { EmptyContent } from 'src/components/empty-content';
import ShakingTextField from 'src/components/shaking-text-field';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { FormSectionCard, FormSectionHeader } from 'src/components/form-section-card';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { useAcademicDiscardGuard } from 'src/screens/academic/components/useAcademicDiscardGuard';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  Drawer,
  Switch,
  Divider,
  Skeleton,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { RoomStatusChip } from './RoomStatusChip';
import { SuggestedRoomBookingButton } from './SuggestedRoomBookingButton';
import { useRoomSuggestions, useCreateRoomReservation } from '../roomAvailability.hooks';
import {
  validateRoomSearchRequirements,
  validateRoomBookingRequirements,
} from '../services/roomSuggestionSearch';
import {
  resolveFacility,
  PRIORITY_OPTIONS,
  SUGGESTION_BADGE_LABELS,
  RESERVATION_TYPE_OPTIONS,
} from '../roomAvailability.constants';
import {
  filterRoomSuggestions,
  ALL_ROOM_FILTER_VALUE,
  getRoomSuggestionFilterOptions,
  hasActiveRoomSuggestionFilters,
  DEFAULT_ROOM_SUGGESTION_FILTERS,
} from '../services/roomSuggestionFilters';

import type { RoomSuggestionFilters } from '../services/roomSuggestionFilters';
import type { SuggestedRoom, RoomReservation, ReservationRequirements } from '../types';

const MatchScoreBadge = ({ score }: { score: number }) => {
  const isHigh = score >= 80;
  const isMedium = score >= 60;
  const color = isHigh ? 'success.main' : isMedium ? 'warning.main' : 'text.secondary';

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.25,
        py: 0.5,
        borderRadius: 1,
        bgcolor: (theme) => {
          if (isHigh) return alpha(theme.palette.success.main, 0.08);
          if (isMedium) return alpha(theme.palette.warning.main, 0.08);
          return alpha(theme.palette.text.secondary, 0.08);
        },
        border: 1,
        borderColor: (theme) => {
          if (isHigh) return alpha(theme.palette.success.main, 0.16);
          if (isMedium) return alpha(theme.palette.warning.main, 0.16);
          return alpha(theme.palette.text.secondary, 0.16);
        },
      }}
    >
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
      <Typography sx={{ fontSize: 11, fontWeight: 700, color, lineHeight: 1 }}>
        {score}% Match
      </Typography>
    </Box>
  );
};

const defaultRequirements: ReservationRequirements = {
  reservationType: 'class',
  purpose: '',
  date: dayjs().format('YYYY-MM-DD'),
  startTime: '09:00',
  endTime: '09:45',
  lectureSlot: '',
  requiredCapacity: 0,
  preferredBuilding: 'all',
  roomType: 'all',
  requiredFacilities: [],
  reservedFor: '',
  subject: '',
  teacherName: '',
  priority: 'normal',
  isRecurring: false,
  recurringConfig: {
    repeatType: 'daily',
    repeatDays: [],
    untilDate: dayjs().add(1, 'month').format('YYYY-MM-DD'),
    excludeHolidays: true,
    excludeExamDays: false,
    skipConflictDates: false,
  },
  remarks: '',
  aiCommand: '',
};

const CAPACITY_FILTER_OPTIONS = [
  { value: 0, label: 'Any capacity' },
  { value: 20, label: '20+ seats' },
  { value: 40, label: '40+ seats' },
  { value: 60, label: '60+ seats' },
  { value: 100, label: '100+ seats' },
];

const MATCH_SCORE_FILTER_OPTIONS = [
  { value: 0, label: 'Any match score' },
  { value: 60, label: '60%+ match' },
  { value: 80, label: '80%+ match' },
  { value: 90, label: '90%+ match' },
  { value: 100, label: '100% match' },
];

interface SmartRoomReservationDrawerProps {
  open: boolean;
  prefilledRoom?: { roomId: string; roomName: string } | null;
  prefillDate?: string;
  onClose: () => void;
  onSuccess?: (reservation: RoomReservation) => void;
}

export const SmartRoomReservationDrawer = ({
  open,
  prefilledRoom,
  prefillDate,
  onClose,
  onSuccess,
}: SmartRoomReservationDrawerProps) => {
  const { data: session } = useSession() as any;
  const userRoles = session?.profile?.role || [];
  const rolesList = Array.isArray(userRoles) ? userRoles : [userRoles];
  const isAdmin = rolesList.some(
    (r: string) => r.toLowerCase() === 'administrator' || r.toLowerCase() === 'admin'
  );

  const [requirements, setRequirements] = useState<ReservationRequirements>({
    ...defaultRequirements,
  });
  const [baseline, setBaseline] = useState<ReservationRequirements>({ ...defaultRequirements });
  const [searched, setSearched] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [bookingRoomId, setBookingRoomId] = useState<string | null>(null);
  const [resultFilters, setResultFilters] = useState<RoomSuggestionFilters>({
    ...DEFAULT_ROOM_SUGGESTION_FILTERS,
  });

  const suggestions = useRoomSuggestions();
  const { suggest } = suggestions;
  const createReservation = useCreateRoomReservation();

  const discardGuard = useAcademicDiscardGuard(
    open && JSON.stringify(requirements) !== JSON.stringify(baseline),
    Boolean(bookingRoomId)
  );

  const buildingOptions = useMemo(
    () => getRoomSuggestionFilterOptions(suggestions.data, 'buildingName'),
    [suggestions.data]
  );
  const roomsInSelectedBuilding = useMemo(
    () =>
      resultFilters.building === ALL_ROOM_FILTER_VALUE
        ? suggestions.data
        : suggestions.data.filter((room) => room.buildingName === resultFilters.building),
    [resultFilters.building, suggestions.data]
  );
  const floorOptions = useMemo(
    () => getRoomSuggestionFilterOptions(roomsInSelectedBuilding, 'floorName'),
    [roomsInSelectedBuilding]
  );
  const filteredSuggestions = useMemo(
    () => filterRoomSuggestions(suggestions.data, resultFilters),
    [resultFilters, suggestions.data]
  );
  const hasResultFilters = hasActiveRoomSuggestionFilters(resultFilters);

  const patchRequirements = useCallback((patch: Partial<ReservationRequirements>) => {
    setRequirements((prev) => ({ ...prev, ...patch }));
    setFieldErrors((prev) => {
      const updated = { ...prev };
      Object.keys(patch).forEach((key) => {
        delete updated[key];
      });
      return updated;
    });
  }, []);

  const patchResultFilters = useCallback((patch: Partial<RoomSuggestionFilters>) => {
    setResultFilters((previous) => ({ ...previous, ...patch }));
  }, []);

  const clearResultFilters = useCallback(() => {
    setResultFilters({ ...DEFAULT_ROOM_SUGGESTION_FILTERS });
  }, []);

  // Auto-search if a prefilled room is provided
  useEffect(() => {
    if (open) {
      if (prefilledRoom) {
        const reqs = {
          ...defaultRequirements,
          selectedRoomId: prefilledRoom.roomId,
          date: prefillDate || dayjs().format('YYYY-MM-DD'),
        };
        setRequirements(reqs);
        setBaseline(reqs);
        suggest(reqs);
        setSearched(true);
      } else {
        const reqs = { ...defaultRequirements, date: prefillDate || dayjs().format('YYYY-MM-DD') };
        setRequirements(reqs);
        setBaseline(reqs);
        setSearched(false);
      }
      setFieldErrors({});
      clearResultFilters();
    }
  }, [open, prefilledRoom, prefillDate, suggest, clearResultFilters]);

  const handleSearch = async () => {
    const errors = validateRoomSearchRequirements(requirements);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setFieldErrors({});
    clearResultFilters();
    setSearched(true);
    await suggestions.suggest(requirements);
  };

  const handleBookRoom = async (room: SuggestedRoom) => {
    if (bookingRoomId) return;

    const errors = validateRoomBookingRequirements(requirements);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setBookingRoomId(room.roomId);
    try {
      // Only admins can bypass approval if the room doesn't strictly need it
      const isApprovalRequired =
        !isAdmin || room.conflictStatus === 'warning' || room.needsApproval;
      const statusVal = isApprovalRequired ? 'pendingApproval' : 'active';

      const result = await createReservation.create({
        roomId: room.roomId,
        roomName: room.roomName,
        buildingName: room.buildingName,
        date: requirements.date,
        startTime: requirements.startTime,
        endTime: requirements.endTime,
        purpose: requirements.purpose,
        reservationType: requirements.reservationType as any,
        reservedFor: requirements.reservedFor,
        requestedBy: requirements.teacherName || 'Current User',
        teacherName: requirements.teacherName,
        subject: requirements.subject,
        approvalStatus: isApprovalRequired ? 'pending' : 'approved',
        status: statusVal as any,
        remarks: requirements.remarks,
        isRecurring: requirements.isRecurring,
        recurringConfig: requirements.isRecurring
          ? {
              repeatType: requirements.recurringConfig?.repeatType || 'daily',
              repeatDays: requirements.recurringConfig?.repeatDays || [],
              untilDate: requirements.recurringConfig?.untilDate || requirements.date,
              excludeHolidays: requirements.recurringConfig?.excludeHolidays ?? true,
              excludeExamDays: requirements.recurringConfig?.excludeExamDays ?? false,
              skipConflictDates: requirements.recurringConfig?.skipConflictDates ?? false,
            }
          : undefined,
      } as any);

      if (result) {
        shikshaMitraToast.success({
          message: isApprovalRequired
            ? 'Reservation submitted for admin approval.'
            : 'Room reserved successfully!',
        });
        onSuccess?.(result);
        closeAndReset();
      }
    } catch (err: any) {
      const errorMsg = err?.data?.error?.message || 'Failed to create reservation.';
      shikshaMitraToast.error({ message: errorMsg });
    } finally {
      setBookingRoomId(null);
    }
  };

  const closeAndReset = () => {
    setRequirements({ ...defaultRequirements });
    setSearched(false);
    setFieldErrors({});
    setBookingRoomId(null);
    clearResultFilters();
    suggestions.reset();
    onClose();
  };

  const handleClose = () => discardGuard.requestNavigation(closeAndReset);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-label': 'Reserve a Room',
        sx: {
          width: { xs: '100%', md: 1080, xl: 1320 },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          borderTopLeftRadius: { md: 16 },
          borderBottomLeftRadius: { md: 16 },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          flexShrink: 0,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <FormSectionHeader
          title="Reserve a Room"
          icon={GlobalIcons.reservation}
          titleTypographyProps={{ variant: 'h6' }}
          descriptionTooltip="Choose the date, time and reservation details, find matching rooms, then reserve an available room or request approval."
          action={
            <IconButton aria-label="Close room reservation" onClick={handleClose}>
              <Iconify icon={GlobalIcons.cancel} width={20} />
            </IconButton>
          }
        />
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: { xs: 'auto', md: 'hidden' },
          p: { xs: 2, sm: 3 },
          bgcolor: 'background.neutral',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ height: { xs: 'auto', md: '100%' }, minHeight: 0, alignItems: 'stretch' }}
        >
          {/* Left Column: Form Fields (No scrolling on column container) */}
          <Box
            sx={{
              flex: { xs: '0 0 auto', md: 1 },
              minWidth: 0,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              height: { xs: 'auto', md: '100%' },
            }}
          >
            {/* Scrollable Fields */}
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: { xs: 'visible', md: 'auto' },
                pr: { md: 1 },
              }}
            >
              <Stack spacing={2}>
                <FormSectionCard
                  title="Booking Requirements"
                  icon={GlobalIcons.calendar}
                  descriptionTooltip="Set the reservation purpose, date, time and optional recurrence before finding a room."
                  action={
                    <Button
                      type="button"
                      variant="outlined"
                      color="inherit"
                      size="small"
                      onClick={handleSearch}
                      disabled={suggestions.isLoading}
                      startIcon={
                        suggestions.isLoading ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <Iconify icon={GlobalIcons.search} />
                        )
                      }
                    >
                      Find rooms
                    </Button>
                  }
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <ShakingTextField error={!!fieldErrors.reservationType}>
                      <CustomSelect
                        name="reservationType"
                        label="Reservation type"
                        required
                        options={RESERVATION_TYPE_OPTIONS.map((o) => ({
                          value: o.value,
                          label: o.label,
                        }))}
                        value={requirements.reservationType}
                        onChange={(v) => patchRequirements({ reservationType: v as any })}
                        error={!!fieldErrors.reservationType}
                        helperText={fieldErrors.reservationType}
                      />
                    </ShakingTextField>
                    <CustomSelect
                      label="Priority"
                      options={PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                      value={requirements.priority}
                      onChange={(v) => patchRequirements({ priority: v as any })}
                    />
                  </Stack>

                  <ShakingTextField error={!!fieldErrors.purpose}>
                    <TextField
                      size="small"
                      name="purpose"
                      label="Purpose"
                      required
                      value={requirements.purpose}
                      onChange={(e) => patchRequirements({ purpose: e.target.value })}
                      fullWidth
                      placeholder="e.g. Grade 9 Physics Practical"
                      error={!!fieldErrors.purpose}
                      helperText={fieldErrors.purpose}
                    />
                  </ShakingTextField>

                  <ShakingTextField error={!!fieldErrors.date}>
                    <DatePicker
                      label="Date"
                      format="DD/MM/YYYY"
                      value={dayjs(requirements.date)}
                      onChange={(v: Dayjs | null) => {
                        if (v) patchRequirements({ date: v.format('YYYY-MM-DD') });
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          required: true,
                          error: !!fieldErrors.date,
                          helperText: fieldErrors.date,
                        },
                      }}
                    />
                  </ShakingTextField>

                  <Stack spacing={2}>
                    <ShakingTextField error={!!fieldErrors.startTime}>
                      <TimePicker
                        label="Start time"
                        format="hh:mm A"
                        value={
                          requirements.startTime
                            ? dayjs(`2000-01-01T${requirements.startTime}`)
                            : null
                        }
                        onChange={(v: Dayjs | null) => {
                          patchRequirements({
                            startTime: v && v.isValid() ? v.format('HH:mm') : '',
                          });
                        }}
                        viewRenderers={{
                          hours: renderTimeViewClock,
                          minutes: renderTimeViewClock,
                        }}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            required: true,
                            error: !!fieldErrors.startTime,
                            helperText: fieldErrors.startTime,
                          },
                        }}
                      />
                    </ShakingTextField>
                    <ShakingTextField error={!!fieldErrors.endTime}>
                      <TimePicker
                        label="End time"
                        format="hh:mm A"
                        value={
                          requirements.endTime ? dayjs(`2000-01-01T${requirements.endTime}`) : null
                        }
                        onChange={(v: Dayjs | null) => {
                          patchRequirements({
                            endTime: v && v.isValid() ? v.format('HH:mm') : '',
                          });
                        }}
                        viewRenderers={{
                          hours: renderTimeViewClock,
                          minutes: renderTimeViewClock,
                        }}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            required: true,
                            error: !!fieldErrors.endTime,
                            helperText: fieldErrors.endTime,
                          },
                        }}
                      />
                    </ShakingTextField>
                  </Stack>

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon={GlobalIcons.refresh} width={20} color="text.secondary" />
                      <Typography variant="body2" fontWeight={600}>
                        Recurring reservation
                      </Typography>
                    </Stack>
                    <Switch
                      slotProps={{ input: { 'aria-label': 'Recurring reservation' } }}
                      checked={requirements.isRecurring}
                      onChange={(e) => patchRequirements({ isRecurring: e.target.checked })}
                    />
                  </Stack>

                  {requirements.isRecurring && (
                    <Stack spacing={2}>
                      <FormSectionHeader
                        title="Recurring Configuration"
                        icon={GlobalIcons.refresh}
                        descriptionTooltip="Choose when to repeat this reservation, its end date and which dates to exclude."
                      />

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <CustomSelect
                          label="Repeat pattern"
                          options={[
                            { value: 'daily', label: 'Daily' },
                            { value: 'weekly', label: 'Weekly' },
                          ]}
                          value={requirements.recurringConfig?.repeatType || 'daily'}
                          onChange={(v) => {
                            patchRequirements({
                              recurringConfig: {
                                ...(requirements.recurringConfig || {
                                  excludeHolidays: true,
                                  excludeExamDays: false,
                                  skipConflictDates: false,
                                }),
                                repeatType: v as any,
                              },
                            });
                          }}
                        />

                        <ShakingTextField error={!!fieldErrors.untilDate}>
                          <DatePicker
                            label="Repeat until"
                            format="DD/MM/YYYY"
                            value={dayjs(requirements.recurringConfig?.untilDate)}
                            onChange={(v: Dayjs | null) => {
                              if (v) {
                                patchRequirements({
                                  recurringConfig: {
                                    ...(requirements.recurringConfig || {
                                      repeatType: 'daily',
                                      excludeHolidays: true,
                                      excludeExamDays: false,
                                      skipConflictDates: false,
                                    }),
                                    untilDate: v.format('YYYY-MM-DD'),
                                  },
                                });
                              }
                            }}
                            slotProps={{
                              textField: {
                                size: 'small',
                                fullWidth: true,
                                required: true,
                                error: !!fieldErrors.untilDate,
                                helperText: fieldErrors.untilDate,
                              },
                            }}
                          />
                        </ShakingTextField>
                      </Stack>

                      {requirements.recurringConfig?.repeatType === 'weekly' && (
                        <Stack spacing={1}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Repeat on days
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            {[
                              { label: 'Mon', value: 1 },
                              { label: 'Tue', value: 2 },
                              { label: 'Wed', value: 3 },
                              { label: 'Thu', value: 4 },
                              { label: 'Fri', value: 5 },
                              { label: 'Sat', value: 6 },
                              { label: 'Sun', value: 0 },
                            ].map((day) => {
                              const daysList = requirements.recurringConfig?.repeatDays || [];
                              const isSelected = daysList.includes(day.value);
                              return (
                                <Chip
                                  key={day.value}
                                  label={day.label}
                                  clickable
                                  color={isSelected ? 'primary' : 'default'}
                                  variant={isSelected ? 'filled' : 'outlined'}
                                  onClick={() => {
                                    const newDays = isSelected
                                      ? daysList.filter((d) => d !== day.value)
                                      : [...daysList, day.value];
                                    patchRequirements({
                                      recurringConfig: {
                                        ...(requirements.recurringConfig || {
                                          repeatType: 'weekly',
                                          excludeHolidays: true,
                                          excludeExamDays: false,
                                          skipConflictDates: false,
                                        }),
                                        repeatDays: newDays,
                                      },
                                    });
                                  }}
                                />
                              );
                            })}
                          </Stack>
                        </Stack>
                      )}

                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={requirements.recurringConfig?.excludeHolidays ?? true}
                              onChange={(e) => {
                                patchRequirements({
                                  recurringConfig: {
                                    ...(requirements.recurringConfig || {
                                      repeatType: 'daily',
                                      excludeExamDays: false,
                                      skipConflictDates: false,
                                    }),
                                    excludeHolidays: e.target.checked,
                                  },
                                });
                              }}
                            />
                          }
                          label="Exclude holidays"
                        />

                        <FormControlLabel
                          control={
                            <Switch
                              checked={requirements.recurringConfig?.excludeExamDays ?? false}
                              onChange={(e) => {
                                patchRequirements({
                                  recurringConfig: {
                                    ...(requirements.recurringConfig || {
                                      repeatType: 'daily',
                                      excludeHolidays: true,
                                      skipConflictDates: false,
                                    }),
                                    excludeExamDays: e.target.checked,
                                  },
                                });
                              }}
                            />
                          }
                          label="Exclude exam days"
                        />

                        <FormControlLabel
                          control={
                            <Switch
                              checked={requirements.recurringConfig?.skipConflictDates ?? false}
                              onChange={(e) => {
                                patchRequirements({
                                  recurringConfig: {
                                    ...(requirements.recurringConfig || {
                                      repeatType: 'daily',
                                      excludeHolidays: true,
                                      excludeExamDays: false,
                                    }),
                                    skipConflictDates: e.target.checked,
                                  },
                                });
                              }}
                            />
                          }
                          label="Skip conflicts"
                        />
                      </Stack>
                    </Stack>
                  )}

                  <TextField
                    size="small"
                    label="Remarks"
                    value={requirements.remarks || ''}
                    onChange={(e) => patchRequirements({ remarks: e.target.value })}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </FormSectionCard>
              </Stack>
            </Box>
          </Box>

          {/* Vertical Divider */}
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

          {/* Right Column: Search Results (Independently Scrollable) */}
          <Box
            sx={{
              flex: { xs: '0 0 auto', md: 1.6 },
              minWidth: 0,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              height: { xs: 'auto', md: '100%' },
            }}
          >
            <Stack spacing={2} sx={{ height: { xs: 'auto', md: '100%' }, minHeight: 0 }}>
              <FormSectionHeader
                title="Available Rooms"
                icon={GlobalIcons.reservation}
                descriptionTooltip="Rooms matching the selected booking date and time, including availability, capacity and approval requirements."
                action={
                  searched &&
                  !suggestions.isLoading &&
                  suggestions.data.length > 0 && (
                    <Chip
                      size="small"
                      label={
                        hasResultFilters
                          ? `${filteredSuggestions.length} of ${suggestions.data.length}`
                          : `${suggestions.data.length} found`
                      }
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  )
                }
              />

              {searched && !suggestions.isLoading && suggestions.data.length > 0 && (
                <Box
                  sx={{
                    p: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Stack spacing={1.25}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        fullWidth
                        size="small"
                        label="Search available rooms"
                        placeholder="Room name, building, floor, type, or facility"
                        value={resultFilters.search}
                        onChange={(event) => patchResultFilters({ search: event.target.value })}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Iconify icon="eva:search-fill" width={18} />
                            </InputAdornment>
                          ),
                          endAdornment: resultFilters.search ? (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                aria-label="Clear room search"
                                onClick={() => patchResultFilters({ search: '' })}
                              >
                                <Iconify icon="eva:close-fill" width={17} />
                              </IconButton>
                            </InputAdornment>
                          ) : undefined,
                        }}
                      />
                      {hasResultFilters && (
                        <Button
                          size="small"
                          color="inherit"
                          onClick={clearResultFilters}
                          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                        >
                          Clear filters
                        </Button>
                      )}
                    </Stack>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: 'repeat(2, minmax(0, 1fr))',
                          lg: 'repeat(4, minmax(0, 1fr))',
                        },
                        gap: 1,
                      }}
                    >
                      <CustomSelect
                        label="Building"
                        value={resultFilters.building}
                        options={[
                          { value: ALL_ROOM_FILTER_VALUE, label: 'All buildings' },
                          ...buildingOptions.map((building) => ({
                            value: building,
                            label: building,
                          })),
                        ]}
                        onChange={(value) =>
                          patchResultFilters({
                            building: String(value),
                            floor: ALL_ROOM_FILTER_VALUE,
                          })
                        }
                      />
                      <CustomSelect
                        label="Floor"
                        value={resultFilters.floor}
                        options={[
                          { value: ALL_ROOM_FILTER_VALUE, label: 'All floors' },
                          ...floorOptions.map((floor) => ({ value: floor, label: floor })),
                        ]}
                        onChange={(value) => patchResultFilters({ floor: String(value) })}
                      />
                      <CustomSelect
                        label="Minimum capacity"
                        value={resultFilters.minimumCapacity}
                        options={CAPACITY_FILTER_OPTIONS}
                        onChange={(value) => patchResultFilters({ minimumCapacity: Number(value) })}
                      />
                      <CustomSelect
                        label="Match score"
                        value={resultFilters.minimumMatchScore}
                        options={MATCH_SCORE_FILTER_OPTIONS}
                        onChange={(value) =>
                          patchResultFilters({ minimumMatchScore: Number(value) })
                        }
                      />
                    </Box>
                  </Stack>
                </Box>
              )}

              {!searched && (
                <Box
                  sx={{
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                  }}
                >
                  <EmptyContent
                    title="Find available rooms"
                    description="Choose the booking requirements, then select Find rooms to view matching rooms."
                    sx={{ py: 3, height: { xs: 'auto', md: 1 } }}
                  />
                </Box>
              )}

              {searched && (
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: { xs: 'visible', md: 'auto' },
                    pr: { md: 1 },
                  }}
                >
                  {suggestions.isLoading && (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 2,
                      }}
                    >
                      {[1, 2, 3, 4].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            p: 2.5,
                            borderRadius: 2,
                            border: 1,
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Skeleton variant="text" width={130} height={24} />
                            <Skeleton
                              variant="rectangular"
                              width={70}
                              height={22}
                              sx={{ borderRadius: 1 }}
                            />
                          </Stack>
                          <Skeleton variant="text" width="75%" height={16} />
                          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                            <Skeleton
                              variant="rectangular"
                              width={65}
                              height={20}
                              sx={{ borderRadius: 1 }}
                            />
                            <Skeleton
                              variant="rectangular"
                              width={75}
                              height={20}
                              sx={{ borderRadius: 1 }}
                            />
                          </Stack>
                          <Skeleton
                            variant="rectangular"
                            height={36}
                            sx={{ borderRadius: 1.5, mt: 1 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}

                  {suggestions.error && (
                    <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                      {suggestions.error}
                    </Alert>
                  )}

                  {!suggestions.isLoading &&
                    !suggestions.error &&
                    suggestions.data.length === 0 && (
                      <EmptyContent
                        title="No matching rooms found"
                        description="Try changing the booking date, time or requirements."
                        sx={{ py: 3, height: { xs: 'auto', md: 1 } }}
                      />
                    )}

                  {!suggestions.isLoading &&
                    suggestions.data.length > 0 &&
                    filteredSuggestions.length === 0 && (
                      <EmptyContent
                        title="No rooms match these filters"
                        description="Clear or adjust the result filters to view more available rooms."
                        sx={{ py: 3, height: { xs: 'auto', md: 1 } }}
                        action={
                          <Button
                            type="button"
                            size="small"
                            color="inherit"
                            variant="outlined"
                            onClick={clearResultFilters}
                            startIcon={<Iconify icon={GlobalIcons.resetFilter} />}
                            sx={{ mt: 2 }}
                          >
                            Clear filters
                          </Button>
                        }
                      />
                    )}

                  {!suggestions.isLoading && filteredSuggestions.length > 0 && (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 2,
                        alignItems: 'start',
                      }}
                    >
                      {filteredSuggestions.map((room) => {
                        const isCritical = room.conflictStatus === 'critical';
                        const isWarning = room.conflictStatus === 'warning' || room.needsApproval;
                        const accentColor = isCritical
                          ? 'error.main'
                          : isWarning
                            ? 'warning.main'
                            : 'success.main';

                        return (
                          <Box
                            key={room.roomId}
                            sx={{
                              p: 2.5,
                              borderRadius: 2,
                              border: 1,
                              borderColor: 'divider',
                              borderLeft: 4,
                              borderLeftColor: accentColor,
                              bgcolor: 'background.paper',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 1.5,
                              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: '0 8px 20px 0 rgba(0,0,0,0.1)',
                                transform: 'translateY(-2px)',
                              },
                            }}
                          >
                            <Stack spacing={1}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={700}
                                  sx={{ fontSize: 16 }}
                                >
                                  {room.roomName}
                                </Typography>
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                  <MatchScoreBadge score={room.matchScore} />
                                  <RoomStatusChip
                                    status={
                                      isCritical ? 'conflict' : isWarning ? 'reserved' : 'available'
                                    }
                                    showIcon={false}
                                  />
                                </Stack>
                              </Stack>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: 12.5 }}
                              >
                                {room.buildingName} · {room.floorName} · {room.type} ·{' '}
                                {room.capacity} seats
                              </Typography>
                            </Stack>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ lineHeight: 1.5 }}
                            >
                              {room.reason}
                            </Typography>

                            {/* Badges */}
                            {room.badges.length > 0 && (
                              <Stack direction="row" flexWrap="wrap" gap={1}>
                                {room.badges.map((badge) => (
                                  <Chip
                                    key={badge}
                                    size="small"
                                    label={SUGGESTION_BADGE_LABELS[badge]}
                                    color={
                                      badge === 'warning' || badge === 'needsApproval'
                                        ? 'warning'
                                        : 'info'
                                    }
                                    variant="outlined"
                                    sx={{ fontSize: 10, height: 18 }}
                                  />
                                ))}
                              </Stack>
                            )}

                            {/* Facilities */}
                            {room.facilities.length > 0 && (
                              <Stack direction="row" flexWrap="wrap" gap={0.5} alignItems="center">
                                {room.facilities.slice(0, 3).map((f) => {
                                  const { label, icon } = resolveFacility(f);
                                  return (
                                    <Stack
                                      key={f}
                                      direction="row"
                                      alignItems="center"
                                      spacing={0.5}
                                      sx={{
                                        px: 0.75,
                                        py: 0.25,
                                        borderRadius: 0.5,
                                        border: 1,
                                        borderColor: 'divider',
                                        bgcolor: 'background.neutral',
                                      }}
                                    >
                                      <Iconify
                                        icon={icon}
                                        width={11}
                                        sx={{ color: 'text.secondary', flexShrink: 0 }}
                                      />
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontSize: 10,
                                          color: 'text.secondary',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {label}
                                      </Typography>
                                    </Stack>
                                  );
                                })}
                                {room.facilities.length > 3 && (
                                  <Typography
                                    variant="caption"
                                    sx={{ fontSize: 10, color: 'text.disabled', ml: 0.5 }}
                                  >
                                    +{room.facilities.length - 3} more
                                  </Typography>
                                )}
                              </Stack>
                            )}

                            {/* Book Action */}
                            <SuggestedRoomBookingButton
                              roomId={room.roomId}
                              roomName={room.roomName}
                              bookingRoomId={bookingRoomId}
                              isCritical={isCritical}
                              isWarning={isWarning}
                              onBook={() => handleBookRoom(room)}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Footer */}
      <Divider />
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        sx={{ px: { xs: 2, sm: 3 }, py: 1.75, flexShrink: 0, bgcolor: 'background.paper' }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
        >
          Cancel
        </Button>
      </Stack>
      {discardGuard.confirmation}
    </Drawer>
  );
};

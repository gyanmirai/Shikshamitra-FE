'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
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

const StepBadge = ({ number }: { number: number }) => (
  <Box
    sx={{
      width: 26,
      height: 26,
      borderRadius: '50%',
      bgcolor: 'primary.main',
      color: 'common.white',
      fontSize: 13,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    {number}
  </Box>
);

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
  const [searched, setSearched] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [bookingRoomId, setBookingRoomId] = useState<string | null>(null);
  const [resultFilters, setResultFilters] = useState<RoomSuggestionFilters>({
    ...DEFAULT_ROOM_SUGGESTION_FILTERS,
  });

  const suggestions = useRoomSuggestions();
  const { suggest } = suggestions;
  const createReservation = useCreateRoomReservation();

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
        suggest(reqs);
        setSearched(true);
      } else {
        setRequirements({
          ...defaultRequirements,
          date: prefillDate || dayjs().format('YYYY-MM-DD'),
        });
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
        handleClose();
      }
    } catch (err: any) {
      const errorMsg = err?.data?.error?.message || 'Failed to create reservation.';
      shikshaMitraToast.error({ message: errorMsg });
    } finally {
      setBookingRoomId(null);
    }
  };

  const handleClose = () => {
    setRequirements({ ...defaultRequirements });
    setSearched(false);
    setFieldErrors({});
    setBookingRoomId(null);
    clearResultFilters();
    suggestions.reset();
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 1080, xl: 1320 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          borderTopLeftRadius: { md: 16 },
          borderBottomLeftRadius: { md: 16 },
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: 1,
          borderColor: 'divider',
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
            }}
          >
            <Iconify icon="mdi:calendar-plus" width={24} sx={{ color: 'common.white' }} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={700} lineHeight={1.3}>
                Reserve a Room
              </Typography>
              <CustomTooltip
                title="Select date, timeslot, and room requirements to view instant AI recommendations with match scoring and conflict checks."
                arrow
                placement="right"
              >
                <Iconify
                  icon={GlobalIcons.info}
                  color="info.main"
                  width={18}
                  height={18}
                  sx={{ cursor: 'pointer', mt: 0.25 }}
                />
              </CustomTooltip>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Find and book the perfect space in seconds
            </Typography>
          </Box>
        </Stack>
        <IconButton
          onClick={handleClose}
          sx={{
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Iconify icon="mdi:close" width={20} />
        </IconButton>
      </Stack>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 2.5, bgcolor: 'background.neutral' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ height: '100%', alignItems: 'stretch', overflow: 'hidden' }}
        >
          {/* Left Column: Form Fields (No scrolling on column container) */}
          <Box
            sx={{
              flex: 1,
              minWidth: { md: 450 },
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            {/* Scrollable Fields */}
            <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <StepBadge number={1} />
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                      Booking Requirements
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    onClick={handleSearch}
                    disabled={suggestions.isLoading}
                    startIcon={
                      suggestions.isLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <Iconify icon="mdi:magnify" />
                      )
                    }
                    sx={{
                      borderRadius: 1.5,
                      fontWeight: 700,
                      boxShadow: (theme) =>
                        `0 4px 12px 0 ${alpha(theme.palette.primary.main, 0.16)}`,
                    }}
                  >
                    Find Rooms
                  </Button>
                </Stack>

                <Stack
                  spacing={2}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <CustomSelect
                      label="Reservation Type *"
                      options={RESERVATION_TYPE_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                      value={requirements.reservationType}
                      onChange={(v) => patchRequirements({ reservationType: v as any })}
                      error={!!fieldErrors.reservationType}
                      helperText={fieldErrors.reservationType}
                    />
                    <CustomSelect
                      label="Priority"
                      options={PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                      value={requirements.priority}
                      onChange={(v) => patchRequirements({ priority: v as any })}
                    />
                  </Stack>

                  <TextField
                    size="small"
                    label="Purpose *"
                    value={requirements.purpose}
                    onChange={(e) => patchRequirements({ purpose: e.target.value })}
                    fullWidth
                    placeholder="e.g. Grade 9 Physics Practical"
                    error={!!fieldErrors.purpose}
                    helperText={fieldErrors.purpose}
                  />

                  <DatePicker
                    label="Date *"
                    format="DD/MM/YYYY"
                    value={dayjs(requirements.date)}
                    onChange={(v: Dayjs | null) => {
                      if (v) patchRequirements({ date: v.format('YYYY-MM-DD') });
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: !!fieldErrors.date,
                        helperText: fieldErrors.date,
                      },
                    }}
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TimePicker
                      label="Start Time *"
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
                          error: !!fieldErrors.startTime,
                          helperText: fieldErrors.startTime,
                        },
                      }}
                    />
                    <TimePicker
                      label="End Time *"
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
                          error: !!fieldErrors.endTime,
                          helperText: fieldErrors.endTime,
                        },
                      }}
                    />
                  </Stack>

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: 1,
                      borderColor: requirements.isRecurring ? 'primary.main' : 'divider',
                      bgcolor: (theme) =>
                        requirements.isRecurring
                          ? alpha(theme.palette.primary.main, 0.06)
                          : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Iconify icon="mdi:calendar-sync" width={20} color="primary.main" />
                      <Typography variant="body2" fontWeight={600}>
                        Recurring Reservation
                      </Typography>
                    </Stack>
                    <Switch
                      checked={requirements.isRecurring}
                      onChange={(e) => patchRequirements({ isRecurring: e.target.checked })}
                    />
                  </Stack>

                  {requirements.isRecurring && (
                    <Stack
                      spacing={2}
                      sx={{
                        p: 2,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                        borderRadius: 1.5,
                        border: 1,
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.16),
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} color="primary.main">
                        Recurring Configuration
                      </Typography>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <CustomSelect
                          label="Repeat Pattern"
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

                        <DatePicker
                          label="Repeat Until *"
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
                              error: !!fieldErrors.untilDate,
                              helperText: fieldErrors.untilDate,
                            },
                          }}
                        />
                      </Stack>

                      {requirements.recurringConfig?.repeatType === 'weekly' && (
                        <Stack spacing={1}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Repeat On Days
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
                          label="Exclude Holidays"
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
                          label="Exclude Exam Days"
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
                          label="Skip Conflicts"
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
                </Stack>
              </Stack>
            </Box>
          </Box>

          {/* Vertical Divider */}
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

          {/* Right Column: Search Results (Independently Scrollable) */}
          <Box
            sx={{
              flex: 1.6,
              minWidth: { md: 450 },
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Stack spacing={1} sx={{ height: '100%' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <StepBadge number={2} />
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    Available Rooms
                  </Typography>
                </Stack>
                {searched && !suggestions.isLoading && suggestions.data.length > 0 && (
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
                )}
              </Stack>

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
                    py: 8,
                    textAlign: 'center',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 3,
                    flex: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      bgcolor: 'background.neutral',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Iconify icon="mdi:door-closed" width={36} sx={{ color: 'text.disabled' }} />
                  </Box>
                  <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1 }}>
                    No Search Conducted Yet
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ maxWidth: 320 }}>
                    Select your booking requirements on the left, then click &ldquo;Find
                    Rooms&rdquo; to view matching rooms here.
                  </Typography>
                </Box>
              )}

              {searched && (
                <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
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
                      <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
                        No matching rooms found. Try modifying your search criteria.
                      </Alert>
                    )}

                  {!suggestions.isLoading &&
                    suggestions.data.length > 0 &&
                    filteredSuggestions.length === 0 && (
                      <Box
                        sx={{
                          py: 6,
                          px: 3,
                          border: '1px dashed',
                          borderColor: 'divider',
                          borderRadius: 2,
                          textAlign: 'center',
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Iconify
                          icon="mdi:filter-off-outline"
                          width={34}
                          sx={{ color: 'text.disabled', mb: 1 }}
                        />
                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                          No rooms match these filters
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Clear or adjust the result filters to view more available rooms.
                        </Typography>
                        <Box sx={{ mt: 1.5 }}>
                          <Button size="small" variant="outlined" onClick={clearResultFilters}>
                            Clear filters
                          </Button>
                        </Box>
                      </Box>
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
        sx={{ px: 2.5, py: 2, bgcolor: 'background.paper' }}
      >
        <Button
          variant="outlined"
          onClick={handleClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          size="small"
        >
          Cancel
        </Button>
      </Stack>
    </Drawer>
  );
};

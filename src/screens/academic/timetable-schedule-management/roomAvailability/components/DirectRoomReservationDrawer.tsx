'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
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
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { useRoomSchedule, useCreateRoomReservation } from '../roomAvailability.hooks';
import { PRIORITY_OPTIONS, RESERVATION_TYPE_OPTIONS } from '../roomAvailability.constants';
import {
  toMinutes,
  clampSlotDuration,
  generateReservationSlots,
  MIN_SLOT_DURATION_MINUTES,
  MAX_SLOT_DURATION_MINUTES,
  DEFAULT_SLOT_DURATION_MINUTES,
} from './directReservationSlots';

import type { RoomReservation, RoomAvailabilityItem, ReservationRequirements } from '../types';

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

interface DirectRoomReservationDrawerProps {
  open: boolean;
  room: RoomAvailabilityItem | null;
  onClose: () => void;
  onSuccess?: (reservation: RoomReservation) => void;
}

export const DirectRoomReservationDrawer = ({
  open,
  room,
  onClose,
  onSuccess,
}: DirectRoomReservationDrawerProps) => {
  const [requirements, setRequirements] = useState<ReservationRequirements>({
    ...defaultRequirements,
  });
  const [validationError, setValidationError] = useState('');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(DEFAULT_SLOT_DURATION_MINUTES);

  // Dynamically query the schedule for the selected date
  const schedule = useRoomSchedule(room?.roomId || null, requirements.date);
  const createReservation = useCreateRoomReservation();

  const patchRequirements = useCallback((patch: Partial<ReservationRequirements>) => {
    setRequirements((prev) => ({ ...prev, ...patch }));
  }, []);

  // Initialize form when drawer opens
  useEffect(() => {
    if (open && room) {
      setRequirements({
        ...defaultRequirements,
        date: dayjs().format('YYYY-MM-DD'),
      });
      setSlotDurationMinutes(DEFAULT_SLOT_DURATION_MINUTES);
      setValidationError('');
    }
  }, [open, room]);

  const isStartTimeOutOfRange = useMemo(() => {
    if (!requirements.startTime) return false;
    const mins = toMinutes(requirements.startTime);
    return mins < 6 * 60 || requirements.startTime === '00:00';
  }, [requirements.startTime]);

  const isEndTimeOutOfRange = useMemo(() => {
    if (!requirements.endTime) return false;
    if (requirements.endTime === '00:00') return false;
    const mins = toMinutes(requirements.endTime);
    return mins < 6 * 60;
  }, [requirements.endTime]);

  const isTimeRangeInvalid = useMemo(() => {
    if (!requirements.startTime || !requirements.endTime) return false;
    if (isStartTimeOutOfRange || isEndTimeOutOfRange) return false;
    const startMins = toMinutes(requirements.startTime);
    const endMins = requirements.endTime === '00:00' ? 24 * 60 : toMinutes(requirements.endTime);
    return endMins <= startMins;
  }, [requirements.startTime, requirements.endTime, isStartTimeOutOfRange, isEndTimeOutOfRange]);

  const generatedSlots = useMemo(
    () => generateReservationSlots(schedule.data?.slots || [], slotDurationMinutes),
    [schedule.data?.slots, slotDurationMinutes]
  );

  // Slot tiles are always derived from the Start/End Time fields, so typing a time
  // and clicking a tile stay in sync automatically instead of tracking selection separately.
  const overlappingSlotIndices = useMemo(() => {
    if (
      !requirements.startTime ||
      !requirements.endTime ||
      isTimeRangeInvalid ||
      isStartTimeOutOfRange ||
      isEndTimeOutOfRange
    )
      return [] as number[];
    const reqStart = toMinutes(requirements.startTime);
    const reqEnd = requirements.endTime === '00:00' ? 24 * 60 : toMinutes(requirements.endTime);
    const result: number[] = [];
    generatedSlots.forEach((slot, i) => {
      if (slot.startMinutes < reqEnd && slot.endMinutes > reqStart) result.push(i);
    });
    return result;
  }, [
    generatedSlots,
    requirements.startTime,
    requirements.endTime,
    isTimeRangeInvalid,
    isStartTimeOutOfRange,
    isEndTimeOutOfRange,
  ]);

  const overlappingConflictMinutes = useMemo(
    () =>
      overlappingSlotIndices.reduce(
        (total, index) => total + (generatedSlots[index]?.conflictMinutes || 0),
        0
      ),
    [generatedSlots, overlappingSlotIndices]
  );

  const conflictingSlot = useMemo(
    () =>
      overlappingSlotIndices
        .map((i) => generatedSlots[i])
        .find((slot) => slot?.conflictMinutes > 0),
    [generatedSlots, overlappingSlotIndices]
  );

  const validateForm = (): boolean => {
    if (!requirements.reservationType) {
      setValidationError('Reservation type is required.');
      return false;
    }
    if (!requirements.purpose) {
      setValidationError('Purpose is required.');
      return false;
    }
    if (!requirements.date) {
      setValidationError('Date is required.');
      return false;
    }
    if (!requirements.startTime) {
      setValidationError('Start time is required.');
      return false;
    }
    if (!requirements.endTime) {
      setValidationError('End time is required.');
      return false;
    }
    if (isStartTimeOutOfRange) {
      setValidationError('Start time must be between 06:00 AM and 12:00 AM.');
      return false;
    }
    if (isEndTimeOutOfRange) {
      setValidationError('End time must be between 06:00 AM and 12:00 AM.');
      return false;
    }
    if (isTimeRangeInvalid) {
      setValidationError('End time must be after start time.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleBook = async () => {
    if (!validateForm() || !room) return;
    try {
      // Direct booking creates the reservation
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
          message:
            result.status === 'pendingApproval'
              ? 'Reservation submitted for admin approval.'
              : 'Room reserved successfully!',
        });
        onSuccess?.(result);
        handleClose();
      }
    } catch (err: any) {
      const errorMsg = err?.data?.error?.message || 'Failed to create reservation.';
      setValidationError(errorMsg);
    }
  };

  const handleClose = () => {
    setRequirements({ ...defaultRequirements });
    setSlotDurationMinutes(DEFAULT_SLOT_DURATION_MINUTES);
    setValidationError('');
    onClose();
  };

  // Set time fields when clicking a slot. Selection highlighting is derived from
  // Start/End Time (see overlappingSlotIndices), so this only ever needs to update the times.
  const handleSelectSlot = (idx: number) => {
    const clickedSlot = generatedSlots[idx];
    if (!clickedSlot) return;

    const selectSingle = () => {
      patchRequirements({
        startTime: clickedSlot.startTime,
        endTime: clickedSlot.endTime,
      });
    };

    if (overlappingSlotIndices.length === 0) {
      selectSingle();
    } else if (overlappingSlotIndices.length === 1 && overlappingSlotIndices[0] === idx) {
      patchRequirements({ startTime: '', endTime: '' });
    } else if (overlappingSlotIndices.length === 1) {
      const firstIdx = overlappingSlotIndices[0];
      const start = Math.min(firstIdx, idx);
      const end = Math.max(firstIdx, idx);

      patchRequirements({
        startTime: generatedSlots[start].startTime,
        endTime: generatedSlots[end].endTime,
      });
      shikshaMitraToast.success({
        message: `Selected range: ${generatedSlots[start].time.split('-')[0]} to ${
          generatedSlots[end].time.split('-')[1]
        }`,
      });
    } else {
      selectSingle();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 1080, xl: 1200 },
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
        <Stack direction="row" alignItems="center" spacing={1}>
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
            <Iconify icon="mdi:calendar-lock" width={24} sx={{ color: 'common.white' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.3}>
              Direct Reservation: {room?.roomName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pick a time slot and confirm the booking details
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
        {validationError && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 1.5 }}
            onClose={() => setValidationError('')}
          >
            {validationError}
          </Alert>
        )}

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          sx={{ height: '100%', alignItems: 'stretch', overflow: 'hidden' }}
        >
          {/* Left Column: Room Timeline & Available Slots */}
          <Box
            sx={{
              flex: 1.2,
              minWidth: { md: 450 },
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Stack spacing={1} sx={{ height: '100%' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <StepBadge number={1} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    Room Schedule & Slots
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {room?.buildingName} · {room?.floorName} · {room?.capacity} seats
                  </Typography>
                </Box>
              </Stack>

              <DatePicker
                label="Timeline Date"
                format="DD/MM/YYYY"
                value={dayjs(requirements.date)}
                onChange={(v: Dayjs | null) => {
                  if (v) patchRequirements({ date: v.format('YYYY-MM-DD') });
                }}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />

              <TextField
                size="small"
                type="number"
                label="Slot duration minutes"
                value={slotDurationMinutes}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  setSlotDurationMinutes(
                    Number.isNaN(nextValue) ? MIN_SLOT_DURATION_MINUTES : nextValue
                  );
                }}
                onBlur={() => setSlotDurationMinutes((value) => clampSlotDuration(value))}
                inputProps={{
                  min: MIN_SLOT_DURATION_MINUTES,
                  max: MAX_SLOT_DURATION_MINUTES,
                }}
                helperText={`Min ${MIN_SLOT_DURATION_MINUTES} min, max ${MAX_SLOT_DURATION_MINUTES} min`}
                fullWidth
              />

              {/* Legend */}
              <Stack direction="row" spacing={1}>
                {[
                  { label: 'Available', color: 'success.main' },
                  { label: 'Selected', color: 'primary.main' },
                  { label: 'Occupied', color: 'text.disabled' },
                  { label: 'Conflict', color: 'warning.main' },
                ].map((item) => (
                  <Stack key={item.label} direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography variant="caption" color="text.secondary">
                      {item.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                {schedule.isLoading && (
                  <Box sx={{ py: 8, textAlign: 'center' }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading room schedule…
                    </Typography>
                  </Box>
                )}

                {schedule.error && (
                  <Alert severity="error" sx={{ borderRadius: 1.5 }}>
                    {schedule.error}
                  </Alert>
                )}

                {!schedule.isLoading && !schedule.error && !schedule.data && (
                  <Alert severity="info" sx={{ borderRadius: 1.5 }}>
                    No periods scheduled for this date. Any time slot is available for booking.
                  </Alert>
                )}

                {!schedule.isLoading && schedule.data && (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: 1,
                    }}
                  >
                    {generatedSlots.map((slot, idx: number) => {
                      const isFree = slot.conflictMinutes === 0;
                      const isOverlapping = overlappingSlotIndices.includes(idx);
                      const isSelected = isOverlapping && isFree;
                      const isConflict = slot.conflictMinutes > 0;
                      const isSelectedConflict = isOverlapping && isConflict;
                      return (
                        <Box
                          key={idx}
                          onClick={() => handleSelectSlot(idx)}
                          sx={{
                            position: 'relative',
                            p: 1.5,
                            borderRadius: 2,
                            border: 1.5,
                            borderColor: isSelected
                              ? 'primary.main'
                              : isConflict
                                ? isSelectedConflict
                                  ? 'warning.dark'
                                  : 'warning.main'
                                : isFree
                                  ? alpha('#2e7d32', 0.3)
                                  : 'divider',
                            bgcolor: isSelected
                              ? (theme) => alpha(theme.palette.primary.main, 0.1)
                              : isConflict
                                ? (theme) =>
                                    alpha(
                                      theme.palette.warning.main,
                                      isSelectedConflict ? 0.18 : 0.1
                                    )
                                : isFree
                                  ? (theme) => alpha(theme.palette.success.main, 0.06)
                                  : 'background.neutral',
                            cursor: 'pointer',
                            opacity: 1,
                            transition: 'all 0.15s',
                            '&:hover': {
                              borderColor: isConflict
                                ? 'warning.dark'
                                : isSelected
                                  ? 'primary.dark'
                                  : 'success.main',
                              transform: 'translateY(-2px)',
                              boxShadow: (theme) =>
                                `0 6px 16px 0 ${alpha(
                                  isConflict
                                    ? theme.palette.warning.main
                                    : isSelected
                                      ? theme.palette.primary.main
                                      : theme.palette.success.main,
                                  0.22
                                )}`,
                            },
                          }}
                        >
                          {isSelected && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 6,
                                right: 6,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Iconify icon="mdi:check" width={11} sx={{ color: 'common.white' }} />
                            </Box>
                          )}
                          {isFree && !isSelected && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 6,
                                right: 6,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                border: 1.5,
                                borderColor: alpha('#2e7d32', 0.4),
                              }}
                            />
                          )}
                          {isConflict && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 6,
                                right: 6,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: 'warning.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Iconify icon="mdi:alert" width={11} sx={{ color: 'common.white' }} />
                            </Box>
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              display: 'block',
                              color: isSelected
                                ? 'primary.dark'
                                : isConflict
                                  ? 'warning.dark'
                                  : isFree
                                    ? 'success.dark'
                                    : 'text.secondary',
                            }}
                          >
                            {slot.period || `Slot ${idx + 1}`}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', fontSize: 11, mt: 0.25 }}
                          >
                            {slot.time}
                          </Typography>
                          {!isFree && (
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              noWrap
                              sx={{ display: 'block', fontSize: 10.5, mt: 0.5 }}
                            >
                              {slot.details || slot.status.toUpperCase()}
                            </Typography>
                          )}
                          {isConflict && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                fontSize: 10.5,
                                mt: 0.5,
                                color: 'warning.dark',
                                fontWeight: 700,
                              }}
                            >
                              Conflict: {slot.conflictMinutes} min
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Stack>
          </Box>

          {/* Vertical Divider */}
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

          {/* Right Column: Reservation Details Form */}
          <Box
            sx={{
              flex: 1,
              minWidth: { md: 450 },
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            {/* Scrollable Form Body */}
            <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <StepBadge number={2} />
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    Booking Details
                  </Typography>
                </Stack>

                <Stack
                  spacing={1}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <TextField
                    size="small"
                    label="Selected Room"
                    value={room?.roomName || ''}
                    disabled
                    fullWidth
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <CustomSelect
                      label="Reservation Type *"
                      options={RESERVATION_TYPE_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                      value={requirements.reservationType}
                      onChange={(v) => patchRequirements({ reservationType: v as any })}
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
                    placeholder="e.g. Grade 9 Chemistry Lab"
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TimePicker
                      label="Start Time *"
                      value={
                        requirements.startTime
                          ? dayjs(`2000-01-01T${requirements.startTime}`)
                          : null
                      }
                      onChange={(newValue: Dayjs | null) => {
                        patchRequirements({
                          startTime: newValue && newValue.isValid() ? newValue.format('HH:mm') : '',
                        });
                      }}
                      viewRenderers={{
                        hours: renderTimeViewClock,
                        minutes: renderTimeViewClock,
                        seconds: renderTimeViewClock,
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: isStartTimeOutOfRange || isTimeRangeInvalid,
                          helperText: isStartTimeOutOfRange
                            ? 'Must be between 06:00 AM and 12:00 AM'
                            : ' ',
                        },
                      }}
                    />
                    <TimePicker
                      label="End Time *"
                      value={
                        requirements.endTime ? dayjs(`2000-01-01T${requirements.endTime}`) : null
                      }
                      onChange={(newValue: Dayjs | null) => {
                        patchRequirements({
                          endTime: newValue && newValue.isValid() ? newValue.format('HH:mm') : '',
                        });
                      }}
                      viewRenderers={{
                        hours: renderTimeViewClock,
                        minutes: renderTimeViewClock,
                        seconds: renderTimeViewClock,
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: isEndTimeOutOfRange || isTimeRangeInvalid,
                          helperText: isEndTimeOutOfRange
                            ? 'Must be between 06:00 AM and 12:00 AM'
                            : isTimeRangeInvalid
                              ? 'End time must be after start time'
                              : ' ',
                        },
                      }}
                    />
                  </Stack>
                  {!isTimeRangeInvalid && conflictingSlot && (
                    <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
                      This time overlaps for {overlappingConflictMinutes} min with{' '}
                      {conflictingSlot.period || 'a slot'} ({conflictingSlot.time}). You can
                      continue, but review the highlighted conflict before booking.
                    </Alert>
                  )}

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
                      spacing={1}
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

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
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
                          slotProps={{ textField: { size: 'small', fullWidth: true } }}
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

            {/* Sticky Action Button at Bottom */}
            <Box
              sx={{ pt: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.neutral' }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={
                  createReservation.isLoading ||
                  isTimeRangeInvalid ||
                  !requirements.startTime ||
                  !requirements.endTime
                }
                onClick={handleBook}
                startIcon={
                  createReservation.isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Iconify icon="mdi:calendar-check" />
                  )
                }
                sx={{
                  py: 1.25,
                  borderRadius: 1.5,
                  fontWeight: 700,
                  boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
                }}
              >
                Book Instantly
              </Button>
            </Box>
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
          color="inherit"
          onClick={handleClose}
          sx={{ borderRadius: 1.5, px: 3 }}
        >
          Cancel
        </Button>
      </Stack>
    </Drawer>
  );
};

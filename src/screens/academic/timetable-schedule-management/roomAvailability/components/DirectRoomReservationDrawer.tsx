'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import LoadingButton from '@mui/lab/LoadingButton';
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
  Tooltip,
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
  prefillDate?: string;
  onClose: () => void;
  onSuccess?: (reservation: RoomReservation) => void;
}

export const DirectRoomReservationDrawer = ({
  open,
  room,
  prefillDate,
  onClose,
  onSuccess,
}: DirectRoomReservationDrawerProps) => {
  const [requirements, setRequirements] = useState<ReservationRequirements>({
    ...defaultRequirements,
  });
  const [validationError, setValidationError] = useState('');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(DEFAULT_SLOT_DURATION_MINUTES);
  const [readyRoomId, setReadyRoomId] = useState<string | null>(null);
  const roomId = room?.roomId ?? null;

  // Wait for the drawer's room and prefilled date before starting the schedule request.
  const schedule = useRoomSchedule(
    open && readyRoomId === roomId ? readyRoomId : null,
    requirements.date
  );
  const createReservation = useCreateRoomReservation();

  const patchRequirements = useCallback((patch: Partial<ReservationRequirements>) => {
    setRequirements((prev) => ({ ...prev, ...patch }));
    // Clear field error for modified fields
    setFieldErrors((prev) => {
      const updated = { ...prev };
      Object.keys(patch).forEach((key) => {
        delete updated[key];
      });
      return updated;
    });
  }, []);

  // Initialize form when drawer opens
  useEffect(() => {
    if (open && roomId) {
      setRequirements({
        ...defaultRequirements,
        date: prefillDate || dayjs().format('YYYY-MM-DD'),
      });
      setReadyRoomId(roomId);
      setSlotDurationMinutes(DEFAULT_SLOT_DURATION_MINUTES);
      setValidationError('');
      setFieldErrors({});
    } else {
      setReadyRoomId(null);
    }
  }, [open, roomId, prefillDate]);

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
  const isScheduleLoading = open && (!readyRoomId || schedule.isLoading || schedule.isFetching);

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

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!requirements.reservationType) {
      errors.reservationType = 'Reservation type is required.';
    }
    if (!requirements.purpose || !requirements.purpose.trim()) {
      errors.purpose = 'Purpose is required.';
    }
    if (!requirements.date) {
      errors.date = 'Date is required.';
    }
    if (!requirements.startTime) {
      errors.startTime = 'Start time is required.';
    } else if (isStartTimeOutOfRange) {
      errors.startTime = 'Start time must be between 06:00 AM and 12:00 AM.';
    }

    if (!requirements.endTime) {
      errors.endTime = 'End time is required.';
    } else if (isEndTimeOutOfRange) {
      errors.endTime = 'End time must be between 06:00 AM and 12:00 AM.';
    } else if (isTimeRangeInvalid) {
      errors.endTime = 'End time must be after start time.';
    }

    if (requirements.isRecurring && requirements.recurringConfig?.repeatType === 'weekly') {
      if (
        !requirements.recurringConfig.repeatDays ||
        requirements.recurringConfig.repeatDays.length === 0
      ) {
        errors.repeatDays = 'Please select at least one day for weekly recurrence.';
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setValidationError('Please fix the validation errors below.');
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
    setFieldErrors({});
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
        message: `Selected range: ${generatedSlots[start].time.split('-')[0]} to ${generatedSlots[end].time.split('-')[1]
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
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={700} lineHeight={1.3}>
                Direct Reservation: {room?.roomName}
              </Typography>
              <CustomTooltip
                title="Select a specific time slot and confirm booking details directly for this room."
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
            <Stack spacing={3} sx={{ height: '100%' }}>
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

              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': { width: 6 },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 },
                  '&::-webkit-scrollbar-thumb:hover': { bgcolor: 'action.disabled' },
                }}
              >
                {isScheduleLoading && (
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

                {!isScheduleLoading &&
                  !schedule.error &&
                  !schedule.data && (
                    <Alert severity="info" sx={{ borderRadius: 1.5 }}>
                      No periods scheduled for this date. Any time slot is available for booking.
                    </Alert>
                  )}

                {!isScheduleLoading && schedule.data && (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                      gap: 1.5,
                      pt: 1,
                      pb: 2,
                    }}
                  >
                    {generatedSlots.map((slot, idx: number) => {
                      const isFree = slot.conflictMinutes === 0;
                      const isOverlapping = overlappingSlotIndices.includes(idx);
                      const isSelected = isOverlapping && isFree;
                      const isConflict = slot.conflictMinutes > 0;
                      const isSelectedConflict = isOverlapping && isConflict;
                      return (
                        <Tooltip
                          key={idx}
                          title={
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {slot.period || `Slot ${idx + 1}`} ({slot.time})
                              </Typography>
                              {!isFree && (
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                  {slot.details || slot.status.toUpperCase()}
                                </Typography>
                              )}
                              {isConflict && (
                                <Typography variant="caption" color="warning.main" fontWeight={600}>
                                  Conflict: {slot.conflictMinutes} min
                                </Typography>
                              )}
                            </Stack>
                          }
                          arrow
                          placement="top"
                          disableHoverListener={isFree && !isConflict} // Only show if not entirely free
                        >
                          <Box
                            onClick={() => handleSelectSlot(idx)}
                            sx={{
                              position: 'relative',
                              p: 1.5,
                              borderRadius: 1.5,
                              border: 1,
                              borderColor: isSelected
                                ? 'primary.main'
                                : isConflict
                                  ? isSelectedConflict
                                    ? 'warning.dark'
                                    : 'warning.main'
                                  : isFree
                                    ? alpha('#2e7d32', 0.4)
                                    : 'divider',
                              bgcolor: isSelected
                                ? (theme) => alpha(theme.palette.primary.main, 0.1)
                                : isConflict
                                  ? (theme) =>
                                    alpha(
                                      theme.palette.warning.main,
                                      isSelectedConflict ? 0.2 : 0.1
                                    )
                                  : isFree
                                    ? (theme) => alpha(theme.palette.success.main, 0.05)
                                    : 'background.neutral',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              minHeight: 64,
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                borderColor: isConflict
                                  ? 'warning.dark'
                                  : isSelected
                                    ? 'primary.dark'
                                    : 'success.main',
                                bgcolor: isSelected
                                  ? (theme) => alpha(theme.palette.primary.main, 0.15)
                                  : isConflict
                                    ? (theme) => alpha(theme.palette.warning.main, 0.15)
                                    : (theme) => alpha(theme.palette.success.main, 0.1),
                                transform: 'translateY(-2px)',
                                boxShadow: (theme) =>
                                  `0 4px 12px 0 ${alpha(
                                    isConflict
                                      ? theme.palette.warning.main
                                      : isSelected
                                        ? theme.palette.primary.main
                                        : theme.palette.success.main,
                                    0.16
                                  )}`,
                              },
                            }}
                          >
                            {isSelected && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -8,
                                  right: -8,
                                  width: 22,
                                  height: 22,
                                  borderRadius: '50%',
                                  bgcolor: 'primary.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: 2,
                                  zIndex: 1,
                                }}
                              >
                                <Iconify
                                  icon="mdi:check-bold"
                                  width={12}
                                  sx={{ color: 'common.white' }}
                                />
                              </Box>
                            )}
                            {isConflict && !isSelected && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -8,
                                  right: -8,
                                  width: 22,
                                  height: 22,
                                  borderRadius: '50%',
                                  bgcolor: 'warning.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: 2,
                                  zIndex: 1,
                                }}
                              >
                                <Iconify
                                  icon="mdi:alert"
                                  width={14}
                                  sx={{ color: 'common.white' }}
                                />
                              </Box>
                            )}
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                lineHeight: 1.2,
                                color: isSelected
                                  ? 'primary.main'
                                  : isConflict
                                    ? 'warning.main'
                                    : isFree
                                      ? 'success.main'
                                      : 'text.secondary',
                              }}
                            >
                              {slot.period || `Slot ${idx + 1}`}
                            </Typography>
                            <Typography
                              variant="caption"
                              color={isSelected ? 'text.primary' : 'text.secondary'}
                              sx={{
                                fontSize: 10,
                                mt: 0.5,
                                lineHeight: 1.2,
                                opacity: isSelected ? 1 : 0.8,
                                fontWeight: isSelected ? 600 : 400,
                              }}
                            >
                              {slot.time}
                            </Typography>
                          </Box>
                        </Tooltip>
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
                  spacing={3}
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
                    placeholder="e.g. Grade 9 Chemistry Lab"
                    error={!!fieldErrors.purpose}
                    helperText={
                      fieldErrors.purpose || 'Briefly describe why this room is being reserved'
                    }
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
                          error:
                            !!fieldErrors.startTime || isStartTimeOutOfRange || isTimeRangeInvalid,
                          helperText:
                            fieldErrors.startTime ||
                            (isStartTimeOutOfRange ? 'Must be between 06:00 AM and 12:00 AM' : ' '),
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
                          error: !!fieldErrors.endTime || isEndTimeOutOfRange || isTimeRangeInvalid,
                          helperText:
                            fieldErrors.endTime ||
                            (isEndTimeOutOfRange
                              ? 'Must be between 06:00 AM and 12:00 AM'
                              : isTimeRangeInvalid
                                ? 'End time must be after start time'
                                : ' '),
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
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: fieldErrors.repeatDays ? 'error.main' : 'text.secondary',
                            }}
                          >
                            Repeat On Days *
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
                                  color={
                                    isSelected
                                      ? 'primary'
                                      : fieldErrors.repeatDays
                                        ? 'error'
                                        : 'default'
                                  }
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
                          {fieldErrors.repeatDays && (
                            <Typography variant="caption" color="error">
                              {fieldErrors.repeatDays}
                            </Typography>
                          )}
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
        </Stack>
      </Box>

      {/* Footer */}
      <Divider />
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        spacing={1.5}
        sx={{ px: 2.5, py: 2, bgcolor: 'background.paper' }}
      >
        <Button
          variant="outlined"
          onClick={handleClose}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          size="small"
          loading={createReservation.isLoading}
          disabled={
            isTimeRangeInvalid ||
            !requirements.startTime ||
            !requirements.endTime
          }
          onClick={handleBook}
          startIcon={<Iconify icon="mdi:calendar-check" />}
        >
          Book Instantly
        </LoadingButton>
      </Stack>
    </Drawer>
  );
};

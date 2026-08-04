'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { useState, useEffect, useCallback } from 'react';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
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

import { RoomStatusChip } from './RoomStatusChip';
import {
  useRoomSuggestions,
  useCreateRoomReservation,
} from '../roomAvailability.hooks';
import {
  resolveFacility,
  PRIORITY_OPTIONS,
  SUGGESTION_BADGE_LABELS,
  RESERVATION_TYPE_OPTIONS,
} from '../roomAvailability.constants';

import type {
  SuggestedRoom,
  RoomReservation,
  ReservationRequirements,
} from '../types';

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

const MatchScoreRing = ({ score }: { score: number }) => {
  const color = score >= 80 ? 'success.main' : score >= 60 ? 'warning.main' : 'text.disabled';
  return (
    <Tooltip title={`${score}% match with your booking requirements`} arrow>
      <Box sx={{ position: 'relative', width: 38, height: 38, flexShrink: 0, cursor: 'default' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={38}
          thickness={4}
          sx={{ color: 'action.hover', position: 'absolute' }}
        />
        <CircularProgress
          variant="determinate"
          value={score}
          size={38}
          thickness={4}
          sx={{ color, position: 'absolute' }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ fontSize: 10.5, fontWeight: 700, lineHeight: 1 }}>{score}</Typography>
        </Box>
      </Box>
    </Tooltip>
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
  const [requirements, setRequirements] = useState<ReservationRequirements>({
    ...defaultRequirements,
  });
  const [searched, setSearched] = useState(false);
  const [validationError, setValidationError] = useState('');

  const suggestions = useRoomSuggestions();
  const { suggest } = suggestions;
  const createReservation = useCreateRoomReservation();

  const patchRequirements = useCallback((patch: Partial<ReservationRequirements>) => {
    setRequirements((prev) => ({ ...prev, ...patch }));
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
      setValidationError('');
    }
  }, [open, prefilledRoom, prefillDate, suggest]);

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
    if (requirements.endTime <= requirements.startTime) {
      setValidationError('End time must be after start time.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSearch = async () => {
    if (!validateForm()) return;
    setValidationError('');
    await suggestions.suggest(requirements);
    setSearched(true);
  };

  const handleBookRoom = async (room: SuggestedRoom) => {
    try {
      const isApprovalRequired = room.conflictStatus === 'warning' || room.needsApproval;
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
        recurringConfig: requirements.isRecurring ? {
          repeatType: requirements.recurringConfig?.repeatType || 'daily',
          repeatDays: requirements.recurringConfig?.repeatDays || [],
          untilDate: requirements.recurringConfig?.untilDate || requirements.date,
          excludeHolidays: requirements.recurringConfig?.excludeHolidays ?? true,
          excludeExamDays: requirements.recurringConfig?.excludeExamDays ?? false,
          skipConflictDates: requirements.recurringConfig?.skipConflictDates ?? false,
        } : undefined
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
      setValidationError(errorMsg);
    }
  };

  const handleClose = () => {
    setRequirements({ ...defaultRequirements });
    setSearched(false);
    setValidationError('');
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
            <Iconify icon="mdi:calendar-plus" width={24} sx={{ color: 'common.white' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.3}>
              Reserve a Room
            </Typography>
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

          {/* Left Column: Form Fields (No scrolling on column container) */}
          <Box sx={{
            flex: 1,
            minWidth: { md: 450 },
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>

            {/* Scrollable Fields */}
            <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <StepBadge number={1} />
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    Booking Requirements
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
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <CustomSelect
                    label="Reservation Type *"
                    options={RESERVATION_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
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
                  placeholder="e.g. Grade 9 Physics Practical"
                />

                <DatePicker
                  label="Date *"
                  format="DD/MM/YYYY"
                  value={dayjs(requirements.date)}
                  onChange={(v: Dayjs | null) => {
                    if (v) patchRequirements({ date: v.format('YYYY-MM-DD') });
                  }}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    size="small"
                    label="Start Time *"
                    type="time"
                    value={requirements.startTime}
                    onChange={(e) => patchRequirements({ startTime: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    size="small"
                    label="End Time *"
                    type="time"
                    value={requirements.endTime}
                    onChange={(e) => patchRequirements({ endTime: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
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
                      requirements.isRecurring ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
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
                              ...(requirements.recurringConfig || { excludeHolidays: true, excludeExamDays: false, skipConflictDates: false }),
                              repeatType: v as any,
                            }
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
                                ...(requirements.recurringConfig || { repeatType: 'daily', excludeHolidays: true, excludeExamDays: false, skipConflictDates: false }),
                                untilDate: v.format('YYYY-MM-DD'),
                              }
                            });
                          }
                        }}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                    </Stack>

                    {requirements.recurringConfig?.repeatType === 'weekly' && (
                      <Stack spacing={1}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Repeat On Days</Typography>
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
                                      ...(requirements.recurringConfig || { repeatType: 'weekly', excludeHolidays: true, excludeExamDays: false, skipConflictDates: false }),
                                      repeatDays: newDays,
                                    }
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
                                  ...(requirements.recurringConfig || { repeatType: 'daily', excludeExamDays: false, skipConflictDates: false }),
                                  excludeHolidays: e.target.checked,
                                }
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
                                  ...(requirements.recurringConfig || { repeatType: 'daily', excludeHolidays: true, skipConflictDates: false }),
                                  excludeExamDays: e.target.checked,
                                }
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
                                  ...(requirements.recurringConfig || { repeatType: 'daily', excludeHolidays: true, excludeExamDays: false }),
                                  skipConflictDates: e.target.checked,
                                }
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

            {/* Sticky Search Button at Bottom */}
            <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.neutral' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleSearch}
                disabled={suggestions.isLoading}
                startIcon={suggestions.isLoading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="mdi:magnify" />}
                sx={{
                  py: 1.25,
                  borderRadius: 1.5,
                  fontWeight: 700,
                  boxShadow: (theme) => `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
                }}
              >
                Find Available Rooms
              </Button>
            </Box>
          </Box>

          {/* Vertical Divider */}
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

          {/* Right Column: Search Results (Independently Scrollable) */}
          <Box sx={{
            flex: 1.6,
            minWidth: { md: 450 },
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
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
                    label={`${suggestions.data.length} found`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Stack>

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
                    flex: 1
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
                    Select your booking requirements on the left, then click &ldquo;Find Available Rooms&rdquo; to view matching rooms here.
                  </Typography>
                </Box>
              )}

              {searched && (
                <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                  {suggestions.isLoading && (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Finding matching rooms…
                      </Typography>
                    </Box>
                  )}

                  {suggestions.error && <Alert severity="error" sx={{ borderRadius: 1.5 }}>{suggestions.error}</Alert>}

                  {!suggestions.isLoading && !suggestions.error && suggestions.data.length === 0 && (
                    <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
                      No matching rooms found. Try modifying your search criteria.
                    </Alert>
                  )}

                  {!suggestions.isLoading && suggestions.data.length > 0 && (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 1,
                        alignItems: 'start',
                      }}
                    >
                      {suggestions.data.map((room) => {
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
                              gap: 1,
                              boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: '0 8px 20px 0 rgba(0,0,0,0.1)',
                                transform: 'translateY(-2px)',
                              },
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Stack direction="row" spacing={1} alignItems="center">
                                <MatchScoreRing score={room.matchScore} />
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: 16 }}>
                                    {room.roomName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 13 }}>
                                    {room.buildingName} · {room.floorName} · {room.type} · {room.capacity} seats
                                  </Typography>
                                </Box>
                              </Stack>
                              <RoomStatusChip
                                status={
                                  isCritical
                                    ? 'conflict'
                                    : isWarning
                                      ? 'reserved'
                                      : 'available'
                                }
                                showIcon={false}
                              />
                            </Stack>

                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
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
                                      badge === 'warning' || badge === 'needsApproval' ? 'warning' : 'info'
                                    }
                                    variant="outlined"
                                    sx={{ fontSize: 10, height: 18 }}
                                  />
                                ))}
                              </Stack>
                            )}

                            {/* Facilities */}
                            {room.facilities.length > 0 && (
                              <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
                                {room.facilities.slice(0, 5).map((f) => {
                                  const { label, icon } = resolveFacility(f);
                                  return (
                                    <Stack
                                      key={f}
                                      direction="row"
                                      alignItems="center"
                                      spacing={1}
                                      sx={{
                                        px: 1,
                                        py: 0.4,
                                        borderRadius: 1,
                                        border: 1,
                                        borderColor: 'divider',
                                        bgcolor: 'background.neutral',
                                      }}
                                    >
                                      <Iconify icon={icon} width={13} sx={{ color: 'text.secondary', flexShrink: 0 }} />
                                      <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                        {label}
                                      </Typography>
                                    </Stack>
                                  );
                                })}
                              </Stack>
                            )}

                            {/* Book Action */}
                            <Button
                              variant={isWarning ? 'outlined' : 'contained'}
                              color={isCritical ? 'inherit' : isWarning ? 'warning' : 'primary'}
                              fullWidth
                              size="medium"
                              disabled={isCritical || createReservation.isLoading}
                              onClick={() => handleBookRoom(room)}
                              startIcon={createReservation.isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
                              sx={{ mt: 0.5, py: 1, fontWeight: 600, borderRadius: 1.5 }}
                            >
                              {isCritical
                                  ? 'Unavailable'
                                  : isWarning
                                    ? 'Book (Requires Approval)'
                                    : 'Book Instantly'}
                            </Button>
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

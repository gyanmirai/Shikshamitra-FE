'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useState, useCallback } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import {
  Box,
  Chip,
  Step,
  Alert,
  Stack,
  Button,
  Drawer,
  Switch,
  Select,
  Divider,
  Stepper,
  Tooltip,
  Checkbox,
  MenuItem,
  StepLabel,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  FormControl,
  ListItemText,
  OutlinedInput,
  LinearProgress,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';

import { RoomStatusChip, ConflictSeverityChip } from './RoomStatusChip';
import {
  useRoomSuggestions,
  useRoomConflictCheck,
  useCreateRoomReservation,
} from '../roomAvailability.hooks';
import {
  CLASS_OPTIONS,
  FACILITY_ICONS,
  TEACHER_OPTIONS,
  FACILITY_LABELS,
  BUILDING_OPTIONS,
  FACILITY_OPTIONS,
  PRIORITY_OPTIONS,
  ROOM_TYPE_OPTIONS,
  LECTURE_SLOT_OPTIONS,
  SUGGESTION_BADGE_LABELS,
  RESERVATION_TYPE_OPTIONS,
} from '../roomAvailability.constants';

import type {
  RoomFacility,
  SuggestedRoom,
  RoomReservation,
  ReservationRequirements,
} from '../types';

const STEPS = ['Requirements', 'Suggested Rooms', 'Conflict Check', 'Confirm'];

const defaultRequirements: ReservationRequirements = {
  reservationType: '',
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
  remarks: '',
  aiCommand: '',
};

interface SmartRoomReservationDrawerProps {
  open: boolean;
  prefilledRoom?: { roomId: string; roomName: string } | null;
  onClose: () => void;
  onSuccess?: (reservation: RoomReservation) => void;
}

export const SmartRoomReservationDrawer = ({
  open,
  prefilledRoom,
  onClose,
  onSuccess,
}: SmartRoomReservationDrawerProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [requirements, setRequirements] = useState<ReservationRequirements>({
    ...defaultRequirements,
    selectedRoomId: prefilledRoom?.roomId,
  });
  const [selectedRoom, setSelectedRoom] = useState<SuggestedRoom | null>(null);
  const [validationError, setValidationError] = useState('');

  const suggestions = useRoomSuggestions();
  const conflictCheck = useRoomConflictCheck();
  const createReservation = useCreateRoomReservation();

  const patchRequirements = useCallback((patch: Partial<ReservationRequirements>) => {
    setRequirements((prev) => ({ ...prev, ...patch }));
  }, []);

  const validateStep1 = (): boolean => {
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

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!validateStep1()) return;
      await suggestions.suggest(requirements);
    } else if (activeStep === 1) {
      if (!selectedRoom) {
        setValidationError('Please select a room.');
        return;
      }
      setValidationError('');
      await conflictCheck.check(requirements, selectedRoom.roomId);
    } else if (activeStep === 2) {
      if (conflictCheck.data?.overallSeverity === 'critical') {
        setValidationError(
          'Critical conflict prevents saving. Please choose an alternative room or time.'
        );
        return;
      }
      if (!conflictCheck.data) {
        setValidationError('Conflict check is required before confirming.');
        return;
      }
      setValidationError('');
    }
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => {
    setValidationError('');
    setActiveStep((s) => s - 1);
  };

  const handleSaveDraft = () => handleSave('draft');
  const handleSubmitApproval = () => handleSave('pendingApproval');
  const handleConfirm = () =>
    handleSave(conflictCheck.data?.requiresApproval ? 'pendingApproval' : 'active');

  const handleSave = async (status: string) => {
    if (!selectedRoom) return;
    const result = await createReservation.create({
      roomId: selectedRoom.roomId,
      roomName: selectedRoom.roomName,
      buildingName: selectedRoom.buildingName,
      date: requirements.date,
      startTime: requirements.startTime,
      endTime: requirements.endTime,
      purpose: requirements.purpose,
      reservationType: requirements.reservationType as any,
      reservedFor: requirements.reservedFor,
      requestedBy: requirements.teacherName || 'Current User',
      teacherName: requirements.teacherName,
      subject: requirements.subject,
      approvalStatus: status === 'pendingApproval' ? 'pending' : 'approved',
      status: status as any,
      remarks: requirements.remarks,
    });
    if (result) {
      shikshaMitraToast.success({
        message:
          status === 'draft'
            ? 'Reservation saved as draft.'
            : status === 'pendingApproval'
              ? 'Reservation submitted for approval.'
              : 'Room reserved successfully!',
      });
      onSuccess?.(result);
      handleClose();
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setRequirements({ ...defaultRequirements });
    setSelectedRoom(null);
    setValidationError('');
    suggestions.reset();
    conflictCheck.reset();
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 560 }, display: 'flex', flexDirection: 'column' },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon="mdi:calendar-plus" width={24} color="primary.main" />
          <Typography variant="h6">Reserve a Room</Typography>
        </Stack>
        <IconButton onClick={handleClose}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>

      {/* Stepper */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Divider />

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 2 }}>
        {validationError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setValidationError('')}>
            {validationError}
          </Alert>
        )}

        {/* ── Step 1: Requirements ─────────────────────────── */}
        {activeStep === 0 && (
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              What do you need?
            </Typography>

            {/* AI Command Box */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: '1px dashed',
                borderColor: 'primary.light',
                bgcolor: 'primary.lighter',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Iconify icon="mdi:robot-outline" width={18} color="primary.main" />
                <Typography variant="caption" fontWeight={600} color="primary.main">
                  AI Command (Optional)
                </Typography>
              </Stack>
              <TextField
                size="small"
                fullWidth
                multiline
                rows={2}
                placeholder="e.g. Book a room for 9-A Physics Practical on Friday Period 3 with 30 students."
                value={requirements.aiCommand || ''}
                onChange={(e) => patchRequirements({ aiCommand: e.target.value })}
                sx={{ bgcolor: 'background.paper' }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }} display="block">
                Describe in plain text. AI will parse and fill the form.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DatePicker
                label="Date *"
                value={dayjs(requirements.date)}
                onChange={(v: Dayjs | null) => {
                  if (v) patchRequirements({ date: v.format('YYYY-MM-DD') });
                }}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <CustomSelect
                label="Lecture Slot"
                options={LECTURE_SLOT_OPTIONS}
                value={requirements.lectureSlot || 'all'}
                onChange={(v) => {
                  const slot = LECTURE_SLOT_OPTIONS.find((o) => o.value === v);
                  patchRequirements({
                    lectureSlot: v as string,
                    startTime: (slot as any)?.startTime || requirements.startTime,
                    endTime: (slot as any)?.endTime || requirements.endTime,
                  });
                }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                size="small"
                label="Required Capacity"
                type="number"
                value={requirements.requiredCapacity || ''}
                onChange={(e) => patchRequirements({ requiredCapacity: Number(e.target.value) })}
                fullWidth
                inputProps={{ min: 0 }}
              />
              <CustomSelect
                label="Room Type"
                options={ROOM_TYPE_OPTIONS}
                value={requirements.roomType || 'all'}
                onChange={(v) => patchRequirements({ roomType: v as string })}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CustomSelect
                label="Preferred Building"
                options={BUILDING_OPTIONS}
                value={requirements.preferredBuilding || 'all'}
                onChange={(v) => patchRequirements({ preferredBuilding: v as string })}
              />

              {/* Facilities Multi-select */}
              <FormControl size="small" fullWidth>
                <InputLabel>Required Facilities</InputLabel>
                <Select
                  multiple
                  value={requirements.requiredFacilities}
                  onChange={(e) =>
                    patchRequirements({ requiredFacilities: e.target.value as RoomFacility[] })
                  }
                  input={<OutlinedInput label="Required Facilities" />}
                  renderValue={(sel) =>
                    (sel as string[])
                      .slice(0, 2)
                      .map((f) => FACILITY_LABELS[f as RoomFacility])
                      .join(', ') + (sel.length > 2 ? ` +${sel.length - 2}` : '')
                  }
                >
                  {FACILITY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value} dense>
                      <Checkbox
                        checked={requirements.requiredFacilities.includes(opt.value)}
                        size="small"
                      />
                      <ListItemText primary={opt.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CustomSelect
                label="Class / Division"
                options={[{ value: '', label: '— Select —' }, ...CLASS_OPTIONS]}
                value={requirements.reservedFor || ''}
                onChange={(v) => patchRequirements({ reservedFor: v as string })}
              />
              <CustomSelect
                label="Teacher / Staff"
                options={[{ value: '', label: '— Select —' }, ...TEACHER_OPTIONS]}
                value={requirements.teacherName || ''}
                onChange={(v) => patchRequirements({ teacherName: v as string })}
              />
            </Stack>

            <TextField
              size="small"
              label="Subject"
              value={requirements.subject || ''}
              onChange={(e) => patchRequirements({ subject: e.target.value })}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={requirements.isRecurring}
                  onChange={(e) => patchRequirements({ isRecurring: e.target.checked })}
                />
              }
              label="Recurring Reservation"
            />

            {requirements.isRecurring && (
              <Alert severity="info" icon={<Iconify icon="mdi:repeat" />}>
                Recurring options: Daily / Weekly / Monthly with exclude holidays, exam days, and
                conflict skip. Full recurring configuration UI will appear here in the next version.
              </Alert>
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
        )}

        {/* ── Step 2: Suggested Rooms ──────────────────────── */}
        {activeStep === 1 && (
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Suggested Rooms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Based on your requirements: {requirements.purpose} · {requirements.date} ·{' '}
              {requirements.startTime}–{requirements.endTime}
            </Typography>

            {suggestions.isLoading && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={36} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  Finding best rooms for you…
                </Typography>
              </Box>
            )}

            {suggestions.error && <Alert severity="error">{suggestions.error}</Alert>}

            {!suggestions.isLoading && !suggestions.error && suggestions.data.length === 0 && (
              <Alert severity="warning">
                No matching rooms found. Try adjusting your requirements.
              </Alert>
            )}

            {suggestions.data.map((room) => {
              const isSelected = selectedRoom?.roomId === room.roomId;
              return (
                <Box
                  key={room.roomId}
                  onClick={() => {
                    if (room.conflictStatus !== 'critical') {
                      setSelectedRoom(room);
                      setValidationError('');
                    }
                  }}
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    border: 2,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                    cursor: room.conflictStatus === 'critical' ? 'not-allowed' : 'pointer',
                    opacity: room.conflictStatus === 'critical' ? 0.6 : 1,
                    transition: 'all 0.15s',
                    '&:hover':
                      room.conflictStatus !== 'critical' ? { borderColor: 'primary.light' } : {},
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="subtitle2">{room.roomName}</Typography>
                        <Chip
                          size="small"
                          label={`${room.matchScore}% match`}
                          color={
                            room.matchScore >= 80
                              ? 'success'
                              : room.matchScore >= 60
                                ? 'warning'
                                : 'default'
                          }
                          variant="soft"
                          sx={{ fontSize: 10, height: 18 }}
                        />
                        {isSelected && (
                          <Chip
                            size="small"
                            label="Selected"
                            color="primary"
                            variant="filled"
                            sx={{ fontSize: 10, height: 18 }}
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {room.buildingName} · {room.floorName} · {room.type} · {room.capacity} seats
                      </Typography>
                    </Box>
                    <RoomStatusChip
                      status={
                        room.conflictStatus === 'critical'
                          ? 'conflict'
                          : room.conflictStatus === 'warning'
                            ? 'reserved'
                            : 'available'
                      }
                      showIcon={false}
                    />
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    {room.reason}
                  </Typography>

                  {room.nextAvailableAt && (
                    <Typography variant="caption" color="warning.main">
                      Next available: {room.nextAvailableAt}
                    </Typography>
                  )}

                  {/* Badges */}
                  <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                    {room.badges.map((badge) => (
                      <Chip
                        key={badge}
                        size="small"
                        label={SUGGESTION_BADGE_LABELS[badge]}
                        color={
                          badge === 'warning' || badge === 'needsApproval' ? 'warning' : 'info'
                        }
                        variant="soft"
                        sx={{ fontSize: 10, height: 18 }}
                      />
                    ))}
                  </Stack>

                  {/* Facilities */}
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
                    {room.facilities.slice(0, 5).map((f) => (
                      <Tooltip key={f} title={FACILITY_LABELS[f]} arrow>
                        <Box sx={{ color: 'text.secondary' }}>
                          <Iconify icon={FACILITY_ICONS[f]} width={14} />
                        </Box>
                      </Tooltip>
                    ))}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}

        {/* ── Step 3: Conflict Check ───────────────────────── */}
        {activeStep === 2 && (
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Conflict Check
            </Typography>

            {selectedRoom && (
              <Alert severity="info" icon={<Iconify icon="mdi:door" />}>
                <strong>{selectedRoom.roomName}</strong> · {selectedRoom.buildingName} ·{' '}
                {selectedRoom.capacity} seats
              </Alert>
            )}

            {conflictCheck.isLoading && (
              <Box>
                <LinearProgress sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Checking all conflicts…
                </Typography>
              </Box>
            )}

            {conflictCheck.error && (
              <Alert severity="error">
                {conflictCheck.error}
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  Conflict check is mandatory. Cannot save without it.
                </Typography>
              </Alert>
            )}

            {conflictCheck.data && (
              <Stack spacing={1}>
                {[
                  { key: 'roomAvailability', label: 'Room Availability' },
                  { key: 'teacherAvailability', label: 'Teacher Availability' },
                  { key: 'classAvailability', label: 'Class Availability' },
                  { key: 'maintenanceCheck', label: 'Maintenance Check' },
                  { key: 'examSchedule', label: 'Exam Schedule' },
                  { key: 'holidayCalendar', label: 'Holiday Calendar' },
                  { key: 'duplicateReservation', label: 'Duplicate Reservation' },
                ].map(({ key, label }) => {
                  const check = (conflictCheck.data as any)[key] as {
                    passed: boolean;
                    message?: string;
                  };
                  return (
                    <Stack key={key} direction="row" alignItems="center" spacing={1.5}>
                      <Iconify
                        icon={check.passed ? 'mdi:check-circle' : 'mdi:alert-circle'}
                        width={18}
                        color={check.passed ? 'success.main' : 'error.main'}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">{label}</Typography>
                        {!check.passed && check.message && (
                          <Typography variant="caption" color="error.main">
                            {check.message}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        size="small"
                        label={check.passed ? 'Clear' : 'Issue'}
                        color={check.passed ? 'success' : 'error'}
                        variant="soft"
                        sx={{ fontSize: 10, height: 18 }}
                      />
                    </Stack>
                  );
                })}

                {conflictCheck.data.conflicts.map((conflict, i) => (
                  <Alert key={i} severity={conflict.severity === 'critical' ? 'error' : 'warning'}>
                    <Typography variant="subtitle2">{conflict.type}</Typography>
                    <Typography variant="body2">{conflict.message}</Typography>
                    {conflict.suggestion && (
                      <Typography variant="caption" color="text.secondary">
                        Suggestion: {conflict.suggestion}
                      </Typography>
                    )}
                  </Alert>
                ))}

                {conflictCheck.data.requiresApproval && (
                  <Alert severity="info" icon={<Iconify icon="mdi:clock-outline" />}>
                    This reservation will require admin approval before it becomes active.
                  </Alert>
                )}

                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor:
                      conflictCheck.data.overallSeverity === 'none'
                        ? 'success.lighter'
                        : conflictCheck.data.overallSeverity === 'critical'
                          ? 'error.lighter'
                          : 'warning.lighter',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {conflictCheck.data.overallSeverity === 'none' ? (
                      <Iconify icon="mdi:check-all" width={20} color="success.dark" />
                    ) : (
                      <ConflictSeverityChip severity={conflictCheck.data.overallSeverity} />
                    )}
                    <Typography variant="subtitle2">
                      {conflictCheck.data.overallSeverity === 'none'
                        ? 'All checks passed. Ready to reserve.'
                        : conflictCheck.data.overallSeverity === 'critical'
                          ? 'Critical conflict — cannot save. Choose another room or time.'
                          : 'Warnings found — approval required.'}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            )}
          </Stack>
        )}

        {/* ── Step 4: Confirm ──────────────────────────────── */}
        {activeStep === 3 && selectedRoom && conflictCheck.data && (
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Confirm Reservation
            </Typography>

            <Box sx={{ p: 2, borderRadius: 1.5, border: 1, borderColor: 'divider' }}>
              {[
                { label: 'Room', value: `${selectedRoom.roomName} · ${selectedRoom.buildingName}` },
                { label: 'Date', value: requirements.date },
                { label: 'Time', value: `${requirements.startTime} – ${requirements.endTime}` },
                { label: 'Type', value: requirements.reservationType || '—' },
                { label: 'Purpose', value: requirements.purpose || '—' },
                { label: 'Reserved For', value: requirements.reservedFor || '—' },
                { label: 'Teacher / Staff', value: requirements.teacherName || '—' },
                { label: 'Subject', value: requirements.subject || '—' },
                {
                  label: 'Capacity',
                  value: `${requirements.requiredCapacity || selectedRoom.capacity} seats`,
                },
                { label: 'Priority', value: requirements.priority },
              ].map(({ label, value }) => (
                <Stack key={label} direction="row" spacing={1} sx={{ mb: 0.75 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {value}
                  </Typography>
                </Stack>
              ))}
            </Box>

            {requirements.remarks && (
              <Alert severity="info" icon={<Iconify icon="mdi:note-text" />}>
                <Typography variant="caption">{requirements.remarks}</Typography>
              </Alert>
            )}

            {conflictCheck.data.requiresApproval ? (
              <Alert severity="warning" icon={<Iconify icon="mdi:clock-outline" />}>
                This reservation will be submitted for approval. It becomes active after admin
                approves.
              </Alert>
            ) : (
              <Alert severity="success" icon={<Iconify icon="mdi:check-circle" />}>
                All conflict checks passed. Room will be reserved immediately.
              </Alert>
            )}

            {selectedRoom.needsApproval && (
              <Alert severity="info">
                This room type (e.g. Auditorium) always requires admin approval.
              </Alert>
            )}
          </Stack>
        )}
      </Box>

      {/* Footer */}
      <Divider />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 2.5, py: 2 }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={activeStep === 0 ? handleClose : handleBack}
          startIcon={<Iconify icon={activeStep === 0 ? 'mdi:close' : 'mdi:arrow-left'} />}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>

        <Stack direction="row" spacing={1}>
          {activeStep === 3 && (
            <>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Iconify icon="mdi:content-save-outline" />}
                onClick={handleSaveDraft}
                disabled={createReservation.isLoading}
              >
                Save Draft
              </Button>
              {conflictCheck.data?.requiresApproval && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<Iconify icon="mdi:send-outline" />}
                  onClick={handleSubmitApproval}
                  disabled={createReservation.isLoading}
                >
                  Submit for Approval
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={
                  createReservation.isLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Iconify icon="mdi:check" />
                  )
                }
                onClick={handleConfirm}
                disabled={createReservation.isLoading}
              >
                {conflictCheck.data?.requiresApproval ? 'Submit' : 'Confirm Reservation'}
              </Button>
            </>
          )}

          {activeStep < 3 && (
            <Button
              variant="contained"
              endIcon={<Iconify icon="mdi:arrow-right" />}
              onClick={handleNext}
              disabled={suggestions.isLoading || conflictCheck.isLoading}
            >
              {activeStep === 0
                ? 'Find Rooms'
                : activeStep === 1
                  ? 'Check Conflicts'
                  : 'Review & Confirm'}
            </Button>
          )}
        </Stack>
      </Stack>
    </Drawer>
  );
};

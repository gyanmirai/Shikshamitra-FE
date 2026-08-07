import { useDispatch } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import React, { useState, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { useGetRoomAvailabilityQuery } from 'src/redux/academicAPI/timetableApi/roomAvailabilityApi';
import {
  Box,
  Alert,
  Button,
  Checkbox,
  Divider,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { Iconify } from '../iconify';
import CustomDialog from '../customDialog';
import CustomTooltip from '../custom-tooltip';

import type { TimeSlot, DayOfWeek, SlotSubject } from './types';
import type { TimetableValidationIssue } from './timetableValidationIssues';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RoomAssignment {
  day: DayOfWeek;
  slotIndex: number;
  subjects: SlotSubject[];
}

interface AssignRoomDialogProps {
  open: RoomAssignment | null;
  slots: Record<DayOfWeek, TimeSlot[]>;
  standardId: string;
  divisionId: string;
  timetableStatus?: number | null;
  onClose: () => void;
  onSave: (
    day: DayOfWeek,
    slotIndex: number,
    updatedSubjects: SlotSubject[],
    bulkOptions?: {
      applyToAllSlots: Record<string, boolean>;
      applyToAllSubjectSlots: Record<string, boolean>;
    }
  ) => Promise<TimetableValidationIssue[]> | TimetableValidationIssue[] | void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAY_NAME_MAP: Record<DayOfWeek, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
};

function splitPipeSubjects(subjects: SlotSubject[]): SlotSubject[] {
  const result: SlotSubject[] = [];
  subjects.forEach((sub) => {
    if (sub.name.includes('|')) {
      sub.name.split('|').forEach((partName, idx) => {
        const isAlreadySplit = sub.subjectId.includes('_part_');
        result.push({
          ...sub,
          subjectId: isAlreadySplit ? sub.subjectId : `${sub.subjectId}_part_${idx}`,
          name: partName.trim(),
          teacherId: idx === 0 ? sub.teacherId : undefined,
          teacherName: idx === 0 ? sub.teacherName : undefined,
          roomId: idx === 0 ? sub.roomId : undefined,
          roomName: idx === 0 ? sub.roomName : undefined,
        });
      });
    } else {
      result.push(sub);
    }
  });
  return result;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AssignRoomDialog: React.FC<AssignRoomDialogProps> = ({
  open,
  slots,
  standardId,
  divisionId,
  timetableStatus,
  onClose,
  onSave,
}) => {
  const dispatch = useDispatch();
  const { data: rooms } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomsQuery,
  });

  const currentSlot = open ? slots[open.day]?.[open.slotIndex] : null;

  const queryDate = React.useMemo(() => {
    if (!open) return '';
    const dayOfWeek = open.day;
    const dayIndexMap: Record<string, number> = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };
    const targetDayIndex = dayIndexMap[dayOfWeek.toUpperCase()] ?? 1;
    const result = new Date();
    const currentDayIndex = result.getDay();
    const distance = targetDayIndex - currentDayIndex;
    result.setDate(result.getDate() + distance);

    const year = result.getFullYear();
    const month = String(result.getMonth() + 1).padStart(2, '0');
    const dStr = String(result.getDate()).padStart(2, '0');
    return `${year}-${month}-${dStr}`;
  }, [open]);

  const queryParams = React.useMemo(() => {
    if (!open || !currentSlot) return null;

    const formatTime = (t: string) => {
      if (!t) return undefined;
      const parts = t.split(':');
      if (parts.length === 2) return `${t}:00`;
      return t;
    };

    return {
      date: queryDate,
      startTime: formatTime(currentSlot.startTime),
      endTime: formatTime(currentSlot.endTime),
      standardId,
      divisionId,
      includeOccupied: true,
    };
  }, [open, currentSlot, queryDate, standardId, divisionId]);

  const { data: availableRoomsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomAvailabilityQuery,
    params: queryParams,
    options: {
      skip: !queryParams,
    },
  });

  const [selectedIds, setSelectedIds] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictIssues, setConflictIssues] = useState<TimetableValidationIssue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyToAllSlots, setApplyToAllSlots] = useState<Record<string, boolean>>({});
  const [applyToAllSubjectSlots, setApplyToAllSubjectSlots] = useState<Record<string, boolean>>({});

  // Reset selections when a new assignment is opened
  const prevRef = React.useRef<RoomAssignment | null>(null);
  if (open !== prevRef.current) {
    prevRef.current = open;
    if (open) {
      const initial: Record<string, string> = {};
      splitPipeSubjects(open.subjects).forEach((sub) => {
        if (sub.roomId) initial[sub.subjectId] = sub.roomId;
      });
      setSelectedIds(initial);
      setErrors({});
      setConflictIssues([]);
      setApplyToAllSlots({});
      setApplyToAllSubjectSlots({});
      dispatch(setIsChanges(false));
    }
  }

  const handleCloseDialog = useCallback(() => {
    dispatch(setIsChanges(false));
    onClose();
  }, [dispatch, onClose]);

  const roomList: any[] = React.useMemo(() => {
    if (availableRoomsData && availableRoomsData.length > 0) {
      return availableRoomsData.map((r: any) => ({
        id: r.roomId,
        roomName: r.roomName,
        buildingName: r.buildingName,
        floorName: r.floorName,
        status: r.status,
      }));
    }
    return (rooms?.items ?? []).map((r: any) => ({
      id: r.id,
      roomName: r.roomName,
      buildingName: r.buildingName,
      floorName: r.floorName,
      status: 'available',
    }));
  }, [availableRoomsData, rooms]);

  const splitSubjects = open ? splitPipeSubjects(open.subjects) : [];

  const handleChange = useCallback((subjectId: string, value: any) => {
    dispatch(setIsChanges(true));
    setSelectedIds((prev) => ({ ...prev, [subjectId]: value?.id ?? '' }));
  }, [dispatch]);

  const handleSave = async () => {
    if (!open) return;

    const newErrors: Record<string, string> = {};

    // Validate: prevent same room assigned to multiple subjects at same time
    // (multiple classes cannot use the same room simultaneously)
    const roomAssignments: Record<string, string[]> = {};
    splitSubjects.forEach((sub) => {
      const roomId = selectedIds[sub.subjectId];
      if (roomId) {
        if (!roomAssignments[roomId]) {
          roomAssignments[roomId] = [];
        }
        roomAssignments[roomId].push(sub.subjectId);
      }
    });

    // Find duplicate room assignments
    Object.entries(roomAssignments).forEach(([roomId, subjectIds]) => {
      if (subjectIds.length > 1) {
        // Same room assigned to multiple subjects - mark all as errors
        subjectIds.forEach((subjectId) => {
          newErrors[subjectId] =
            'Same room cannot be assigned to multiple subjects at the same time';
        });
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setConflictIssues([]);
      return;
    }
    setErrors({});
    setConflictIssues([]);

    const { day, slotIndex } = open;

    const updatedSubjects: SlotSubject[] = splitSubjects.map((sub) => {
      const selectedId = selectedIds[sub.subjectId];
      const selectedItem = roomList.find((r) => r.id === selectedId);
      return {
        ...sub,
        roomId: selectedId || undefined,
        roomName: selectedItem?.roomName || selectedItem?.name || undefined,
      };
    });

    setIsSubmitting(true);
    try {
      const issues =
        (await onSave(day, slotIndex, updatedSubjects, {
          applyToAllSlots,
          applyToAllSubjectSlots,
        })) ?? [];

      if (issues.length > 0) {
        setConflictIssues(issues);
        return;
      }

      dispatch(setIsChanges(false));
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomDialog
      open={!!open}
      handleClose={handleCloseDialog}
      maxWidth="xs"
      fullWidth
      hasForm={true}
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Assign Room
          </Typography>
          <CustomTooltip
            arrow
            placement="bottom-start"
            title="Select an available classroom or lab for this period slot. Options include applying to all slots of this subject or all slots in the timetable."
          >
            <IconButton size="small" color="info" sx={{ p: 0.5 }}>
              <Iconify icon="lucide:info" width={18} />
            </IconButton>
          </CustomTooltip>
        </Box>
      }
    >
      <DialogContent sx={{ pb: 2 }}>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {conflictIssues.length > 0 && (
            <Alert severity="error" icon={<Iconify icon="mdi:door-closed-lock" />}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Room is not available for this time slot
              </Typography>
              {conflictIssues.map((issue, index) => (
                <Box key={`${issue.title}-${index}`} sx={{ mt: index === 0 ? 0 : 1 }}>
                  {index > 0 && <Divider sx={{ my: 1 }} />}
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {issue.title}
                  </Typography>
                  <Typography variant="body2">{issue.description}</Typography>
                </Box>
              ))}
            </Alert>
          )}
          {splitSubjects.length > 0 ? (
            splitSubjects.map((sub) => (
              <Box
                key={sub.subjectId}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  pb: 2,
                  '&:last-child': { borderBottom: 'none', pb: 0 },
                }}
              >
                <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                  For {sub.name} :
                </Typography>
                <Autocomplete
                  fullWidth
                  size="small"
                  options={roomList.filter((room) => {
                    const otherSelectedRoomIds = Object.entries(selectedIds)
                      .filter(([subjectId]) => subjectId !== sub.subjectId)
                      .map(([, roomId]) => roomId)
                      .filter(Boolean);
                    if (otherSelectedRoomIds.includes(room.id)) {
                      return false;
                    }
                    return room.status === 'available' || selectedIds[sub.subjectId] === room.id;
                  })}
                  getOptionLabel={(option: any) =>
                    `${option.buildingName} - ${option.floorName} - ${option?.roomName}` || ''
                  }
                  value={roomList.find((r) => r.id === selectedIds[sub.subjectId]) ?? null}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  onChange={(_, value) => {
                    handleChange(sub.subjectId, value);
                    setErrors((prev) => {
                      const e = { ...prev };
                      delete e[sub.subjectId];
                      return e;
                    });
                  }}
                  renderInput={(params) => (
                    <CustomTooltip title="Building-Floor-Room" arrow placement="top-start">
                      <TextField
                        {...params}
                        label="Select Room"
                        error={!!errors[sub.subjectId]}
                        helperText={errors[sub.subjectId]}
                      />
                    </CustomTooltip>
                  )}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1.5, gap: 0.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={!!applyToAllSubjectSlots[sub.subjectId]}
                        onChange={(e) => {
                          const { checked } = e.target;
                          setApplyToAllSubjectSlots((prev) => ({
                            ...prev,
                            [sub.subjectId]: checked,
                          }));
                          if (checked) {
                            setApplyToAllSlots((prev) => ({ ...prev, [sub.subjectId]: false }));
                          }
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontSize: '0.825rem' }}>
                        Apply room to all slots of this subject
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={!!applyToAllSlots[sub.subjectId]}
                        onChange={(e) => {
                          const { checked } = e.target;
                          setApplyToAllSlots((prev) => ({ ...prev, [sub.subjectId]: checked }));
                          if (checked) {
                            setApplyToAllSubjectSlots((prev) => ({
                              ...prev,
                              [sub.subjectId]: false,
                            }));
                          }
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontSize: '0.825rem' }}>
                        Apply room to all slots in the timetable
                      </Typography>
                    }
                  />
                </Box>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No subjects found in this slot.
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          size="small"
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          size="small"
          disabled={isSubmitting}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          {isSubmitting ? 'Checking...' : 'Submit'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default AssignRoomDialog;

import { useDispatch } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import React, { useState, useCallback } from 'react';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { GroupedRoomSelector } from 'src/components/room-selection/GroupedRoomSelector';
import {
  Box,
  Alert,
  Button,
  Divider,
  Checkbox,
  IconButton,
  Typography,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { Iconify } from '../iconify';
import CustomDialog from '../customDialog';
import CustomTooltip from '../custom-tooltip';
import { useWeeklyRoomOptions } from './useWeeklyRoomOptions';
import { addDivisionRoomDefault, createSavedRoomSelections } from './roomAssignmentDefaults';

import type { TimeSlot, DayOfWeek, SlotSubject } from './types';
import type { RoomOption } from '../room-selection/roomOptions';
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
  const currentSlot = open ? slots[open.day]?.[open.slotIndex] : null;
  const { roomList, divisionRoomId, isRoomsLoading, hasRoomError, retryRooms } =
    useWeeklyRoomOptions(open?.day, currentSlot, standardId, divisionId);

  const [selectedIds, setSelectedIds] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictIssues, setConflictIssues] = useState<TimetableValidationIssue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyToAllSlots, setApplyToAllSlots] = useState<Record<string, boolean>>({});
  const [applyToAllSubjectSlots, setApplyToAllSubjectSlots] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (!open) return;

    setSelectedIds(createSavedRoomSelections(splitPipeSubjects(open.subjects)));
    setErrors({});
    setConflictIssues([]);
    setApplyToAllSlots({});
    setApplyToAllSubjectSlots({});
    dispatch(setIsChanges(false));
  }, [dispatch, open]);

  const handleCloseDialog = useCallback(() => {
    dispatch(setIsChanges(false));
    onClose();
  }, [dispatch, onClose]);

  React.useEffect(() => {
    if (!open || !divisionRoomId || !roomList.some((room) => room.id === divisionRoomId)) {
      return;
    }

    const subjects = splitPipeSubjects(open.subjects);
    setSelectedIds((current) => addDivisionRoomDefault(current, subjects, divisionRoomId));
  }, [divisionRoomId, open, roomList]);

  const splitSubjects = open ? splitPipeSubjects(open.subjects) : [];

  const handleChange = useCallback(
    (subjectId: string, value: RoomOption | null) => {
      dispatch(setIsChanges(true));
      setSelectedIds((prev) => ({ ...prev, [subjectId]: value?.id ?? '' }));
    },
    [dispatch]
  );

  const handleSave = async () => {
    if (!open || isRoomsLoading || hasRoomError) return;

    const newErrors: Record<string, string> = {};

    // Validate: required room assignment
    splitSubjects.forEach((sub) => {
      const roomId = selectedIds[sub.subjectId];
      if (!roomId) {
        newErrors[sub.subjectId] = 'Room is required';
      }
    });

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
        roomName: selectedItem?.roomName || undefined,
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
        const fieldErrors: Record<string, string> = {};
        splitSubjects.forEach((sub) => {
          const matched = issues.find(
            (iss) =>
              iss.description?.toLowerCase().includes(sub.name.toLowerCase()) ||
              iss.title?.toLowerCase().includes(sub.name.toLowerCase())
          );
          if (matched) {
            fieldErrors[sub.subjectId] = matched.description || matched.title;
          } else {
            fieldErrors[sub.subjectId] =
              issues[0]?.description || issues[0]?.title || 'Room conflict detected';
          }
        });
        setErrors(fieldErrors);
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
      hasForm
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Assign Room
          </Typography>
          <CustomTooltip
            arrow
            placement="right"
            title="Choose a room for this weekly period. Room conflicts are checked before applying your selection. You can apply the room to other periods using the options below."
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
          {hasRoomError && (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => retryRooms()}
                >
                  Retry
                </Button>
              }
            >
              Unable to load rooms for this weekly period.
            </Alert>
          )}
          {!hasRoomError && !isRoomsLoading && roomList.length === 0 && (
            <Alert severity="info">
              No rooms are configured. Add rooms in Institute Setup before assigning this period.
            </Alert>
          )}
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
                <GroupedRoomSelector
                  label="Select Room *"
                  loading={isRoomsLoading}
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
                  value={roomList.find((r) => r.id === selectedIds[sub.subjectId]) ?? null}
                  error={!!errors[sub.subjectId]}
                  helperText={errors[sub.subjectId]}
                  onChange={(value) => {
                    handleChange(sub.subjectId, value as RoomOption | null);
                    setErrors((prev) => {
                      const e = { ...prev };
                      delete e[sub.subjectId];
                      return e;
                    });
                  }}
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
          disabled={isSubmitting || isRoomsLoading || hasRoomError || roomList.length === 0}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          {isSubmitting ? 'Checking...' : 'Submit'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default AssignRoomDialog;

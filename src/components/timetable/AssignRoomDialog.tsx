import { useDispatch } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import React, { useState, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetDivisionByIdQuery } from 'src/redux/division/divisionApi';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { GroupedRoomSelector } from 'src/components/room-selection/GroupedRoomSelector';
import { sortRoomOptions, createRoomOption } from 'src/components/room-selection/roomOptions';
import { useGetRoomAvailabilityQuery } from 'src/redux/academicAPI/timetableApi/roomAvailabilityApi';
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
  const {
    data: rooms,
    isLoading: roomsLoading,
    isFetching: roomsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomsQuery,
  });
  const {
    data: division,
    isLoading: divisionLoading,
    isFetching: divisionFetching,
  } = useGetDivisionByIdQuery(divisionId, {
    skip: !open || !divisionId,
    refetchOnMountOrArgChange: true,
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

  const {
    data: availableRoomsData,
    isLoading: availabilityLoading,
    isFetching: availabilityFetching,
  } = useQueryAndMutation({
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

  const roomList: RoomOption[] = React.useMemo(() => {
    if (availableRoomsData && availableRoomsData.length > 0) {
      return sortRoomOptions(availableRoomsData.map((room: any) => createRoomOption(room)));
    }
    return sortRoomOptions(
      (rooms?.items ?? []).map((room: any) => createRoomOption({ ...room, status: 'available' }))
    );
  }, [availableRoomsData, rooms]);

  const isRoomsLoading =
    roomsLoading ||
    roomsFetching ||
    availabilityLoading ||
    availabilityFetching ||
    divisionLoading ||
    divisionFetching;

  React.useEffect(() => {
    if (!open || !division?.roomId || !roomList.some((room) => room.id === division.roomId)) {
      return;
    }

    const subjects = splitPipeSubjects(open.subjects);
    setSelectedIds((current) => addDivisionRoomDefault(current, subjects, division.roomId));
  }, [division?.roomId, open, roomList]);

  const splitSubjects = open ? splitPipeSubjects(open.subjects) : [];

  const handleChange = useCallback(
    (subjectId: string, value: RoomOption | null) => {
      dispatch(setIsChanges(true));
      setSelectedIds((prev) => ({ ...prev, [subjectId]: value?.id ?? '' }));
    },
    [dispatch]
  );

  const handleSave = async () => {
    if (!open) return;

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

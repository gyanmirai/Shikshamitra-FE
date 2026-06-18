import { GlobalIcons } from 'src/utils/icons';
import React, { useState, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { useAssignRoomsMutation } from 'src/redux/academicAPI/timetableApi/timetableManagementApi';
import {
  Box,
  Button,
  Checkbox,
  TextField,
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
  onClose: () => void;
  onSave: (
    day: DayOfWeek,
    slotIndex: number,
    updatedSubjects: SlotSubject[],
    bulkOptions?: {
      applyToAllSlots: Record<string, boolean>;
      applyToAllSubjectSlots: Record<string, boolean>;
    }
  ) => void;
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
  onClose,
  onSave,
}) => {
  const { data: rooms } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomsQuery,
  });

  const [assignRooms, { isLoading: isAssigningRooms }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAssignRoomsMutation,
  });

  const [selectedIds, setSelectedIds] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
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
      setApplyToAllSlots({});
      setApplyToAllSubjectSlots({});
    }
  }

  const roomList: any[] = rooms?.items ?? [];
  const splitSubjects = open ? splitPipeSubjects(open.subjects) : [];

  const handleChange = useCallback((subjectId: string, value: any) => {
    setSelectedIds((prev) => ({ ...prev, [subjectId]: value?.id ?? '' }));
  }, []);

  const handleSave = async () => {
    if (!open) return;

    // Validate: each subject must have a room selected
    const newErrors: Record<string, string> = {};
    splitSubjects.forEach((sub) => {
      if (!selectedIds[sub.subjectId]) {
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
      return;
    }
    setErrors({});

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

    if (standardId && divisionId) {
      const currentSlot = slots[day]?.[slotIndex];
      if (currentSlot) {
        // Only call API for the current slot to prevent backend lock issues and rate-limiting
        const subjectsPayload = splitSubjects
          .map((sub) => {
            const selectedRoomId = selectedIds[sub.subjectId];
            const rawSubjectId = sub.subjectId.includes('_part_')
              ? sub.subjectId.split('_part_')[0]
              : sub.subjectId;
            return selectedRoomId ? { subjectId: rawSubjectId, roomId: selectedRoomId } : null;
          })
          .filter(Boolean) as { subjectId: string; roomId: string }[];

        if (subjectsPayload.length > 0) {
          try {
            await assignRooms({
              standardId,
              divisionId,
              day: DAY_NAME_MAP[day],
              startTime: currentSlot.startTime,
              endTime: currentSlot.endTime,
              subjectType: currentSlot.subjectType ?? 0,
              electiveGroupId: currentSlot.electiveGroupId ?? null,
              subjects: subjectsPayload,
            }).unwrap();
          } catch {
            // API errors are handled globally
            return;
          }
        }
      }
    }

    onSave(day, slotIndex, updatedSubjects, {
      applyToAllSlots,
      applyToAllSubjectSlots,
    });
    onClose();
  };

  return (
    <CustomDialog open={!!open} handleClose={onClose} maxWidth="xs" fullWidth title="Assign Room">
      <DialogContent sx={{ pb: 2 }}>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                  options={roomList}
                  getOptionLabel={(option: any) =>
                    `${option.buildingName} - ${option.floorName} - ${option?.roomName}` || ''
                  }
                  value={roomList.find((r) => r.id === selectedIds[sub.subjectId]) ?? null}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  onChange={(_, value) => {
                    handleChange(sub.subjectId, value);
                    if (value)
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
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          disabled={isAssigningRooms}
          loading={isAssigningRooms}
        >
          Submit
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default AssignRoomDialog;

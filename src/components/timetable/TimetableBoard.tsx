import confetti from 'canvas-confetti';
import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/use-boolean';
import { HTML5Backend } from 'react-dnd-html5-backend';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import { useAssignRoomsMutation } from 'src/redux/academicAPI/timetableApi/timetableManagementApi';
import CreateSlotsForm from 'src/screens/academic/timetable-schedule-management/settings/components/lectureSlots/createSlotsForm';
import {
  Box,
  Paper,
  Button,
  TextField,
  Typography,
  Autocomplete,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { SlotType } from './types';
import DayColumn from './DayColumn';
import { Iconify } from '../iconify';
import CustomDialog from '../customDialog';
import SubjectPalette from './SubjectPalette';
import { MOCK_TEACHERS, generateTimelineStamps } from './utils';

import type { Subject, TimeSlot, DayOfWeek, SlotSubject } from './types';

export interface TimetableBoardProps {
  slots: Record<DayOfWeek, TimeSlot[]>;
  onChange: (newSlots: Record<DayOfWeek, TimeSlot[]>) => void;
  subjects: Subject[];
  readOnly?: boolean;
  selectedClass: string;
  selectedDivision: string;
  standardId?: string;
  divisionId?: string;
}

const TimetableBoard: React.FC<TimetableBoardProps> = ({
  slots,
  onChange,
  subjects,
  readOnly = false,
  selectedClass,
  selectedDivision,
  standardId = '',
  divisionId = '',
}) => {
  const [timelineStamps] = useState(generateTimelineStamps());
  const createSlotsDialog = useBoolean();
  // Dialog State
  const [activeDialog, setActiveDialog] = useState<{
    type: 'teacher' | 'room';
    day: DayOfWeek;
    slotId: string;
    subjects: SlotSubject[];
  } | null>(null);
  console.log('activeDialog---', slots);
  // Map subjectId -> selected teacherId/roomId
  const [selectedIds, setSelectedIds] = useState<Record<string, string>>({});

  // --- Actions ---

  const handleDropSubject = (
    dayKey: string,
    slotId: string,
    subject: Subject,
    fromSlotId?: string
  ) => {
    console.log('subject-----', subject);
    if (readOnly) return;

    // 1. Update State
    const newWeeklySlots = { ...slots };

    // -- HANDLE MOVE (Remove from old slot) --
    if (fromSlotId) {
      const [fromDayStr, fromDayIndex] = fromSlotId.split('-'); // e.g., "MONDAY-2"
      const fromDay = fromDayStr as DayOfWeek;

      const fromSlots = newWeeklySlots[fromDay];

      if (fromSlots) {
        newWeeklySlots[fromDay] = newWeeklySlots[fromDay].map((s, index) => {
          if (index === parseInt(fromDayIndex, 10)) {
            return {
              ...s,
              subjectId: null,
              _attachedSubject: undefined,
              subjects: [], // Clear specific array
              subjectType: null,
              electiveGroupId: null,
              electiveGroupName: null,
            } as any;
          }
          return s;
        });
      }
    }

    // -- HANDLE DROP (Add to new slot) --
    const daySlots = [...(newWeeklySlots[dayKey as DayOfWeek] || [])];
    const slotIndex = daySlots.findIndex((_, index) => index === parseInt(slotId, 10));

    if (slotIndex !== -1) {
      let newSlotSubjects: SlotSubject[];
      const isElective = (subject as any).subjectType === 1;
      const apiSubjects: any[] = (subject as any).subjects || [];

      if (isElective && apiSubjects.length > 0) {
        // --- Elective Group: map each child subject from the API subjects array ---
        newSlotSubjects = apiSubjects.map((sub: any) => ({
          id: sub.subjectId,
          name: sub.subjectName,
          color: sub.color || subject.color,
          teacherId: undefined,
          teacherName: undefined,
          roomId: undefined,
          roomName: undefined,
        }));
      } else {
        // --- Core subject: legacy pipe-split fallback ---
        const subjectNames = subject.name.split('|').map((s) => s.trim());
        newSlotSubjects = subjectNames.map((name, index) => ({
          id: subjectNames.length > 1 ? `${subject.id}_part_${index}` : subject.id,
          name,
          color: subject.color,
          teacherId: index === 0 ? subject.teacherId : undefined,
          teacherName: index === 0 ? subject.teacherName : undefined,
          roomId: index === 0 ? subject.roomId : undefined,
          roomName: index === 0 ? subject.roomName : undefined,
        }));
      }

      daySlots[slotIndex] = {
        ...daySlots[slotIndex],
        subjectId: subject.id,
        _attachedSubject: subject,
        subjects: newSlotSubjects,
        subjectType: isElective ? 1 : 0,
        electiveGroupId: isElective ? ((subject as any).electiveGroupId ?? subject.id) : null,
        electiveGroupName: isElective ? ((subject as any).electiveGroupName ?? subject.name) : null,
      } as any;

      newWeeklySlots[dayKey as DayOfWeek] = daySlots;
    } else {
      return; // Should not happen
    }

    // 2. Check for Day Completion (Gamification)
    const lectureSlots = daySlots.filter((s) => s.type === SlotType.LECTURE);
    const newFilledSlots = lectureSlots.filter(
      (s) => (s.subjects && s.subjects.length > 0) || s.subjectId
    );

    if (newFilledSlots.length === lectureSlots.length) {
      triggerConfetti();
    }
    onChange(newWeeklySlots);
  };

  const handleRemoveSubject = (day: DayOfWeek, slotId: number, subject: Subject) => {
    if (readOnly) return;
    const dayKey = day as DayOfWeek;
    const newWeeklySlots = { ...slots };

    if (newWeeklySlots[dayKey]) {
      newWeeklySlots[dayKey] = newWeeklySlots[dayKey].map((s, index) => {
        if (index === slotId) {
          return {
            ...s,
            subjectId: null,
            _attachedSubject: undefined,
            subjects: [], // Clear array
            subjectType: null,
            electiveGroupId: null,
            electiveGroupName: null,
          } as any;
        }
        return s;
      });
      onChange(newWeeklySlots);
    }
  };

  const handleAssignTeacher = (day: DayOfWeek, slotId: string, subject: Subject) => {
    console.log('slotId---in teacher assignment=====', slotId);
    const dayKey = day as DayOfWeek;
    const slot = slots[dayKey]?.find((_, index) => index === parseInt(slotId, 10));
    if (!slot || !slot.subjects) return;

    // Lazily split if we detect composite names (and it wasn't split yet)
    const splitSubjects: SlotSubject[] = [];
    const initialSelections: Record<string, string> = {};

    slot.subjects.forEach((sub) => {
      if (sub.name.includes('|')) {
        const parts = sub.name.split('|').map((s) => s.trim());
        parts.forEach((partName, idx) => {
          // If we are splitting on the fly, we need new IDs.
          const isAlreadySplitId = sub.id.includes('_part_');
          const newId = isAlreadySplitId ? sub.id : `${sub.id}_part_${idx}`;

          splitSubjects.push({
            ...sub,
            id: newId,
            name: partName,
            teacherId: idx === 0 ? sub.teacherId : undefined,
            teacherName: idx === 0 ? sub.teacherName : undefined,
            roomId: idx === 0 ? sub.roomId : undefined,
            roomName: idx === 0 ? sub.roomName : undefined,
          });

          if (idx === 0 && sub.teacherId) {
            initialSelections[newId] = sub.teacherId;
          }
        });
      } else {
        splitSubjects.push(sub);
        if (sub.teacherId) initialSelections[sub.id] = sub.teacherId;
      }
    });

    setSelectedIds(initialSelections);

    setActiveDialog({
      type: 'teacher',
      day: dayKey,
      slotId,
      subjects: splitSubjects,
    });
  };

  const handleAssignRoom = (day: DayOfWeek, slotId: string, subject: Subject) => {
    console.log('slotId====', slotId);
    const dayKey = day as DayOfWeek;
    const slot = slots[dayKey]?.find((_, index) => index === parseInt(slotId, 10));
    if (!slot || !slot.subjects) return;

    // Build initial state with lazy splitting
    const splitSubjects: SlotSubject[] = [];
    const initialSelections: Record<string, string> = {};

    slot.subjects.forEach((sub) => {
      if (sub.name.includes('|')) {
        const parts = sub.name.split('|').map((s) => s.trim());
        parts.forEach((partName, idx) => {
          const isAlreadySplitId = sub.id.includes('_part_');
          const newId = isAlreadySplitId ? sub.id : `${sub.id}_part_${idx}`;

          splitSubjects.push({
            ...sub,
            id: newId,
            name: partName,
            teacherId: idx === 0 ? sub.teacherId : undefined,
            teacherName: idx === 0 ? sub.teacherName : undefined,
            roomId: idx === 0 ? sub.roomId : undefined,
            roomName: idx === 0 ? sub.roomName : undefined,
          });

          if (idx === 0 && sub.roomId) {
            initialSelections[newId] = sub.roomId;
          }
        });
      } else {
        splitSubjects.push(sub);
        if (sub.roomId) initialSelections[sub.id] = sub.roomId;
      }
    });

    setSelectedIds(initialSelections);

    setActiveDialog({
      type: 'room',
      day: dayKey,
      slotId,
      subjects: splitSubjects,
    });
  };

  const handleDialogClose = () => {
    setActiveDialog(null);
    setSelectedIds({});
  };

  const handleSaveAssignment = async () => {
    if (!activeDialog) return;
    const list = activeDialog.type === 'teacher' ? MOCK_TEACHERS : rooms?.items || [];

    const { type, day, slotId, subjects: dialogSubjects } = activeDialog;
    const dayKey = day as DayOfWeek;
    const slotIndex = parseInt(slotId, 10);
    const newWeeklySlots = { ...slots };

    if (newWeeklySlots[dayKey]) {
      newWeeklySlots[dayKey] = newWeeklySlots[dayKey].map((slot, index) => {
        if (index === slotIndex) {
          // Use dialogSubjects as the source of truth for the structure (since we lazily split)
          const updatedSubjects = dialogSubjects.map((sub) => {
            const selectedId = selectedIds[sub.id];
            const selectedItem = list.find((item: any) => item.id === selectedId);
            const selectedName = selectedItem ? selectedItem.name : undefined;
            const selectedRoomName = selectedItem ? (selectedItem as any).roomName : undefined;

            if (type === 'teacher') {
              return {
                ...sub,
                teacherId: selectedId || undefined,
                teacherName: selectedName || undefined,
              };
            }
            return {
              ...sub,
              roomId: selectedId || undefined,
              roomName: selectedRoomName || selectedName || undefined,
            };
          });

          // Update _attachedSubject if it matches single subject (for consistency)
          let updatedAttached = slot._attachedSubject;
          // If split, single check might fail, which is intended as we move to array
          if (updatedSubjects.length === 1 && updatedAttached) {
            const single = updatedSubjects[0];
            if (type === 'teacher') {
              updatedAttached = {
                ...updatedAttached,
                teacherId: single.teacherId,
                teacherName: single.teacherName,
              };
            } else {
              updatedAttached = {
                ...updatedAttached,
                roomId: single.roomId,
                roomName: single.roomName,
              };
            }
          }

          return {
            ...slot,
            subjects: updatedSubjects,
            _attachedSubject: updatedAttached,
          };
        }
        return slot;
      });

      // --- Call assign-rooms API when type is 'room' ---
      if (type === 'room' && standardId && divisionId) {
        const currentSlot = slots[dayKey]?.[slotIndex];
        if (currentSlot) {
          const dayNameMap: Record<DayOfWeek, string> = {
            MONDAY: 'Monday',
            TUESDAY: 'Tuesday',
            WEDNESDAY: 'Wednesday',
            THURSDAY: 'Thursday',
            FRIDAY: 'Friday',
            SATURDAY: 'Saturday',
          };

          const subjectsPayload = dialogSubjects
            .map((sub) => {
              const selectedRoomId = selectedIds[sub.id];
              // Strip _part_ suffix to get the real subjectId
              const rawSubjectId = sub.id.includes('_part_') ? sub.id.split('_part_')[0] : sub.id;
              return selectedRoomId ? { subjectId: rawSubjectId, roomId: selectedRoomId } : null;
            })
            .filter(Boolean) as { subjectId: string; roomId: string }[];

          if (subjectsPayload.length > 0) {
            try {
              await assignRooms({
                standardId,
                divisionId,
                day: dayNameMap[dayKey],
                startTime: currentSlot.startTime,
                endTime: currentSlot.endTime,
                subjectType: currentSlot.subjectType ?? 0,
                electiveGroupId: currentSlot.electiveGroupId ?? null,
                subjects: subjectsPayload,
              }).unwrap();
            } catch {
              // API errors are handled globally; local state is still updated
            }
          }
        }
      }

      onChange(newWeeklySlots);
    }

    handleDialogClose();
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4CAF50', '#8BC34A', '#CDDC39'], // Green-ish theme
    });
  };

  // --- Calculate Subject Counts ---
  const getSubjectCounts = () => {
    const counts: Record<string, number> = {};
    Object.values(slots).forEach((daySlots) => {
      daySlots.forEach((slot) => {
        // Count from the new 'subjects' array
        // if (slot.subjects && slot.subjects.length > 0) {
        //   slot.subjects.forEach((sub) => {
        //     // If split ids, we might want to map back to original 'parent' id?
        //     const originalId = sub.id.split('_part_')[0];
        //     counts[originalId] = (counts[originalId] || 0) + 1;
        //   });
        // }
        // Fallback or legacy check

        const subjectKey = slot.electiveGroupId || slot?.subjects?.[0]?.id; // Prioritize elective group, then new subjects array, then old subjectId
        if (subjectKey) {
          counts[subjectKey] = (counts[subjectKey] || 0) + 1;
        }
      });
    });
    return counts;
  };
  const {
    data: rooms,
    isLoading: isRoomsLoading,
    isFetching: isRoomsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomsQuery,
  });

  const [assignRooms, { isLoading: isAssigningRooms }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAssignRoomsMutation,
  });
  const subjectCounts = getSubjectCounts();

  const content = (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Left Panel: Palette */}
      {!readOnly && (
        <SubjectPalette
          placedCounts={subjectCounts}
          selectedClass={selectedClass}
          selectedDivision={selectedDivision}
          subjects={subjects}
        />
      )}

      {/* Main Area */}
      {slots ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            overflow: 'auto',
            position: 'relative',
            bgcolor: 'background.paper',
            height: '100%',
            mt: 1,
          }}
        >
          {/* Time Column (Sticky) */}
          <Paper
            elevation={1}
            sx={{
              width: '80px',
              flexShrink: 0,
              bgcolor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider',
              position: 'sticky',
              left: 0,
              zIndex: 5,
              pt: '40px', // Header offset
              borderRadius: 0,
              height: '100%',
            }}
          >
            {timelineStamps.map((time) => (
              <Box
                key={time}
                sx={{
                  height: '50px', // var(--slot-height-30)
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  pr: 1.5,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    width: '6px',
                    height: '1px',
                    bgcolor: 'divider',
                  },
                }}
              >
                {time}
              </Box>
            ))}
          </Paper>

          {/* Days Grid */}
          <Box sx={{ display: 'flex', flex: 1, width: '100%', gap: 0.5 }}>
            {(Object.keys(slots) as DayOfWeek[]).map((day) => (
              <DayColumn
                key={day}
                day={day}
                slots={slots[day]}
                onDropSubject={handleDropSubject}
                onRemoveSubject={handleRemoveSubject}
                onAssignTeacher={handleAssignTeacher}
                onAssignRoom={handleAssignRoom}
                readOnly={readOnly}
              />
            ))}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            mt: 2,
            mb: 2,
          }}
        >
          <Button
            startIcon={<Add />}
            size="small"
            variant="contained"
            onClick={() => {
              createSlotsDialog.onTrue();
            }}
          >
            Create Slots
          </Button>
        </Box>
      )}

      {/* Assignment Dialog */}
      <CustomDialog
        open={!!activeDialog}
        handleClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
        title={activeDialog?.type === 'teacher' ? `Assign Teacher` : `Assign Room`}
      >
        <DialogContent sx={{ pb: 2 }}>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeDialog?.subjects && activeDialog.subjects.length > 0 ? (
              activeDialog.subjects.map((sub) => (
                <Box key={sub.id}>
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    For {sub.name} :
                  </Typography>
                  <Autocomplete
                    fullWidth
                    size="small"
                    options={activeDialog?.type === 'teacher' ? MOCK_TEACHERS : rooms?.items || []}
                    getOptionLabel={
                      activeDialog?.type === 'teacher'
                        ? (option: any) => option?.fullName || ''
                        : (option: any) => option?.roomName || ''
                    }
                    value={
                      (activeDialog?.type === 'teacher' ? MOCK_TEACHERS : rooms?.items || []).find(
                        (item: any) => item.id === selectedIds[sub.id]
                      ) || null
                    }
                    isOptionEqualToValue={(option, value) => option?.id === value?.id}
                    onChange={(event, value) => {
                      setSelectedIds((prev) => ({
                        ...prev,
                        [sub.id]: value?.id || '',
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label={`Select ${activeDialog?.type}`} />
                    )}
                  />
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
            onClick={handleDialogClose}
            size="small"
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAssignment}
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            size="small"
            disabled={isAssigningRooms && activeDialog?.type === 'room'}
            loading={isAssigningRooms && activeDialog?.type === 'room'}
          >
            Submit
          </Button>
        </DialogActions>
      </CustomDialog>
      <CustomDialog
        open={createSlotsDialog.value}
        handleClose={(e, isSubmit) => {
          createSlotsDialog.onFalse();
        }}
        title="Create Slots"
        maxWidth="md"
      >
        <CreateSlotsForm handleClose={() => createSlotsDialog.onFalse()} />
      </CustomDialog>
    </Box>
  );

  return <DndProvider backend={HTML5Backend}>{content}</DndProvider>;
};

export default TimetableBoard;

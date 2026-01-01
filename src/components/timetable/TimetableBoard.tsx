import confetti from 'canvas-confetti';
import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Box,
  List,
  Paper,
  Dialog,
  Button,
  ListItem,
  DialogTitle,
  ListItemText,
  DialogContent,
  DialogActions,
  ListItemButton,
} from '@mui/material';

import { SlotType } from './types';
import DayColumn from './DayColumn';
import SubjectPalette from './SubjectPalette';
import { MOCK_ROOMS, MOCK_TEACHERS, generateTimelineStamps } from './utils';

import type { Subject, TimeSlot, DayOfWeek } from './types';

export interface TimetableBoardProps {
  slots: Record<DayOfWeek, TimeSlot[]>;
  onChange: (newSlots: Record<DayOfWeek, TimeSlot[]>) => void;
  subjects: Subject[];
  readOnly?: boolean;
}

const TimetableBoard: React.FC<TimetableBoardProps> = ({
  slots,
  onChange,
  subjects,
  readOnly = false,
}) => {
  const [timelineStamps] = useState(generateTimelineStamps());

  // Dialog State
  const [activeDialog, setActiveDialog] = useState<{
    type: 'teacher' | 'room';
    slotId: string;
    subjectId: string; // To know which subject in the slot we are editing
  } | null>(null);

  // Force re-render

  // --- Actions ---

  const handleDropSubject = (
    dayKey: string,
    slotId: string,
    subject: Subject,
    fromSlotId?: string
  ) => {
    if (readOnly) return;

    // 1. Update State
    // Create a deep(er) clone of the necessary parts or just map properly
    const newWeeklySlots = { ...slots };

    // -- HANDLE MOVE (Remove from old slot) --
    if (fromSlotId) {
      const [fromDayStr] = fromSlotId.split('-'); // e.g., "MONDAY-2"
      const fromDay = fromDayStr as DayOfWeek;

      if (newWeeklySlots[fromDay]) {
        newWeeklySlots[fromDay] = newWeeklySlots[fromDay].map((s) => {
          if (s.id === fromSlotId) {
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
    const slotIndex = daySlots.findIndex((s) => s.id === slotId);

    if (slotIndex !== -1) {
      // Map Subject to SlotSubject
      const newSlotSubject = {
        id: subject.id,
        name: subject.name,
        color: subject.color,
        teacherId: subject.teacherId,
        teacherName: subject.teacherName,
        roomId: subject.roomId,
        roomName: subject.roomName,
      };

      daySlots[slotIndex] = {
        ...daySlots[slotIndex],
        subjectId: subject.id,
        _attachedSubject: subject,
        subjects: [newSlotSubject], // Set as array
        subjectType: 0, // Assume simple subject move is type 0 (Core) unless we carry extra metadata
        electiveGroupId: null,
        electiveGroupName: null,
      } as any;

      newWeeklySlots[dayKey as DayOfWeek] = daySlots;
    } else {
      return; // Should not happen
    }

    // 2. Check for Day Completion (Gamification) - Check BOTH days if moved?
    // For simplicity, just checking current day of drop.
    const lectureSlots = daySlots.filter((s) => s.type === SlotType.LECTURE);
    const newFilledSlots = lectureSlots.filter((s) => !!s.subjectId);

    if (newFilledSlots.length === lectureSlots.length) {
      triggerConfetti();
    }

    onChange(newWeeklySlots);
  };

  const handleRemoveSubject = (slotId: string, subject: Subject) => {
    if (readOnly) return;
    const dayKey = slotId.split('-')[0] as DayOfWeek;
    const newWeeklySlots = { ...slots };

    if (newWeeklySlots[dayKey]) {
      newWeeklySlots[dayKey] = newWeeklySlots[dayKey].map((s) => {
        if (s.id === slotId) {
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

  const handleAssignTeacher = (slotId: string, subject: Subject) => {
    setActiveDialog({
      type: 'teacher',
      slotId,
      subjectId: subject.id,
    });
  };

  const handleAssignRoom = (slotId: string, subject: Subject) => {
    setActiveDialog({
      type: 'room',
      slotId,
      subjectId: subject.id,
    });
  };

  const handleDialogClose = () => {
    setActiveDialog(null);
  };

  const handleDialogConfirm = (selectedId: string, selectedName: string) => {
    if (!activeDialog) return;

    const { type, slotId, subjectId } = activeDialog;
    const dayKey = slotId.split('-')[0] as DayOfWeek;
    const newWeeklySlots = { ...slots };

    if (newWeeklySlots[dayKey]) {
      newWeeklySlots[dayKey] = newWeeklySlots[dayKey].map((slot) => {
        if (slot.id === slotId) {
          // Find the subject to update within the slot (handling both legacy and new array)
          let updatedSubjects = [...(slot.subjects || [])];

          // If subjects array is empty but we have subject ID (legacy), create one
          if (updatedSubjects.length === 0 && slot.subjectId) {
            // Re-construct temp subject so we can edit it
            if (slot._attachedSubject) {
              updatedSubjects.push({
                id: slot.subjectId,
                name: slot._attachedSubject.name,
                color: slot._attachedSubject.color,
                teacherId: slot._attachedSubject.teacherId,
                teacherName: slot._attachedSubject.teacherName,
                roomId: slot._attachedSubject.roomId,
                roomName: slot._attachedSubject.roomName,
              });
            }
          }

          updatedSubjects = updatedSubjects.map((sub) => {
            if (sub.id === subjectId) {
              if (type === 'teacher') {
                return {
                  ...sub,
                  teacherId: selectedId,
                  teacherName: selectedName,
                };
              }
              return { ...sub, roomId: selectedId, roomName: selectedName };
            }
            return sub;
          });

          // Also update attachedSubject if it matches (for legacy/drag display consistency)
          let updatedAttachedSubject = slot._attachedSubject;
          if (updatedAttachedSubject && updatedAttachedSubject.id === subjectId) {
            if (type === 'teacher') {
              updatedAttachedSubject = {
                ...updatedAttachedSubject,
                teacherId: selectedId,
                teacherName: selectedName,
              };
            } else {
              updatedAttachedSubject = {
                ...updatedAttachedSubject,
                roomId: selectedId,
                roomName: selectedName,
              };
            }
          }

          return {
            ...slot,
            subjects: updatedSubjects,
            _attachedSubject: updatedAttachedSubject,
          };
        }
        return slot;
      });
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
        if (slot.subjects && slot.subjects.length > 0) {
          slot.subjects.forEach((sub) => {
            counts[sub.id] = (counts[sub.id] || 0) + 1;
          });
        }
        // Fallback or legacy check (if subjects array is empty but subjectId exists)
        else if (slot.subjectId) {
          counts[slot.subjectId] = (counts[slot.subjectId] || 0) + 1;
        }
      });
    });
    return counts;
  };

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
      {!readOnly && <SubjectPalette subjects={subjects} placedCounts={subjectCounts} />}

      {/* Main Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          overflow: 'auto',
          position: 'relative',
          bgcolor: 'background.paper',
          height: '100%',
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
        <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>
          {(Object.keys(slots) as DayOfWeek[]).map((day) => (
            <DayColumn
              key={day}
              day={day}
              slots={slots[day]}
              onDropSubject={handleDropSubject}
              onRemoveSubject={handleRemoveSubject}
              onAssignTeacher={handleAssignTeacher}
              onAssignRoom={handleAssignRoom}
            />
          ))}
        </Box>
      </Box>
      {/* Assignment Dialog */}
      <Dialog open={!!activeDialog} onClose={handleDialogClose}>
        <DialogTitle>
          {activeDialog?.type === 'teacher' ? 'Assign Teacher' : 'Assign Room'}
        </DialogTitle>
        <DialogContent>
          <List sx={{ pt: 0, minWidth: '250px' }}>
            {(activeDialog?.type === 'teacher' ? MOCK_TEACHERS : MOCK_ROOMS).map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton onClick={() => handleDialogConfirm(item.id, item.name)}>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return <DndProvider backend={HTML5Backend}>{content}</DndProvider>;
};

export default TimetableBoard;

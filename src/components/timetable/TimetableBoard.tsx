import confetti from 'canvas-confetti';
import { DndProvider } from 'react-dnd';
import { Add } from '@mui/icons-material';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Box, Paper, Alert, Button, AlertTitle, Typography } from '@mui/material';
import CreateSlotsForm from 'src/screens/academic/timetable-schedule-management/settings/components/lectureSlots/createSlotsForm';

import { SlotType } from './types';
import DayColumn from './DayColumn';
import CustomDialog from '../customDialog';
import SubjectPalette from './SubjectPalette';
import AssignRoomDialog from './AssignRoomDialog';
import AssignTeacherDialog from './AssignTeacherDialog';
import { useDivisionRoomDefaults } from './useDivisionRoomDefaults';
import {
  SLOT_HEIGHT_BASE,
  TIMELINE_END_HOUR,
  parseTimeToMinutes,
  TIMELINE_START_HOUR,
  generateTimelineStamps,
} from './utils';

import type { RoomAssignment } from './AssignRoomDialog';
import type { TeacherAssignment } from './AssignTeacherDialog';
import type { Subject, TimeSlot, DayOfWeek, SlotSubject } from './types';
import type { TimetableValidationIssue } from './timetableValidationIssues';

export interface TimetableBoardProps {
  slots: Record<DayOfWeek, TimeSlot[]>;
  onChange: (newSlots: Record<DayOfWeek, TimeSlot[]>) => void;
  subjects: Subject[];
  readOnly?: boolean;
  previewMode?: boolean;
  selectedClass: string;
  selectedDivision: string;
  standardId?: string;
  divisionId?: string;
  timetableStatus?: number | null;
  validateSlots?: (
    slots: Record<DayOfWeek, TimeSlot[]>,
    source: 'teacher' | 'room'
  ) => Promise<TimetableValidationIssue[]>;
}

const TimetableBoard: React.FC<TimetableBoardProps> = ({
  slots,
  onChange,
  subjects,
  readOnly = false,
  previewMode = false,
  selectedClass,
  selectedDivision,
  standardId = '',
  divisionId = '',
  timetableStatus,
  validateSlots,
}) => {
  useDivisionRoomDefaults({ slots, onChange, divisionId, readOnly });

  const { timelineStartHour, timelineEndHour, timelineStamps } = useMemo(() => {
    let minMin = Infinity;
    let maxMin = 0;
    Object.values(slots).forEach((daySlots) => {
      daySlots.forEach((slot) => {
        if (!slot.startTime || !slot.endTime) return;
        const start = parseTimeToMinutes(slot.startTime);
        const end = parseTimeToMinutes(slot.endTime);
        if (start < minMin) minMin = start;
        if (end > maxMin) maxMin = end;
      });
    });

    if (minMin === Infinity || maxMin === 0) {
      return {
        timelineStartHour: TIMELINE_START_HOUR,
        timelineEndHour: TIMELINE_END_HOUR,
        timelineStamps: generateTimelineStamps(),
      };
    }

    const startHour = Math.floor(minMin / 60);
    // +30 min buffer after last slot, then round up to next whole hour for clean labels
    const endHour = Math.ceil((maxMin + 30) / 60);

    return {
      timelineStartHour: startHour,
      timelineEndHour: endHour,
      timelineStamps: generateTimelineStamps(startHour, endHour),
    };
  }, [slots]);

  const previewSlotHeight = previewMode ? 84 : SLOT_HEIGHT_BASE;
  const pixelsPerMinute = previewSlotHeight / 30;

  const createSlotsDialog = useBoolean();
  const [teacherDialog, setTeacherDialog] = useState<TeacherAssignment | null>(null);
  const [roomDialog, setRoomDialog] = useState<RoomAssignment | null>(null);
  const [isWarningDismissed, setIsWarningDismissed] = useState(false);

  // --- Actions ---

  const handleSwapSlots = (
    fromDay: DayOfWeek,
    fromSlotIndex: number,
    toDay: DayOfWeek,
    toSlotIndex: number
  ) => {
    if (readOnly) return;

    const newWeeklySlots = { ...slots };
    const fromSlot = newWeeklySlots[fromDay][fromSlotIndex];
    const toSlot = newWeeklySlots[toDay][toSlotIndex];

    const fromProps = {
      subjectId: fromSlot.subjectId,
      subjectAssignmentId: fromSlot.subjectAssignmentId,
      _attachedSubject: fromSlot._attachedSubject,
      subjects: fromSlot.subjects,
      subjectType: fromSlot.subjectType,
      electiveGroupId: fromSlot.electiveGroupId,
      electiveGroupName: fromSlot.electiveGroupName,
    };

    const toProps = {
      subjectId: toSlot.subjectId,
      subjectAssignmentId: toSlot.subjectAssignmentId,
      _attachedSubject: toSlot._attachedSubject,
      subjects: toSlot.subjects,
      subjectType: toSlot.subjectType,
      electiveGroupId: toSlot.electiveGroupId,
      electiveGroupName: toSlot.electiveGroupName,
    };

    newWeeklySlots[fromDay] = newWeeklySlots[fromDay].map((s, index) =>
      index === fromSlotIndex ? { ...s, ...toProps } : s
    );

    newWeeklySlots[toDay] = newWeeklySlots[toDay].map((s, index) =>
      index === toSlotIndex ? { ...s, ...fromProps } : s
    );

    onChange(newWeeklySlots);
  };

  const handleDropSubject = (
    dayKey: string,
    slotId: string,
    subject: Subject,
    fromSlotId?: string
  ) => {
    if (readOnly) return;

    // Guard: enforce the weekly lecture limit configured in Weekly Lectures Slots.
    // This prevents scheduling a subject that has 0 (or already exhausted) lecture slots
    // even if a drag somehow bypasses the palette's canDrag check.
    if (!fromSlotId) {
      const totalLectures = subject.totalLectures ?? 0;
      if (totalLectures === 0) return;
      const subjectKey = (subject as any).electiveGroupId || subject.subjectId;
      let currentCount = 0;
      Object.values(slots).forEach((daySlots) => {
        daySlots.forEach((slot: any) => {
          const key = slot.electiveGroupId || slot.subjectId || slot.subjects?.[0]?.subjectId;
          if (key === subjectKey) currentCount += 1;
        });
      });
      if (currentCount >= totalLectures) return;
    }

    // 1. Update State
    const newWeeklySlots = { ...slots };

    // -- HANDLE SWAP (Drag and drop over filled slot) --
    if (fromSlotId) {
      const targetSlot = newWeeklySlots[dayKey as DayOfWeek]?.[parseInt(slotId, 10)];
      const targetIsFilled =
        targetSlot && (targetSlot.subjectId || (targetSlot.subjects?.length ?? 0) > 0);

      if (targetIsFilled) {
        const [fromDayStr, fromDayIndex] = fromSlotId.split('-');
        handleSwapSlots(
          fromDayStr as DayOfWeek,
          parseInt(fromDayIndex, 10),
          dayKey as DayOfWeek,
          parseInt(slotId, 10)
        );
        return;
      }
    }

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
          subjectId: sub.subjectId,
          name: sub.subjectName,
          subjectAssignmentId: sub.subjectAssignmentId,
          color: sub.color || subject.color,
          teacherId: sub.teacherId,
          teacherName: sub.teacherName,
          roomId: sub.roomId,
          roomName: sub.roomName,
        }));
      } else {
        // --- Core subject: legacy pipe-split fallback ---
        const subjectNames = subject.name.split('|').map((s) => s.trim());
        newSlotSubjects = subjectNames.map((name, index) => ({
          subjectId:
            subjectNames.length > 1 ? `${subject.subjectId}_part_${index}` : subject.subjectId,
          subjectAssignmentId: subject.subjectAssignmentId,
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
        subjectId: subject.subjectId,
        subjectAssignmentId: subject.subjectAssignmentId,
        _attachedSubject: subject,
        subjects: newSlotSubjects,
        subjectType: isElective ? 1 : 0,
        electiveGroupId: isElective
          ? ((subject as any).electiveGroupId ?? subject.subjectId)
          : null,
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

  const handleClearDay = (day: DayOfWeek) => {
    if (readOnly) return;
    const newWeeklySlots = { ...slots };
    newWeeklySlots[day] = newWeeklySlots[day].map((slot) => {
      if (slot.type === SlotType.LECTURE) {
        return {
          ...slot,
          subjectId: null,
          _attachedSubject: undefined,
          subjects: [],
          subjectType: null,
          electiveGroupId: null,
          electiveGroupName: null,
        } as any;
      }
      return slot;
    });
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

  const handleAssignTeacher = (day: DayOfWeek, slotId: string, _subject: Subject) => {
    const slot = slots[day]?.find((_, index) => index === parseInt(slotId, 10));
    if (!slot?.subjects) return;
    setTeacherDialog({ day, slotIndex: parseInt(slotId, 10), subjects: slot.subjects });
  };

  const handleAssignRoom = (day: DayOfWeek, slotId: string, _subject: Subject) => {
    const slot = slots[day]?.find((_, index) => index === parseInt(slotId, 10));
    if (!slot?.subjects) return;
    setRoomDialog({ day, slotIndex: parseInt(slotId, 10), subjects: slot.subjects });
  };

  const handleTeacherSave = async (
    day: DayOfWeek,
    slotIndex: number,
    updatedSubjects: SlotSubject[],
    bulkOptions?: {
      applyTeacherToAllSubjectSlots: Record<string, boolean>;
    }
  ): Promise<TimetableValidationIssue[]> => {
    const newWeeklySlots = { ...slots };

    // Update current slot
    newWeeklySlots[day] = newWeeklySlots[day].map((slot, index) => {
      if (index !== slotIndex) return slot;
      const single = updatedSubjects.length === 1 ? updatedSubjects[0] : null;
      const updatedAttached =
        single && slot._attachedSubject
          ? {
              ...slot._attachedSubject,
              teacherId: single.teacherId,
              teacherName: single.teacherName,
            }
          : slot._attachedSubject;
      return { ...slot, subjects: updatedSubjects, _attachedSubject: updatedAttached };
    });

    // Apply bulk options
    if (bulkOptions?.applyTeacherToAllSubjectSlots) {
      const { applyTeacherToAllSubjectSlots } = bulkOptions;

      updatedSubjects.forEach((sub) => {
        const rawSubId = sub.subjectId.includes('_part_')
          ? sub.subjectId.split('_part_')[0]
          : sub.subjectId;

        if (applyTeacherToAllSubjectSlots[sub.subjectId]) {
          Object.keys(newWeeklySlots).forEach((d) => {
            const dayKey = d as DayOfWeek;
            newWeeklySlots[dayKey] = newWeeklySlots[dayKey].map((slot) => {
              if (slot.type !== 'LECTURE' || !slot.subjects || slot.subjects.length === 0) {
                return slot;
              }

              let subjectsChanged = false;
              const updatedSlotSubjects = slot.subjects.map((slotSub) => {
                const slotSubRawId = slotSub.subjectId.includes('_part_')
                  ? slotSub.subjectId.split('_part_')[0]
                  : slotSub.subjectId;

                if (slotSubRawId === rawSubId) {
                  subjectsChanged = true;
                  return {
                    ...slotSub,
                    teacherId: sub.teacherId,
                    teacherName: sub.teacherName,
                  };
                }
                return slotSub;
              });

              if (subjectsChanged) {
                const single = updatedSlotSubjects.length === 1 ? updatedSlotSubjects[0] : null;
                const updatedAttached =
                  single && slot._attachedSubject
                    ? {
                        ...slot._attachedSubject,
                        teacherId: single.teacherId,
                        teacherName: single.teacherName,
                      }
                    : slot._attachedSubject;
                return {
                  ...slot,
                  subjects: updatedSlotSubjects,
                  _attachedSubject: updatedAttached,
                };
              }

              return slot;
            });
          });
        }
      });
    }

    if (validateSlots) {
      const issues = await validateSlots(newWeeklySlots, 'teacher');
      if (issues.length > 0) {
        return issues;
      }
    }

    onChange(newWeeklySlots);
    return [];
  };

  const handleRoomSave = async (
    day: DayOfWeek,
    slotIndex: number,
    updatedSubjects: SlotSubject[],
    bulkOptions?: {
      applyToAllSlots: Record<string, boolean>;
      applyToAllSubjectSlots: Record<string, boolean>;
    }
  ): Promise<TimetableValidationIssue[]> => {
    const newWeeklySlots = { ...slots };

    // Update current slot
    newWeeklySlots[day] = newWeeklySlots[day].map((slot, index) => {
      if (index !== slotIndex) return slot;
      const single = updatedSubjects.length === 1 ? updatedSubjects[0] : null;
      const updatedAttached =
        single && slot._attachedSubject
          ? { ...slot._attachedSubject, roomId: single.roomId, roomName: single.roomName }
          : slot._attachedSubject;
      return { ...slot, subjects: updatedSubjects, _attachedSubject: updatedAttached };
    });

    // Apply bulk options
    if (bulkOptions) {
      const { applyToAllSlots, applyToAllSubjectSlots } = bulkOptions;

      updatedSubjects.forEach((sub) => {
        const rawSubId = sub.subjectId.includes('_part_')
          ? sub.subjectId.split('_part_')[0]
          : sub.subjectId;

        const shouldApplyToAll = !!applyToAllSlots[sub.subjectId];
        const shouldApplyToAllSubject = !!applyToAllSubjectSlots[sub.subjectId];

        if (shouldApplyToAll || shouldApplyToAllSubject) {
          Object.keys(newWeeklySlots).forEach((d) => {
            const dayKey = d as DayOfWeek;
            newWeeklySlots[dayKey] = newWeeklySlots[dayKey].map((slot) => {
              if (slot.type !== 'LECTURE' || !slot.subjects || slot.subjects.length === 0) {
                return slot;
              }

              let subjectsChanged = false;
              const updatedSlotSubjects = slot.subjects.map((slotSub) => {
                const slotSubRawId = slotSub.subjectId.includes('_part_')
                  ? slotSub.subjectId.split('_part_')[0]
                  : slotSub.subjectId;

                const isSameSubject = slotSubRawId === rawSubId;
                const match =
                  (shouldApplyToAll && (slot.subjects?.length === 1 || isSameSubject)) ||
                  (shouldApplyToAllSubject && isSameSubject);

                if (match) {
                  subjectsChanged = true;
                  return {
                    ...slotSub,
                    roomId: sub.roomId,
                    roomName: sub.roomName,
                  };
                }
                return slotSub;
              });

              if (subjectsChanged) {
                const single = updatedSlotSubjects.length === 1 ? updatedSlotSubjects[0] : null;
                const updatedAttached =
                  single && slot._attachedSubject
                    ? { ...slot._attachedSubject, roomId: single.roomId, roomName: single.roomName }
                    : slot._attachedSubject;
                return {
                  ...slot,
                  subjects: updatedSlotSubjects,
                  _attachedSubject: updatedAttached,
                };
              }

              return slot;
            });
          });
        }
      });
    }

    if (validateSlots) {
      const issues = await validateSlots(newWeeklySlots, 'room');
      if (issues.length > 0) {
        return issues;
      }
    }

    onChange(newWeeklySlots);
    return [];
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
  const subjectCounts = (() => {
    const counts: Record<string, number> = {};
    Object.values(slots).forEach((daySlots) => {
      daySlots.forEach((slot) => {
        const subjectKey = slot.electiveGroupId || slot.subjectId || slot.subjects?.[0]?.subjectId;
        if (subjectKey) counts[subjectKey] = (counts[subjectKey] || 0) + 1;
      });
    });
    return counts;
  })();

  // --- Conflict Detection ---
  const conflicts = useMemo(() => {
    const groupedConflicts = new Map<string, string[]>();

    (Object.keys(slots) as DayOfWeek[]).forEach((day) => {
      const dayFormatted = day.charAt(0) + day.slice(1).toLowerCase();
      slots[day].forEach((slot) => {
        if (!slot.subjects || slot.subjects.length < 2) return;

        // Teacher double-booking within the same time slot
        const teacherIds = slot.subjects.map((s) => s.teacherId).filter(Boolean);
        const seenTeachers = new Set<string>();
        teacherIds.forEach((id) => {
          if (id && seenTeachers.has(id)) {
            const conflictKey = `Same teacher double-booked at ${slot.startTime}–${slot.endTime}`;
            const days = groupedConflicts.get(conflictKey) || [];
            if (!days.includes(dayFormatted)) {
              days.push(dayFormatted);
              groupedConflicts.set(conflictKey, days);
            }
          } else if (id) {
            seenTeachers.add(id);
          }
        });

        // Room double-booking within the same time slot
        const roomIds = slot.subjects.map((s) => s.roomId).filter(Boolean);
        const seenRooms = new Set<string>();
        roomIds.forEach((id) => {
          if (id && seenRooms.has(id)) {
            const conflictKey = `Same room double-booked at ${slot.startTime}–${slot.endTime}`;
            const days = groupedConflicts.get(conflictKey) || [];
            if (!days.includes(dayFormatted)) {
              days.push(dayFormatted);
              groupedConflicts.set(conflictKey, days);
            }
          } else if (id) {
            seenRooms.add(id);
          }
        });
      });
    });

    const warnings: string[] = [];
    groupedConflicts.forEach((days, conflictKey) => {
      const dayAbbrevMap: Record<string, string> = {
        Monday: 'Mon',
        Tuesday: 'Tue',
        Wednesday: 'Wed',
        Thursday: 'Thu',
        Friday: 'Fri',
        Saturday: 'Sat',
        Sunday: 'Sun',
      };

      const isConsecutiveAllWeek =
        days.length === 6 &&
        days.includes('Monday') &&
        days.includes('Tuesday') &&
        days.includes('Wednesday') &&
        days.includes('Thursday') &&
        days.includes('Friday') &&
        days.includes('Saturday');

      const isConsecutiveFiveWeek =
        days.length === 5 &&
        days.includes('Monday') &&
        days.includes('Tuesday') &&
        days.includes('Wednesday') &&
        days.includes('Thursday') &&
        days.includes('Friday');

      let daysStr = '';
      if (isConsecutiveAllWeek) {
        daysStr = 'Mon - Sat';
      } else if (isConsecutiveFiveWeek) {
        daysStr = 'Mon - Fri';
      } else {
        daysStr = days.map((d) => dayAbbrevMap[d] || d).join(', ');
      }

      warnings.push(`${daysStr}: ${conflictKey}`);
    });

    return warnings;
  }, [slots]);

  const conflictsKey = useMemo(() => conflicts.join('|'), [conflicts]);
  React.useEffect(() => {
    setIsWarningDismissed(false);
  }, [conflictsKey]);

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
          conflicts={conflicts}
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
            elevation={0}
            sx={{
              width: '72px',
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
            {timelineStamps.map((time) => {
              const isHour = time.endsWith(':00');
              return (
                <Box
                  key={time}
                  sx={{
                    height: `${previewSlotHeight}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    pr: 1.5,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: isHour ? '10px' : '5px',
                      height: '1px',
                      bgcolor: isHour ? 'text.disabled' : 'divider',
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      fontSize: isHour ? '0.72rem' : '0.65rem',
                      fontWeight: isHour ? 700 : 400,
                      color: isHour ? 'text.secondary' : 'text.disabled',
                      letterSpacing: isHour ? '-0.02em' : 0,
                    }}
                  >
                    {time}
                  </Box>
                </Box>
              );
            })}
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
                onClearDay={handleClearDay}
                readOnly={readOnly}
                previewMode={previewMode}
                timelineStartHour={timelineStartHour}
                timelineEndHour={timelineEndHour}
                slotHeightBase={previewSlotHeight}
                pixelsPerMinute={pixelsPerMinute}
              />
            ))}
          </Box>
        </Box>
      ) : !readOnly ? (
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
      ) : null}

      <AssignTeacherDialog
        open={teacherDialog}
        slots={slots}
        standardId={standardId}
        divisionId={divisionId}
        timetableStatus={timetableStatus}
        onClose={() => setTeacherDialog(null)}
        onSave={handleTeacherSave}
      />
      <AssignRoomDialog
        open={roomDialog}
        slots={slots}
        standardId={standardId}
        divisionId={divisionId}
        timetableStatus={timetableStatus}
        onClose={() => setRoomDialog(null)}
        onSave={handleRoomSave}
      />
      <CustomDialog
        open={createSlotsDialog.value}
        handleClose={() => createSlotsDialog.onFalse()}
        title="Create Slots"
        maxWidth="md"
      >
        <CreateSlotsForm handleClose={() => createSlotsDialog.onFalse()} />
      </CustomDialog>
    </Box>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      {conflicts.length > 0 && !readOnly && !isWarningDismissed && (
        <Alert
          severity="warning"
          sx={{ mb: 1, borderRadius: 1 }}
          onClose={() => {
            setIsWarningDismissed(true);
          }}
        >
          <AlertTitle sx={{ fontWeight: 700 }}>Scheduling Conflicts Detected</AlertTitle>
          {conflicts.map((msg, i) => (
            <Typography key={i} variant="body2" sx={{ lineHeight: 1.8 }}>
              • {msg}
            </Typography>
          ))}
        </Alert>
      )}
      {content}
    </DndProvider>
  );
};

export default TimetableBoard;

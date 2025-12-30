// eslint-disable-next-line import/no-extraneous-dependencies
import confetti from 'canvas-confetti';
// eslint-disable-next-line import/no-extraneous-dependencies
import React, { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { DndProvider } from 'react-dnd';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Box, Paper } from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
import { HTML5Backend } from 'react-dnd-html5-backend';

import { SlotType } from './types';
import DayColumn from './DayColumn';
import SubjectPalette from './SubjectPalette';
import { generateTimelineStamps } from './utils';

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
      daySlots[slotIndex] = {
        ...daySlots[slotIndex],
        subjectId: subject.id,
        _attachedSubject: subject,
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

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4CAF50', '#8BC34A', '#CDDC39'], // Green-ish theme
    });
  };

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
      {!readOnly && <SubjectPalette subjects={subjects} />}

      {/* Main Area */}
      {/* <Scrollbar
        sx={{ height: '100%', overflow: 'auto', '& .simplebar-content': { height: '100%' } }}
      > */}
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
            <DayColumn key={day} day={day} slots={slots[day]} onDropSubject={handleDropSubject} />
          ))}
        </Box>
      </Box>
      {/* </Scrollbar> */}
    </Box>
  );

  return <DndProvider backend={HTML5Backend}>{content}</DndProvider>;
};

export default TimetableBoard;

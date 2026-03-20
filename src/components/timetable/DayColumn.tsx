import React, { useMemo } from 'react';
import { Box, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import TimetableSlot from './TimetableSlot';
import {
  TIMELINE_END_HOUR,
  TIMELINE_START_HOUR,
  MINUTE_HEIGHT_RATIO as PIXELS_PER_MINUTE,
} from './utils';

import type { Subject, TimeSlot, DayOfWeek } from './types';

interface DayColumnProps {
  day: DayOfWeek;
  slots: TimeSlot[];
  onDropSubject: (dayIndex: string, slotId: string, subject: Subject, fromSlotId?: string) => void;
  onRemoveSubject: (slotId: string, subject: Subject) => void;
  onAssignTeacher: (slotId: string, subject: Subject) => void;
  onAssignRoom: (slotId: string, subject: Subject) => void;
  readOnly?: boolean;
}

const DayColumn: React.FC<DayColumnProps> = ({
  day,
  slots,
  onDropSubject,
  onRemoveSubject,
  onAssignTeacher,
  onAssignRoom,
  readOnly = false,
}) => {
  const theme = useTheme();
  const dayHeight = (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * 60 * PIXELS_PER_MINUTE;

  const filledSlots = useMemo(() => slots.filter((s) => !!s.subjectId).length, [slots]);
  const totalLectureSlots = useMemo(
    () => slots.filter((s) => s.type === 'LECTURE').length,
    [slots]
  );
  const isComplete = totalLectureSlots > 0 && filledSlots === totalLectureSlots;
  const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() === day;

  return (
    <Box
      sx={{
        flex: 1,
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '140px',
      }}
    >
      <Box
        sx={{
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: '0.9rem',
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 4,
          color: isToday ? 'primary.main' : 'text.primary',
        }}
      >
        {day}
        <Chip
          label={`${filledSlots}/${totalLectureSlots}`}
          size="small"
          color={isComplete ? 'success' : 'default'}
          variant={isComplete ? 'filled' : 'outlined'}
          sx={{ ml: 1, height: '20px', fontSize: '0.7rem' }}
        />
      </Box>
      <Box
        sx={{
          position: 'relative',
          height: dayHeight,
          // backgroundImage: `linear-gradient(to bottom, ${theme.palette.grey[400]} 1px, transparent 1px)`,
          backgroundSize: '100% 50px', // 30min slots = 50px height
          backgroundColor: theme.vars.palette.background.neutral,
        }}
      >
        {slots.map((slot) => (
          <TimetableSlot
            key={slot.id}
            slot={slot}
            onDrop={(slotId, subject, fromSlotId) =>
              onDropSubject(day.toString(), slotId, subject, fromSlotId)
            }
            attachedSubject={slot._attachedSubject}
            onRemoveSubject={onRemoveSubject}
            onAssignTeacher={onAssignTeacher}
            onAssignRoom={onAssignRoom}
            readOnly={readOnly}
          />
        ))}
      </Box>
    </Box>
  );
};

export default DayColumn;

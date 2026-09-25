import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { Box, Chip, Menu, Tooltip, MenuItem, IconButton } from '@mui/material';

import { Iconify } from '../iconify';
import TimetableSlot from './TimetableSlot';
import {
  SLOT_HEIGHT_BASE,
  TIMELINE_END_HOUR,
  TIMELINE_START_HOUR,
  MINUTE_HEIGHT_RATIO as PIXELS_PER_MINUTE,
} from './utils';

import type { Subject, TimeSlot, DayOfWeek } from './types';

interface DayColumnProps {
  day: DayOfWeek;
  slots: TimeSlot[];
  onDropSubject: (dayIndex: string, slotId: string, subject: Subject, fromSlotId?: string) => void;
  onRemoveSubject: (day: DayOfWeek, slotId: number, subject: Subject) => void;
  onAssignTeacher: (day: DayOfWeek, slotId: string, subject: Subject) => void;
  onAssignRoom: (day: DayOfWeek, slotId: string, subject: Subject) => void;
  readOnly?: boolean;
  onClearDay?: (day: DayOfWeek) => void;
  timelineStartHour?: number;
  timelineEndHour?: number;
  previewMode?: boolean;
  slotHeightBase?: number;
  pixelsPerMinute?: number;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
};

const DayColumn: React.FC<DayColumnProps> = ({
  day,
  slots,
  onDropSubject,
  onRemoveSubject,
  onAssignTeacher,
  onAssignRoom,
  readOnly = false,
  onClearDay,
  timelineStartHour = TIMELINE_START_HOUR,
  timelineEndHour = TIMELINE_END_HOUR,
  previewMode = false,
  slotHeightBase = SLOT_HEIGHT_BASE,
  pixelsPerMinute = PIXELS_PER_MINUTE,
}) => {
  const theme = useTheme();
  const dayHeight = (timelineEndHour - timelineStartHour) * 60 * pixelsPerMinute;
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isLocked, setIsLocked] = useState(false);

  const filledSlots = useMemo(
    () => slots.filter((s) => s.type === 'LECTURE' && (s.subjects?.length || s.subjectId)).length,
    [slots]
  );
  const totalLectureSlots = useMemo(
    () => slots.filter((s) => s.type === 'LECTURE').length,
    [slots]
  );
  const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() === day;

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };
  const handleMenuClose = () => setMenuAnchor(null);

  return (
    <Box
      sx={{
        flex: 1,
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        minWidth: previewMode ? '180px' : '140px',
        minHeight: dayHeight + 40,
        opacity: isLocked ? 0.65 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* Day Header */}
      <Box
        sx={{
          height: '40px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 1,
          fontWeight: 700,
          fontSize: '0.78rem',
          bgcolor: isToday ? 'action.selected' : 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 4,
          color: 'text.primary',
          borderTop: '2px solid',
          borderTopColor: isToday ? 'text.secondary' : 'transparent',
          gap: 0.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <Box
            component="span"
            sx={{
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {DAY_LABELS[day]}
          </Box>
          <Chip
            label={`${filledSlots}/${totalLectureSlots}`}
            size="small"
            color="default"
            variant="outlined"
            sx={{
              height: '18px',
              fontSize: '0.62rem',
              fontWeight: 700,
              '& .MuiChip-label': { px: 0.6 },
            }}
          />
          {isLocked && (
            <Iconify
              icon="mdi:lock"
              sx={{ width: 12, height: 12, color: 'warning.main', flexShrink: 0 }}
            />
          )}
        </Box>

        {/* Per-day action button */}
        {!readOnly && (
          <>
            <Tooltip title="Day options" placement="top" arrow>
              <IconButton
                size="small"
                onClick={handleMenuOpen}
                sx={{
                  position: 'absolute',
                  right: 4,
                  width: 20,
                  height: 20,
                  opacity: 0,
                  transition: 'opacity 0.15s',
                  '.MuiBox-root:hover &': { opacity: 1 },
                  '&:hover': { bgcolor: 'action.hover' },
                  p: 0,
                }}
                className="day-col-menu-btn"
              >
                <Iconify icon="mdi:dots-vertical" sx={{ width: 14, height: 14 }} />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{ paper: { sx: { minWidth: 160, boxShadow: 'var(--shadows-8)' } } }}
            >
              <MenuItem
                dense
                onClick={() => {
                  setIsLocked((v) => !v);
                  handleMenuClose();
                }}
              >
                <Iconify
                  icon={isLocked ? 'mdi:lock-open-outline' : 'mdi:lock-outline'}
                  sx={{ mr: 1, width: 16, height: 16, color: 'warning.main' }}
                />
                {isLocked ? 'Unlock Day' : 'Lock Day'}
              </MenuItem>
              <MenuItem
                dense
                disabled={filledSlots === 0 || isLocked}
                onClick={() => {
                  if (onClearDay) onClearDay(day);
                  handleMenuClose();
                }}
                sx={{ color: 'error.main' }}
              >
                <Iconify icon="mdi:eraser-variant" sx={{ mr: 1, width: 16, height: 16 }} />
                Clear Day
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      {/* Slot area */}
      <Box
        sx={{
          position: 'relative',
          height: dayHeight,
          flexShrink: 0,
          backgroundSize: `100% ${slotHeightBase}px`,
          backgroundColor: theme.vars.palette.background.neutral,
          overflow: 'hidden',
          pointerEvents: isLocked ? 'none' : 'auto',
          '&:hover .day-col-menu-btn': { opacity: 1 },
        }}
      >
        {slots.map((slot, index) => (
          <TimetableSlot
            key={slot.id}
            slot={slot}
            onDrop={(slotId, subject, fromSlotId) =>
              onDropSubject(day, slotId, subject, fromSlotId)
            }
            attachedSubject={slot._attachedSubject}
            onRemoveSubject={onRemoveSubject}
            onAssignTeacher={onAssignTeacher}
            onAssignRoom={onAssignRoom}
            readOnly={readOnly || isLocked}
            day={day}
            index={index}
            timelineStartHour={timelineStartHour}
            pixelsPerMinute={pixelsPerMinute}
          />
        ))}
      </Box>
    </Box>
  );
};

export default DayColumn;

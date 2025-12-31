import React from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { SlotType, ItemTypes } from './types';
import { calculateSlotPosition } from './utils';

import type { Subject, TimeSlot, DragItem } from './types';

interface TimetableSlotProps {
  slot: TimeSlot;
  onDrop: (slotId: string, subject: Subject, fromSlotId?: string) => void;
  attachedSubject?: Subject | null;
}

const TimetableSlot: React.FC<TimetableSlotProps> = ({ slot, onDrop, attachedSubject }) => {
  const { top, height } = calculateSlotPosition(slot.startTime, slot.endTime);
  const isBreak = slot.type === SlotType.BREAK;
  const isFilled = !!attachedSubject;

  const theme = useTheme();

  // Drag Source Logic (Internal Drag)
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.SUBJECT,
    item: () => ({
      id: attachedSubject?.id || 'temp',
      type: ItemTypes.SUBJECT,
      subject: attachedSubject,
      fromSlotId: slot.id,
    }),
    canDrag: () => isFilled && !isBreak,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.SUBJECT,
    canDrop: () => !isBreak && !isFilled, // Can't drop on breaks or already filled slots
    drop: (item: DragItem) => {
      if (item.subject) {
        onDrop(slot.id, item.subject, item.fromSlotId);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Combined Ref
  // We need to attach both drag and drop refs to the same element
  const attachRef = (node: HTMLDivElement) => {
    drag(drop(node));
  };

  const getSx = () => {
    const baseSx: any = {
      position: 'absolute',
      top: `${top}px`,
      height: `${height}px`,
      width: '94%',
      left: '3%',
      borderRadius: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.85rem',
      transition: 'all 0.2s ease',
      overflow: 'hidden',
      textAlign: 'center',
      boxSizing: 'border-box',
      opacity: isDragging ? 0.5 : 1,
    };

    if (isBreak) {
      return {
        ...baseSx,
        bgcolor: theme.palette.grey[200], // Custom lighter red/pink
        opacity: 0.8,
        color: theme.palette.text.secondary, // Custom error text color
        fontWeight: 600,
        justifyContent: 'flex-start',
        pl: 1,
        cursor: 'not-allowed',
        borderLeft: 3,
        // borderColor: theme.palette.error.main,
        border: `1px solid ${theme.palette.grey[300]}`,
        textAlign: 'center',
      };
    }

    if (attachedSubject) {
      return {
        ...baseSx,
        backgroundColor: attachedSubject.color, // Keep original color
        border: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: 1,
        color: '#37474f', // Dark text for contrast
        fontWeight: 500,
        zIndex: 1,
        '&:hover': {
          zIndex: 3,
          boxShadow: 3,
        },
      };
    }

    // Empty Lecture Slot
    return {
      ...baseSx,
      bgcolor: isOver ? 'action.hover' : 'transparent',
      border: '1px dashed',
      borderColor: isOver ? `${theme.palette.success.light}` : `${theme.palette.grey[300]}`,
      backgroundColor: isOver
        ? `${theme.palette.success.lighter}`
        : `${theme.vars.palette.background.paper}`,
      transform: isOver ? 'scale(1.02)' : 'none',
      zIndex: isOver ? 2 : 0,
    };
  };

  return (
    <Box
      ref={attachRef}
      sx={getSx()}
      title={
        isBreak ? `${slot.breakType} Break` : attachedSubject ? attachedSubject.name : 'Empty Slot'
      }
    >
      {isBreak ? (
        <Typography variant="caption" fontWeight="bold">
          {slot.breakType} ({slot.startTime})
        </Typography>
      ) : attachedSubject ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            lineHeight: 1.2,
          }}
        >
          <Typography variant="body2" fontWeight="bold">
            {attachedSubject.name}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, mt: 0.5, fontSize: '0.7rem' }}>
            {slot.startTime} - {slot.endTime}
          </Typography>
        </Box>
      ) : isOver ? (
        <Typography variant="caption" color="primary.dark" fontWeight="bold">
          Drop Here
        </Typography>
      ) : (
        ''
      )}
    </Box>
  );
};

export default TimetableSlot;

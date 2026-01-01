import React, { useState } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Menu,
  Dialog,
  Button,
  Tooltip,
  MenuItem,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

import { SlotType, ItemTypes } from './types';
import { calculateSlotPosition } from './utils';

import type { Subject, TimeSlot, DragItem } from './types';

interface TimetableSlotProps {
  slot: TimeSlot;
  onDrop: (slotId: string, subject: Subject, fromSlotId?: string) => void;
  attachedSubject?: Subject | null;
  onRemoveSubject?: (slotId: string, subject: Subject) => void;
  onAssignTeacher?: (slotId: string, subject: Subject) => void;
  onAssignRoom?: (slotId: string, subject: Subject) => void;
}

const TimetableSlot: React.FC<TimetableSlotProps> = ({
  slot,
  onDrop,
  attachedSubject,
  onRemoveSubject,
  onAssignTeacher,
  onAssignRoom,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // Prevent drag/other clicks
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e?: any) => {
    e?.stopPropagation?.();
    setAnchorEl(null);
  };

  // --- Action Handlers ---
  const handleRemoveClick = (e: React.MouseEvent) => {
    handleClose(e);
    setConfirmOpen(true);
  };

  const handleConfirmRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveSubject && (attachedSubject || (slot.subjects && slot.subjects[0]))) {
      // Pass the "main" subject. For groups, it removes the whole group logic for now
      const subjectToRemove = attachedSubject || ((slot.subjects && slot.subjects[0]) as any);
      onRemoveSubject(slot.id, subjectToRemove);
    }
    setConfirmOpen(false);
  };

  const handleAssignTeacherClick = (e: React.MouseEvent) => {
    handleClose(e);
    if (onAssignTeacher && (attachedSubject || slot.subjects?.[0])) {
      onAssignTeacher(slot.id, attachedSubject || (slot.subjects![0] as any));
    }
  };

  const handleAssignRoomClick = (e: React.MouseEvent) => {
    handleClose(e);
    if (onAssignRoom && (attachedSubject || slot.subjects?.[0])) {
      onAssignRoom(slot.id, attachedSubject || (slot.subjects![0] as any));
    }
  };
  const { top, height } = calculateSlotPosition(slot.startTime, slot.endTime);
  const isBreak = slot.type === SlotType.BREAK;
  // Determine if slot is filled (supports new 'subjects' array or legacy 'subjectId')
  const hasSubjects = slot.subjects && slot.subjects.length > 0;
  const isFilled = hasSubjects || !!attachedSubject;

  // Get subjects to display
  const displaySubjects = hasSubjects ? slot.subjects! : attachedSubject ? [attachedSubject] : [];

  const theme = useTheme();

  // Drag Source Logic (Internal Drag)
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.SUBJECT,
    item: () => ({
      id: attachedSubject?.id || displaySubjects[0]?.id || 'temp', // Use first subject ID
      type: ItemTypes.SUBJECT,
      subject: attachedSubject || displaySubjects[0], // Pass first subject object
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

    if (isFilled && displaySubjects.length > 0) {
      // Use color of the first subject or group color
      // If elective group, maybe separate styling?
      const mainColor = displaySubjects[0].color || '#e0f2f1';

      return {
        ...baseSx,
        backgroundColor: mainColor,
        border: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: 1,
        color: '#37474f', // Dark text for contrast
        fontWeight: 500,
        zIndex: 1,
        '&:hover': {
          zIndex: 3,
          boxShadow: 3,
          height: displaySubjects.length > 1 ? 'auto' : `${height}px`, // Expand for details if needed
          minHeight: `${height}px`,
        },
        flexDirection: 'column',
        alignItems: 'stretch', // Stretch to show multi-subjects
        padding: '2px',
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

  const getTooltipContent = () => {
    if (isBreak) return `${slot.breakType} Break (${slot.startTime} - ${slot.endTime})`;
    if (!isFilled) return 'Empty Slot';

    return (
      <Box>
        {displaySubjects.map((sub, idx) => (
          <Box key={idx} sx={{ mb: idx < displaySubjects.length - 1 ? 1 : 0 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {sub.name}
            </Typography>
            {sub.teacherName && (
              <Typography variant="caption" display="block">
                Teacher: {sub.teacherName}
              </Typography>
            )}
            {sub.roomName && (
              <Typography variant="caption" display="block">
                Room: {sub.roomName}
              </Typography>
            )}
          </Box>
        ))}
        <Typography
          variant="caption"
          sx={{
            mt: 1,
            display: 'block',
            opacity: 0.7,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            pt: 0.5,
          }}
        >
          {slot.startTime} - {slot.endTime}
        </Typography>
      </Box>
    );
  };

  return (
    <Tooltip title={getTooltipContent()} arrow placement="top">
      <Box ref={attachRef} sx={getSx()}>
        {isBreak ? (
          <Typography variant="caption" fontWeight="bold">
            {slot.breakType} ({slot.startTime})
          </Typography>
        ) : isFilled ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.5,
                px: 0.5,
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                {slot.startTime} - {slot.endTime}
              </Typography>
              <IconButton size="small" onClick={handleClick} sx={{ p: 0.5, mt: -0.5, mr: -0.5 }}>
                <MoreVertIcon fontSize="small" sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              </IconButton>
            </Box>
            {displaySubjects.map((sub, idx) => (
              <Box
                key={idx}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderBottom:
                    idx < displaySubjects.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none',
                  p: 0.5,
                }}
              >
                <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.1 }}>
                  {sub.name}
                </Typography>
                {(sub.teacherName || sub.roomName) && null}
              </Box>
            ))}
          </Box>
        ) : isOver ? (
          <Typography variant="caption" color="primary.dark" fontWeight="bold">
            Drop Here
          </Typography>
        ) : null}
        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={(e) => e.stopPropagation()} // Stop propagation on menu items too
          PaperProps={{
            sx: { width: 180, fontSize: '0.85rem' },
          }}
        >
          <MenuItem onClick={handleRemoveClick} sx={{ fontSize: '0.85rem', color: 'error.main' }}>
            Remove Subject
          </MenuItem>
          <MenuItem onClick={handleAssignTeacherClick} sx={{ fontSize: '0.85rem' }}>
            Assign Teacher
          </MenuItem>
          <MenuItem onClick={handleAssignRoomClick} sx={{ fontSize: '0.85rem' }}>
            Assign Room
          </MenuItem>
        </Menu>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmOpen}
          onClose={(e: any) => {
            e.stopPropagation();
            setConfirmOpen(false);
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <DialogTitle>Remove Subject?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to remove this subject from the timetable?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmRemove} color="error" autoFocus>
              Remove
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Tooltip>
  );
};

export default TimetableSlot;

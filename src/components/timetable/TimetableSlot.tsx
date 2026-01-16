import React from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/use-boolean';
import { alpha, useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Box, Button, Tooltip, MenuItem, MenuList, Typography } from '@mui/material';

import { shikshaMitraToast } from '../toast';
import { SlotType, ItemTypes } from './types';
import CustomTooltip from '../custom-tooltip';
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
  console.log('attachedSubject---', attachedSubject);
  const deleteDialog = useBoolean();

  const handleConfirmRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveSubject && (attachedSubject || (slot.subjects && slot.subjects[0]))) {
      const subjectToRemove = attachedSubject || ((slot.subjects && slot.subjects[0]) as any);
      onRemoveSubject(slot.id, subjectToRemove);
    }
    deleteDialog.onFalse();
  };

  const teacherDialog = {
    onTrue: () => {
      if (onAssignTeacher && (attachedSubject || slot.subjects?.[0])) {
        onAssignTeacher(slot.id, attachedSubject || (slot.subjects![0] as any));
      }
    },
  };

  const roomDialog = {
    onTrue: () => {
      if (onAssignRoom && (attachedSubject || slot.subjects?.[0])) {
        onAssignRoom(slot.id, attachedSubject || (slot.subjects![0] as any));
      }
    },
  };

  const { top, height } = calculateSlotPosition(slot.startTime, slot.endTime);
  const isBreak = slot.type === SlotType.BREAK;
  const hasSubjects = slot.subjects && slot.subjects.length > 0;
  const isFilled = hasSubjects || !!attachedSubject;

  const displaySubjects = hasSubjects ? slot.subjects! : attachedSubject ? [attachedSubject] : [];

  const theme = useTheme();

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.SUBJECT,
    item: () => ({
      id: attachedSubject?.id || displaySubjects[0]?.id || 'temp',
      type: ItemTypes.SUBJECT,
      subject: attachedSubject || displaySubjects[0],
      fromSlotId: slot.id,
    }),
    canDrag: () => isFilled && !isBreak,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.SUBJECT,
    canDrop: () => !isBreak && !isFilled,
    drop: (item: DragItem) => {
      if (item.subject) {
        onDrop(slot.id, item.subject, item.fromSlotId);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

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
        bgcolor: theme.palette.grey[200],
        opacity: 0.8,
        color: theme.palette.text.secondary,
        fontWeight: 600,
        justifyContent: 'flex-start',
        pl: 1,
        cursor: 'not-allowed',
        borderLeft: 3,
        border: `1px solid ${theme.palette.grey[300]}`,
        textAlign: 'center',
      };
    }

    if (isFilled && displaySubjects.length > 0) {
      const mainColor = displaySubjects[0].color || '#e0f2f1';

      return {
        ...baseSx,
        borderLeft: `4px solid ${mainColor}`,
        color: '#37474f',
        fontWeight: 500,
        bgcolor: alpha(mainColor, 0.1),
        zIndex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '2px',
      };
    }

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

    const hasAnyTeacher = displaySubjects.some((s) => s.teacherName);
    const hasAnyRoom = displaySubjects.some((s) => s.roomName);

    return (
      <Box>
        <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.1 }}>
          {displaySubjects.map((s) => s.name).join(' | ')}
        </Typography>

        {hasAnyTeacher && (
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            {displaySubjects.map((s) => s.teacherName || '-').join(' | ')}
          </Typography>
        )}

        {hasAnyRoom && (
          <Typography variant="caption" display="block">
            {displaySubjects.map((s) => s.roomName || '-').join(' | ')}
          </Typography>
        )}

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

  const COMPACT_SLOT_HEIGHT = 45; // px
  const isCompactSlot = height <= COMPACT_SLOT_HEIGHT;
  const subjectNames = displaySubjects.map((s) => s.name);
  const fullText = subjectNames.join(' | ');
  const firstSubject = displaySubjects[0]?.name;
  const extraCount = displaySubjects.length - 1;

  return (
    <Box ref={attachRef} sx={getSx()}>
      <CustomTooltip title={getTooltipContent()} arrow placement="top">
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {(isFilled || isBreak) && (
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
            </Box>
          )}

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: 0.5,
              textAlign: 'center',
            }}
          >
            {!isCompactSlot ? (
              <Typography variant="body2" fontWeight="bold">
                {isBreak ? `${slot.breakType} BREAK` : subjectNames.join(' | ')}
              </Typography>
            ) : (
              <Tooltip title={fullText}>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {isBreak ? slot.breakType : firstSubject}
                  </Typography>

                  {!isBreak && extraCount > 0 && (
                    <Typography variant="caption">+{extraCount}</Typography>
                  )}
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CustomTooltip>

      {isFilled && !isBreak && (
        <Box
          sx={{
            position: 'absolute',
            right: -4,
            top: 0.5,
            zIndex: 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ThreeDotsActions
            placement="bottom-center"
            onClickThreeDots={(e) => {
              e.stopPropagation();
            }}
            sx={{
              '& .MuiIconButton-root': {
                padding: '4px',
              },
            }}
            actions={({ popover }) => (
              <MenuList>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    teacherDialog.onTrue();
                    popover.onClose();
                  }}
                >
                  <Iconify icon="mdi:teacher" sx={{ height: '18px', width: '18px' }} />
                  Teacher
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    roomDialog.onTrue();
                    popover.onClose();
                  }}
                >
                  <Iconify icon="mdi:google-classroom" sx={{ height: '18px', width: '18px' }} />
                  Room
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDialog.onTrue();
                    popover.onClose();
                  }}
                >
                  <Iconify
                    icon={GlobalIcons.delete}
                    sx={{ height: '18px', width: '18px' }}
                    color="red"
                  />
                  Delete
                </MenuItem>
              </MenuList>
            )}
          />
        </Box>
      )}

      {isOver && !isFilled && !isBreak ? (
        <Typography
          variant="caption"
          color="primary.dark"
          fontWeight="bold"
          sx={{ zIndex: 5, pointerEvents: 'none' }}
        >
          Drop Here
        </Typography>
      ) : null}

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => deleteDialog.onFalse()}
        title="Delete"
        content={
          <>
            Are you sure you want to delete{' '}
            <strong>{displaySubjects.map((s) => s.name).join(' | ')}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={(e) => {
              handleConfirmRemove(e);
              shikshaMitraToast.success({
                message: (
                  <>
                    Subject: <strong>{displaySubjects.map((s) => s.name).join(' | ')}</strong>{' '}
                    deleted successfully
                  </>
                ),
              });
            }}
            size="small"
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default TimetableSlot;

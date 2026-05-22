import React from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { useBoolean } from 'src/hooks/use-boolean';
import { Iconify } from 'src/components/iconify/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Box, Button, Tooltip, MenuItem, MenuList, Typography } from '@mui/material';

import { shikshaMitraToast } from '../toast';
import { SlotType, ItemTypes } from './types';
import CustomTooltip from '../custom-tooltip';
import { calculateSlotPosition } from './utils';

import type { Subject, TimeSlot, DragItem, DayOfWeek } from './types';

interface TimetableSlotProps {
  slot: TimeSlot;
  onDrop: (slotId: string, subject: Subject, fromSlotId?: string) => void;
  attachedSubject?: Subject | null;
  onRemoveSubject?: (day: DayOfWeek, slotId: number, subject: Subject) => void;
  onAssignTeacher?: (day: DayOfWeek, slotId: string, subject: Subject) => void;
  onAssignRoom?: (day: DayOfWeek, slotId: string, subject: Subject) => void;
  readOnly?: boolean;
  day: DayOfWeek;
  index: number;
  timelineStartHour?: number;
}

const TimetableSlot: React.FC<TimetableSlotProps> = ({
  slot,
  onDrop,
  attachedSubject,
  onRemoveSubject,
  onAssignTeacher,
  onAssignRoom,
  readOnly = false,
  day,
  index,
  timelineStartHour,
}) => {
  const deleteDialog = useBoolean();

  const handleConfirmRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveSubject && (attachedSubject || (slot.subjects && slot.subjects[0]))) {
      const subjectToRemove = attachedSubject || ((slot.subjects && slot.subjects[0]) as any);
      onRemoveSubject(day, index, subjectToRemove);
    }
    deleteDialog.onFalse();
  };

  const teacherDialog = {
    onTrue: () => {
      if (onAssignTeacher && (attachedSubject || slot.subjects?.[0])) {
        onAssignTeacher(day, String(index), attachedSubject || (slot.subjects![0] as any));
      }
    },
  };

  const roomDialog = {
    onTrue: () => {
      if (onAssignRoom && (attachedSubject || slot.subjects?.[0])) {
        onAssignRoom(day, String(index), attachedSubject || (slot.subjects![0] as any));
      }
    },
  };

  const { top, height } = calculateSlotPosition(slot.startTime, slot.endTime, timelineStartHour);
  const isBreak = slot.type === SlotType.BREAK;
  const hasSubjects = slot.subjects && slot.subjects.length > 0;
  const isFilled = hasSubjects || !!attachedSubject;

  const displaySubjects = hasSubjects ? slot.subjects! : attachedSubject ? [attachedSubject] : [];
  const theme = useTheme();

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.SUBJECT,
    item: () => {
      // When dragging an elective group from an already-placed slot, reconstruct
      // the full elective subject so the drop handler can restore all sub-subjects.
      if (slot.subjectType === 1 && slot.electiveGroupId && displaySubjects.length > 0) {
        const electiveSubject = {
          id: slot.electiveGroupId,
          name: slot.electiveGroupName || displaySubjects.map((s) => s.name).join(' | '),
          color: displaySubjects[0]?.color || '#000',
          subjectType: 1,
          electiveGroupId: slot.electiveGroupId,
          electiveGroupName: slot.electiveGroupName,
          subjects: displaySubjects.map((s) => ({
            subjectId: s.subjectId,
            subjectName: s.name,
            color: s.color,
          })),
        };
        return {
          id: slot.electiveGroupId,
          type: ItemTypes.SUBJECT,
          subject: electiveSubject as any,
          fromSlotId: `${day}-${index}`,
        };
      }
      return {
        id: attachedSubject?.subjectId || displaySubjects[0]?.subjectId || 'temp',
        type: ItemTypes.SUBJECT,
        subject: attachedSubject || displaySubjects[0],
        fromSlotId: `${day}-${index}`,
      };
    },
    canDrag: () => isFilled && !isBreak,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.SUBJECT,
    canDrop: () => !isBreak && !isFilled,
    drop: (item: DragItem) => {
      if (item.subject) {
        onDrop(String(index), item.subject, item.fromSlotId);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const attachRef = (node: HTMLDivElement) => {
    drag(drop(node));
  };

  const getSx = () => {
    const baseSx: any = {
      position: 'absolute',
      top: `${top + 2}px`,
      height: `${height - 4}px`,
      width: '94%',
      left: '3%',
      borderRadius: 0.8,
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
        opacity: 0.8,
        bgcolor: theme.vars.palette.action.disabledBackground,
        color: theme.vars.palette.text.primary,
        border: `1px dashed ${theme.vars.palette.divider}`,
        boxShadow: 'none',
        fontWeight: 600,
        justifyContent: 'flex-start',
        pl: 1,
        cursor: 'not-allowed',
        borderLeft: `3px dashed ${theme.vars.palette.divider}`,
        textAlign: 'center',
      };
    }

    if (isFilled && displaySubjects.length > 0) {
      const mainColor = displaySubjects[0].color || '#e0f2f1';

      return {
        ...baseSx,
        bgcolor: theme.vars.palette.background.paper,
        borderLeft: `4px solid ${mainColor}`,
        color: theme.vars.palette.text.primary,
        fontWeight: 500,
        zIndex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '2px',
        boxShadow: theme.shadows[1],
        cursor: 'grab',
        transition: 'all 0.18s ease',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'scale(1.015)',
          zIndex: 3,
        },
      };
    }

    return {
      ...baseSx,
      bgcolor: isOver
        ? canDrop
          ? (theme.palette.success.lighter ?? 'rgba(34,197,94,0.12)')
          : 'rgba(239,68,68,0.08)'
        : 'transparent',
      border: '1.5px dashed',
      borderColor: isOver
        ? canDrop
          ? theme.vars.palette.success.main
          : theme.vars.palette.error.light
        : theme.vars.palette.grey[300],
      backgroundColor: isOver
        ? canDrop
          ? (theme.palette.success.lighter ?? 'rgba(34,197,94,0.12)')
          : 'rgba(239,68,68,0.08)'
        : theme.vars.palette.background.paper,
      transform: isOver && canDrop ? 'scale(1.025)' : 'none',
      zIndex: isOver ? 2 : 0,
      transition: 'all 0.15s ease',
      boxShadow: isOver && canDrop ? `0 0 0 2px ${theme.palette.success.main}40` : 'none',
    };
  };

  const renderTime = (time: any) =>
    typeof time?.format === 'function' ? time.format('HH:mm') : String(time);

  const getTooltipContent = () => {
    if (isBreak)
      return `${slot.breakType} Break (${renderTime(slot.startTime)} - ${renderTime(slot.endTime)})`;
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
          {renderTime(slot.startTime)} - {renderTime(slot.endTime)}
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
  console.log('displaySubjects----', displaySubjects);
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
                justifyContent: 'center',
                alignItems: 'center',
                mb: 0.5,
                px: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontSize: '0.65rem', color: 'text.secondary', textAlign: 'center' }}
              >
                {renderTime(slot.startTime)} - {renderTime(slot.endTime)}
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
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.3 }}>
                  {isBreak ? `${slot.breakType} BREAK` : subjectNames.join(' | ')}
                </Typography>
                {!isBreak && displaySubjects[0]?.className && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ color: 'text.secondary', lineHeight: 1.2, mt: 0.25 }}
                  >
                    Class {displaySubjects[0].className}
                    {displaySubjects[0].division ? `-${displaySubjects[0].division}` : ''}
                  </Typography>
                )}
                {!isBreak && displaySubjects[0]?.roomName && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ color: 'text.secondary', lineHeight: 1.2 }}
                  >
                    {displaySubjects[0].roomName}
                  </Typography>
                )}
              </Box>
            ) : (
              <Tooltip title={fullText}>
                <Box>
                  <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.3 }}>
                    {isBreak ? slot.breakType : firstSubject}
                  </Typography>
                  {!isBreak && displaySubjects[0]?.className && (
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ color: 'text.secondary', lineHeight: 1.2 }}
                    >
                      {displaySubjects[0].className}
                      {displaySubjects[0].division ? `-${displaySubjects[0].division}` : ''}
                    </Typography>
                  )}
                  {!isBreak && extraCount > 0 && (
                    <Typography variant="caption">+{extraCount}</Typography>
                  )}
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CustomTooltip>

      {isFilled && !isBreak && !readOnly && (
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

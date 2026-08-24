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
  const allTeachersAssigned = displaySubjects.every((s) => s.teacherId);
  const roomText = displaySubjects.map((s) => s.roomName).filter(Boolean).join(' | ');
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
            subjectAssignmentId: s.subjectAssignmentId,
            subjectName: s.name,
            color: s.color,
            teacherId: s.teacherId,
            teacherName: s.teacherName,
            roomId: s.roomId,
            roomName: s.roomName,
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
    canDrag: () => !readOnly && isFilled && !isBreak,
    collect: (monitor) => ({
      isDragging: !readOnly && !!monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.SUBJECT,
    canDrop: (item: DragItem) => {
      if (readOnly || isBreak) return false;
      if (isFilled) {
        return !readOnly && !!item.fromSlotId && item.fromSlotId !== `${day}-${index}`;
      }
      return !readOnly;
    },
    drop: (item: DragItem) => {
      if (!readOnly && item.subject) {
        onDrop(String(index), item.subject, item.fromSlotId);
      }
    },
    collect: (monitor) => ({
      isOver: !readOnly && !!monitor.isOver(),
      canDrop: !readOnly && !!monitor.canDrop(),
    }),
  });

  const attachRef = (node: HTMLDivElement) => {
    drag(drop(node));
  };

  const getSx = () => {
    const slotHeight = height - 4;
    const baseSx: any = {
      position: 'absolute',
      top: `${top + 2}px`,
      height: `${slotHeight}px`,
      minHeight: `${slotHeight}px`,
      maxHeight: `${slotHeight}px`,
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
        cursor: readOnly ? 'default' : 'grab',
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
    const accentColor = displaySubjects[0]?.color || theme.palette.primary.main;

    if (isBreak) {
      return (
        <Box sx={{ p: '2px 4px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
            <Iconify
              icon="solar:cup-hot-bold-duotone"
              width={14}
              sx={{ color: 'warning.light', flexShrink: 0 }}
            />
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ color: 'common.white', fontSize: '0.75rem' }}
            >
              {slot.breakType} Break
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, opacity: 0.75 }}>
            <Iconify icon="solar:clock-circle-bold" width={12} sx={{ flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>
              {renderTime(slot.startTime)} – {renderTime(slot.endTime)}
            </Typography>
          </Box>
        </Box>
      );
    }

    if (!isFilled) {
      return (
        <Box sx={{ p: '2px 4px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Iconify
              icon="solar:calendar-add-bold-duotone"
              width={14}
              sx={{ opacity: 0.6, flexShrink: 0 }}
            />
            <Typography variant="caption" sx={{ color: 'common.white', fontSize: '0.72rem' }}>
              Empty Slot — drop a subject here
            </Typography>
          </Box>
        </Box>
      );
    }

    const hasAnyTeacher = displaySubjects.some((s) => s.teacherName || (s as any).teacher);
    const hasAnyRoom = displaySubjects.some((s) => s.roomName || (s as any).room);

    return (
      <Box sx={{ p: '2px 4px', minWidth: 160 }}>
        {/* Colored subject name header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 0.75,
            pb: 0.75,
            mb: 0.75,
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <Box
            sx={{
              width: 3,
              borderRadius: 1,
              bgcolor: accentColor,
              flexShrink: 0,
            }}
          />
          <Box>
            {displaySubjects.map((s) => (
              <Typography
                key={s.subjectId}
                variant="body2"
                fontWeight={700}
                sx={{ color: 'common.white', lineHeight: 1.35, fontSize: '0.78rem' }}
              >
                {s.name}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Teacher */}
        {hasAnyTeacher && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.4 }}>
            <Iconify
              icon="solar:user-bold-duotone"
              width={13}
              sx={{ color: 'success.light', flexShrink: 0 }}
            />
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.68rem' }}
              noWrap
            >
              {displaySubjects.map((s) => s.teacherName || (s as any).teacher || '—').join(' | ')}
            </Typography>
          </Box>
        )}

        {/* Room */}
        {hasAnyRoom && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.4 }}>
            <Iconify
              icon="solar:home-bold-duotone"
              width={13}
              sx={{ color: 'info.light', flexShrink: 0 }}
            />
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.68rem' }}
              noWrap
            >
              {displaySubjects.map((s) => s.roomName || (s as any).room || '—').join(' | ')}
            </Typography>
          </Box>
        )}

        {/* Time */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            mt: 0.75,
            pt: 0.75,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Iconify
            icon="solar:clock-circle-bold"
            width={12}
            sx={{ opacity: 0.55, flexShrink: 0 }}
          />
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem' }}
          >
            {renderTime(slot.startTime)} – {renderTime(slot.endTime)}
          </Typography>
        </Box>
      </Box>
    );
  };

  const COMPACT_SLOT_HEIGHT = 45; // px
  const isCompactSlot = height <= COMPACT_SLOT_HEIGHT;
  const isUltraCompact = height < 50;
  const subjectNames = displaySubjects.map((s) => s.name);
  const fullText = subjectNames.join(' | ');
  const firstSubject = displaySubjects[0]?.name;
  const extraCount = displaySubjects.length - 1;
  return (
    <Box ref={attachRef} sx={getSx()}>
      <Tooltip
        title={getTooltipContent()}
        arrow
        placement="top"
        enterDelay={400}
        enterNextDelay={200}
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: theme.vars.palette.grey[800],
              color: theme.vars.palette.common.white,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              p: 1,
              maxWidth: 260,
            },
          },
          arrow: {
            sx: {
              color: theme.vars.palette.grey[800],
              '&::before': {
                border: '1px solid rgba(255,255,255,0.08)',
              },
            },
          },
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {(isFilled || isBreak) && !isUltraCompact && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pl: '20px',
                pr: '20px',
                minHeight: '18px',
                flexShrink: 0,
              }}
            >
              <Typography
                variant="caption"
                noWrap
                sx={{ fontSize: '0.65rem', color: 'text.secondary', lineHeight: 1 }}
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
              textAlign: 'center',
              overflow: 'hidden',
              p: isUltraCompact ? '2px' : 0,
            }}
          >
            {isUltraCompact ? (
              <Typography
                variant="caption"
                fontWeight="bold"
                noWrap
                sx={{
                  fontSize: '0.72rem',
                  lineHeight: 1.1,
                  px: 0.5,
                }}
              >
                {isBreak ? slot.breakType : firstSubject}
              </Typography>
            ) : !isCompactSlot ? (
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.3 }}>
                  {isBreak ? `${slot.breakType} BREAK` : subjectNames.join(' | ')}
                </Typography>
                {!isBreak && displaySubjects[0]?.className && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ color: 'text.secondary', lineHeight: 1.2 }}
                  >
                    {displaySubjects[0].className}
                  </Typography>
                )}
                {!isBreak && isFilled && (
                  <Box
                    sx={{
                      mt: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Room Name */}
                    {roomText && (
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.25,
                          color: 'text.secondary',
                        }}
                      >
                        <Iconify icon="solar:home-bold-duotone" width={11} />
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
                          {roomText}
                        </Typography>
                      </Box>
                    )}

                    {/* Divider dot */}
                    {roomText && allTeachersAssigned && (
                      <Box component="span" sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
                        •
                      </Box>
                    )}

                    {/* Teacher status */}
                    {allTeachersAssigned && (
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: 'text.secondary',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'success.lighter',
                            color: 'success.main',
                            borderRadius: '50%',
                            p: 0.3,
                          }}
                        >
                          <Iconify icon="solar:user-bold" width={11} />
                        </Box>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
                          {displaySubjects.length === 1
                            ? displaySubjects[0].teacherName
                            : 'Assigned'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              <Tooltip title={fullText}>
                <Box>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    sx={{
                      lineHeight: 1.3,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      justifyContent: 'center',
                    }}
                  >
                    {isBreak ? slot.breakType : firstSubject}
                    {!isBreak && isFilled && allTeachersAssigned && (
                      <Tooltip title="Teacher assigned" arrow>
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'success.lighter',
                            color: 'success.main',
                            borderRadius: '50%',
                            p: 0.25,
                            verticalAlign: 'middle',
                          }}
                        >
                          <Iconify icon="solar:user-bold" width={11} />
                        </Box>
                      </Tooltip>
                    )}
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
      </Tooltip>

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
                padding: '2px',
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
                  <Iconify icon="lucide:user" sx={{ height: '18px', width: '18px' }} />
                  Teacher
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    roomDialog.onTrue();
                    popover.onClose();
                  }}
                >
                  <Iconify icon="ri:home-2-line" sx={{ height: '18px', width: '18px' }} />
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
                  Remove
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

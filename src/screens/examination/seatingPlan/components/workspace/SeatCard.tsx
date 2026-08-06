import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { usePopover } from 'src/components/custom-popover';
import { useDraggable, useDroppable, useDndContext } from '@dnd-kit/core';
import { Box, Chip, Tooltip, IconButton, Typography } from '@mui/material';

import SeatActionMenu from './SeatActionMenu';

import type { SeatingSeat, SeatingAssignment } from '../../types';

export type SeatVisualState =
  | 'empty'
  | 'available'
  | 'selected'
  | 'allocated'
  | 'reserved'
  | 'disabled'
  | 'conflict'
  | 'accessible';

const STATE_STYLES: Record<SeatVisualState, { bg: string; border: string; color: string }> = {
  empty: { bg: 'background.neutral', border: 'divider', color: 'text.disabled' },
  available: { bg: 'background.paper', border: 'divider', color: 'text.secondary' },
  selected: { bg: 'primary.lighter', border: 'primary.main', color: 'primary.dark' },
  allocated: { bg: 'success.lighter', border: 'success.main', color: 'success.darker' },
  reserved: { bg: 'warning.lighter', border: 'warning.main', color: 'warning.darker' },
  disabled: { bg: 'action.disabledBackground', border: 'divider', color: 'text.disabled' },
  conflict: { bg: 'error.lighter', border: 'error.main', color: 'error.darker' },
  accessible: { bg: 'info.lighter', border: 'info.main', color: 'info.darker' },
};

interface Props {
  seat: SeatingSeat;
  roomId: string;
  assignment?: SeatingAssignment;
  studentName?: string;
  rollNo?: number;
  divisionName?: string;
  isConflict?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  onReserve?: () => void;
  onAddNote?: () => void;
  isReadOnly?: boolean;
}

export default function SeatCard({
  seat,
  roomId,
  assignment,
  studentName,
  rollNo,
  divisionName,
  isConflict,
  onClick,
  onRemove,
  onReserve,
  onAddNote,
  isReadOnly,
}: Props) {
  const { setNodeRef: setDropNodeRef, isOver } = useDroppable({
    id: `seat:${seat.seatId}`,
    data: { type: 'seat', seat, roomId },
    disabled: seat.isDisabled || isReadOnly,
  });
  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `assigned-seat:${seat.seatId}`,
    data: { type: 'assigned-seat', assignment, seat, roomId },
    disabled: !assignment || seat.isDisabled || isReadOnly,
  });
  const popover = usePopover();
  const { active } = useDndContext();

  let state: SeatVisualState = 'available';
  if (seat.isDisabled) state = 'disabled';
  else if (isConflict) state = 'conflict';
  else if (assignment) state = 'allocated';
  else if (seat.isReserved) state = 'reserved';
  else if (seat.isAccessible) state = 'accessible';

  const styles = STATE_STYLES[state];

  const draggedType = active?.data.current?.type as 'student' | 'assigned-seat' | undefined;
  const isSelfDrag = active?.id === `assigned-seat:${seat.seatId}`;
  const isSwapTarget = !isReadOnly && isOver && !!assignment && !isSelfDrag && !!draggedType;
  const isPlaceTarget = !isReadOnly && isOver && !assignment && !seat.isDisabled;

  return (
    <Tooltip
      title={
        popover.open
          ? ''
          : assignment
            ? `${studentName ?? 'Student'} - Seat ${seat.seatNumber}`
            : seat.isReserved
              ? `Reserved Seat #${seat.seatNumber} (Excluded from allocation)`
              : seat.isDisabled
                ? `Disabled Seat #${seat.seatNumber}`
                : isReadOnly
                  ? `Seat ${seat.seatNumber}`
                  : `Drop a student on seat ${seat.seatNumber}`
      }
      arrow
      enterDelay={500}
    >
      <Box
        ref={(node: HTMLElement | null) => {
          setDropNodeRef(node);
          setDragNodeRef(node);
        }}
        {...(assignment && !isReadOnly ? listeners : {})}
        {...(assignment && !isReadOnly ? attributes : {})}
        onClick={onClick}
        tabIndex={0}
        data-seat-id={seat.seatId}
        role="button"
        aria-label={`Seat ${seat.seatNumber}${assignment ? `, occupied by ${studentName}` : ', empty'}`}
        sx={{
          position: 'relative',
          minWidth: 0,
          minHeight: 72,
          p: 0.75,
          borderRadius: 1,
          border: '2px solid',
          borderStyle: assignment || isOver || isConflict ? 'solid' : 'dashed',
          borderColor: isSwapTarget ? 'warning.main' : isPlaceTarget ? 'primary.main' : styles.border,
          bgcolor: (t) =>
            isSwapTarget ? alpha(t.palette.warning.main, 0.14) : isPlaceTarget ? alpha(t.palette.primary.main, 0.12) : styles.bg,
          boxShadow: (t) =>
            isSwapTarget
              ? `0 0 0 4px ${alpha(t.palette.warning.main, 0.22)}, 0 10px 20px rgba(0,0,0,0.12)`
              : isPlaceTarget
                ? `0 0 0 4px ${alpha(t.palette.primary.main, 0.22)}, 0 10px 20px rgba(0,0,0,0.12)`
                : assignment
                  ? '0 6px 14px rgba(34, 197, 94, 0.14)'
                  : 'none',
          outline: 'none',
          cursor: seat.isDisabled ? 'not-allowed' : assignment && !isReadOnly ? 'grab' : 'pointer',
          opacity: isDragging ? 0.45 : 1,
          transform: [
            transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : '',
            isSwapTarget || isPlaceTarget ? 'scale(1.05)' : 'scale(1)',
          ]
            .filter(Boolean)
            .join(' '),
          zIndex: isSwapTarget || isPlaceTarget ? 2 : 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
          '&:hover': {
            borderColor: seat.isDisabled ? styles.border : assignment ? 'success.dark' : 'primary.main',
            boxShadow: seat.isDisabled ? 'none' : '0 8px 18px rgba(15, 23, 42, 0.10)',
          },
        }}
      >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography variant="caption" fontWeight={800} sx={{ color: styles.color, lineHeight: 1 }}>
          #{seat.seatNumber}
        </Typography>
        <IconButton
          size="small"
          disabled={isReadOnly}
          sx={{ p: 0.25 }}
          onClick={(e) => {
            e.stopPropagation();
            if (isReadOnly) return;
            popover.onOpen(e);
          }}
        >
          <Iconify icon="eva:more-vertical-fill" width={14} />
        </IconButton>
      </Box>
      {assignment ? (
        <Box sx={{ minWidth: 0, opacity: isSwapTarget ? 0.35 : 1, transition: 'opacity 150ms ease' }}>
          <Typography variant="caption" fontWeight={800} noWrap display="block" sx={{ color: styles.color }}>
            {studentName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ lineHeight: 1.2 }}>
              Roll {rollNo}
            </Typography>
            {divisionName && (
              <Chip label={divisionName} size="small" sx={{ height: 14, fontSize: '0.55rem', px: 0.25 }} />
            )}
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: styles.color, opacity: isPlaceTarget ? 0 : 1 }}>
          <Iconify icon={seat.isReserved ? 'mdi:lock-outline' : 'mdi:plus-circle-outline'} width={14} />
          <Typography variant="caption" fontWeight={700} sx={{ color: 'inherit' }}>
            {seat.isDisabled ? 'Disabled' : seat.isReserved ? 'Reserved' : 'Empty'}
          </Typography>
        </Box>
      )}

      {(isSwapTarget || isPlaceTarget) && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.25,
            borderRadius: 0.75,
            pointerEvents: 'none',
            color: isSwapTarget ? 'warning.darker' : 'primary.dark',
          }}
        >
          <Iconify icon={isSwapTarget ? 'mdi:swap-horizontal-bold' : 'mdi:tray-arrow-down'} width={22} />
          <Typography variant="caption" fontWeight={800} sx={{ color: 'inherit', lineHeight: 1 }}>
            {isSwapTarget ? 'Swap here' : 'Drop here'}
          </Typography>
        </Box>
      )}

      <SeatActionMenu
        popover={popover}
        hasStudent={!!assignment}
        isReserved={seat.isReserved}
        onRemove={() => !isReadOnly && onRemove?.()}
        onReserve={() => !isReadOnly && onReserve?.()}
        onAddNote={() => !isReadOnly && onAddNote?.()}
      />
      </Box>
    </Tooltip>
  );
}

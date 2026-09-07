import { alpha, type Theme, type SxProps } from '@mui/material/styles';

import type { SeatStateStyle, SeatVisualState } from './seat-card-types';

export const SEAT_STATE_STYLES: Record<SeatVisualState, SeatStateStyle> = {
  empty: { bg: 'background.neutral', border: 'divider', color: 'text.disabled' },
  available: { bg: 'background.paper', border: 'divider', color: 'text.secondary' },
  selected: { bg: 'primary.lighter', border: 'primary.main', color: 'primary.dark' },
  allocated: { bg: 'success.lighter', border: 'success.main', color: 'success.darker' },
  reserved: { bg: 'warning.lighter', border: 'warning.main', color: 'warning.darker' },
  disabled: { bg: 'action.disabledBackground', border: 'divider', color: 'text.disabled' },
  conflict: { bg: 'error.lighter', border: 'error.main', color: 'error.darker' },
  accessible: { bg: 'info.lighter', border: 'info.main', color: 'info.darker' },
};

interface SurfaceStyleOptions {
  stateStyle: SeatStateStyle;
  hasAssignment: boolean;
  isExternalExam: boolean;
  isUnavailable: boolean;
  isConflict: boolean;
  isOver: boolean;
  isDragging: boolean;
  isSwapTarget: boolean;
  isPlaceTarget: boolean;
  isReadOnly: boolean;
  transform?: { x: number; y: number } | null;
}

export function getSeatSurfaceSx(options: SurfaceStyleOptions): SxProps<Theme> {
  const {
    stateStyle,
    hasAssignment,
    isExternalExam,
    isUnavailable,
    isConflict,
    isOver,
    isDragging,
    isSwapTarget,
    isPlaceTarget,
    isReadOnly,
    transform,
  } = options;
  return {
    position: 'relative',
    minWidth: 0,
    minHeight: 72,
    p: 0.75,
    borderRadius: 1,
    border: '2px solid',
    borderStyle: (hasAssignment && !isExternalExam) || isOver || isConflict ? 'solid' : 'dashed',
    borderColor: isSwapTarget ? 'warning.main' : isPlaceTarget ? 'primary.main' : stateStyle.border,
    bgcolor: (theme) =>
      isSwapTarget
        ? alpha(theme.palette.warning.main, 0.14)
        : isPlaceTarget
          ? alpha(theme.palette.primary.main, 0.12)
          : stateStyle.bg,
    boxShadow: (theme) =>
      isSwapTarget
        ? `0 0 0 4px ${alpha(theme.palette.warning.main, 0.22)}, 0 10px 20px rgba(0,0,0,0.12)`
        : isPlaceTarget
          ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.22)}, 0 10px 20px rgba(0,0,0,0.12)`
          : hasAssignment && !isExternalExam
            ? '0 6px 14px rgba(34, 197, 94, 0.14)'
            : 'none',
    outline: 'none',
    cursor: isReadOnly
      ? 'default'
      : isUnavailable
        ? 'not-allowed'
        : hasAssignment
          ? 'grab'
          : 'pointer',
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
    transition:
      'border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease, transform 150ms ease',
    ...(!isReadOnly && {
      '&:hover': {
        borderColor: isUnavailable
          ? stateStyle.border
          : hasAssignment
            ? 'success.dark'
            : 'primary.main',
        boxShadow: isUnavailable ? 'none' : '0 8px 18px rgba(15, 23, 42, 0.10)',
      },
    }),
  };
}

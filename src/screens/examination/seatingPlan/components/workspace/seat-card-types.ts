import type { SeatingSeat, SeatingAssignment } from '../../types';

export interface SeatCardProps {
  seat: SeatingSeat;
  roomId: string;
  assignment?: SeatingAssignment;
  studentName?: string;
  rollNo?: number;
  divisionName?: string;
  isConflict?: boolean;
  isExternalExamOccupied?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  onReserve?: () => void;
  isReadOnly?: boolean;
}

export type SeatVisualState =
  | 'empty'
  | 'available'
  | 'selected'
  | 'allocated'
  | 'reserved'
  | 'disabled'
  | 'conflict'
  | 'accessible';

export interface SeatStateStyle {
  bg: string;
  border: string;
  color: string;
}

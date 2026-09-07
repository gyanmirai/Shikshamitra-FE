import type { SeatingStudent, SeatingAssignment, SeatingRoomLayout } from '../../types';

export interface ManualStudentItemDto {
  studentId: string;
  studentName: string;
  rollNo: number;
  standardName?: string;
  seatNumber?: number;
  isSeatAllocate?: boolean;
}

export interface ManualStudentResponseDto {
  items: ManualStudentItemDto[];
}

export interface ManualSeatItemDto {
  studentId?: string | null;
  studentName?: string | null;
  standardName?: string;
  rollNo?: number | null;
  seatNumber: number;
  benchId?: string | null;
  isExternalExamOccupied?: boolean;
  isOtherPlanOccupied?: boolean;
  seatingPlanId?: string | null;
  seatingPlanName?: string | null;
  subjectNames?: string[];
}

export interface ManualRoomDto {
  capacity?: number;
  benchesPerRow?: number;
  benchesPerColumn?: number;
  benchCapacity?: number;
  boardPosition?: string;
  entrancePosition?: string;
  disabledSeatNumbersCsv?: string;
  reservedSeatNumbersCsv?: string;
  accessibleSeatNumbersCsv?: string;
  aisleAfterColumnsCsv?: string;
}

export interface ManualLayoutResponseDto {
  roomId?: string;
  room?: ManualRoomDto;
  items?: ManualSeatItemDto[];
}

export interface GuidedManualEditorData {
  students: SeatingStudent[];
  rooms: SeatingRoomLayout[];
  assignments: SeatingAssignment[];
}

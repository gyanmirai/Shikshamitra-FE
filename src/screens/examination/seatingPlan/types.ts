// Seating Plan V2 — shared types for the new module.
// These are the FE-side "draft" model (spec §22.2). Raw API DTOs are mapped into
// this shape via utils/mappers.ts so components never bind directly to API responses.

export type SeatingPlanStatus =
  'not-started' | 'in-progress' | 'ready' | 'needs-attention' | 'completed' | 'published';

export type AllocationStrategy =
  | 'roll-number'
  | 'alphabetical'
  | 'random'
  | 'rank'
  | 'alternate-division'
  | 'alternate-class'
  | 'ai-suggested'; // Phase 4 extension seam — disabled in UI, no backend implementation yet

export type FillDirection =
  'front-to-back' | 'back-to-front' | 'row-wise' | 'column-wise' | 'aisle-wise';

export interface SeatingStudent {
  studentId: string;
  studentName: string;
  rollNo: number;
  admissionNo?: string;
  standardName?: string;
  divisionId?: string;
  divisionName?: string;
  hasSpecialRequirement?: boolean;
  specialRequirementLabel?: string; // discreet label only, e.g. "Special Seating" (§17)
  isExcluded?: boolean;
  isExternalExamOccupied?: boolean;
}

export type SeatingPlanScopeType = 0 | 1 | 2;

export interface SeatingPlanSubject {
  examSubjectId: string;
  subjectId: string;
  subjectName: string;
  examDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

export interface SeatingPlanScope {
  seatingPlanId: string;
  examId: string;
  name: string;
  scopeType: SeatingPlanScopeType;
  status: number;
  isLocked: boolean;
  subjects: SeatingPlanSubject[];
  totalStudents: number;
  allocatedStudents: number;
  pendingStudents: number;
  allocationProgress: number;
}

export interface SeatingSeat {
  seatId: string; // `${roomId}:${seatNumber}`
  seatNumber: number;
  benchId?: string | null;
  row: number;
  column: number;
  isDisabled?: boolean;
  isReserved?: boolean;
  isAccessible?: boolean;
  isExternalExamOccupied?: boolean;
}

export interface SeatingRoomLayout {
  roomId: string;
  roomName: string;
  capacity: number;
  rows: number;
  columns: number;
  benchCapacity: number;
  columnRows?: number[];
  seats: SeatingSeat[];
  boardPosition?: string;
  entrancePosition?: string;
  aisleAfterColumns?: number[];
}

export type AssignedBy = 'manual' | 'auto';

export interface SeatingAssignment {
  studentId: string;
  roomId: string;
  seatId: string;
  seatNumber: number;
  benchId?: string | null;
  assignedBy: AssignedBy;
  isExternalExamOccupied?: boolean;
}

export interface SeatingAllocationRules {
  strategy: AllocationStrategy;
  fillDirection: FillDirection;
  leaveGap: boolean;
  mixDivisions: boolean;
  specialRequirementPriority: boolean;
}

export interface SeatingValidationIssue {
  code: string;
  message: string;
  studentId?: string;
  roomId?: string;
  seatId?: string;
}

export interface SeatingPlanDraft {
  examId: string;
  examName?: string;
  examTypeName?: string;
  standardName?: string;
  subjectId?: string;
  divisionIds: string[];
  roomIds: string[];

  students: SeatingStudent[];
  rooms: SeatingRoomLayout[];

  assignments: SeatingAssignment[];

  allocationRules: SeatingAllocationRules;

  excludedStudentIds: string[];

  validation: {
    blockers: SeatingValidationIssue[];
    warnings: SeatingValidationIssue[];
  };

  status: SeatingPlanStatus;
  isLocked?: boolean;
  isDirty?: boolean;
}

export const DEFAULT_ALLOCATION_RULES: SeatingAllocationRules = {
  strategy: 'roll-number',
  fillDirection: 'front-to-back',
  leaveGap: false,
  mixDivisions: false,
  specialRequirementPriority: true,
};

// ── List page row (Screen 1) ────────────────────────────────────────────────
export interface SeatingPlanListRow {
  id: string;
  examId: string;
  sessionKey?: string;
  seatingPlanId?: string;
  examName: string;
  examTypeName: string;
  examDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  standardName: string;
  divisions: string[];
  divisionProgress: SeatingPlanDivisionProgress[];
  subjectNames: string[];
  subjectCount: number;
  plannedSubjectCount: number;
  seatingPlanCount: number;
  totalStudents: number;
  allocatedStudents: number;
  pendingStudents: number;
  roomsUsed: number;
  usableCapacity: number;
  emptySeats: number;
  utilization: number;
  capacityStatus: 'ok' | 'shortage' | 'unused';
  progress: number;
  status: SeatingPlanStatus;
  hasCompleteSchedule: boolean;
  canPrepare: boolean;
  requiresMigration: boolean;
  blockingIssueCount: number;
  createdBy?: string;
}

export interface SeatingPlanDivisionProgress {
  divisionId: string;
  divisionName: string;
  totalStudents: number;
  allocatedStudents: number;
  pendingStudents: number;
  progress: number;
}

// ── Undo/redo action history ────────────────────────────────────────────────
export type SeatingHistoryActionType =
  'assign' | 'unassign' | 'move' | 'swap' | 'bulk-allocate' | 'auto-allocate' | 'reset-room';

export interface SeatingHistoryEntry {
  type: SeatingHistoryActionType;
  before: SeatingAssignment[];
  after: SeatingAssignment[];
}

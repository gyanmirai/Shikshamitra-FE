export interface SeatingSubjectDto {
  examSubjectId: string;
  subjectId: string;
  subjectName: string;
  examDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

export interface SeatingRoomOptionDto {
  roomId: string;
  roomName: string;
  capacity: number;
  usableCapacity: number;
  disabledSeats: number;
}

export interface SeatingWorkspaceIssueDto {
  code: string;
  severity: 'blocker' | 'warning' | 'info';
  title: string;
  message: string;
  actionCode?: string | null;
  actionLabel?: string | null;
  relatedSeatingPlanId?: string | null;
}

export interface SeatingSessionDto {
  sessionKey: string;
  examDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  hasCompleteSchedule: boolean;
  subjects: SeatingSubjectDto[];
  divisions: Array<{ id: string; name: string }>;
  availableRooms: SeatingRoomOptionDto[];
  selectedRoomIds: string[];
  seatingPlanId?: string | null;
  seatingPlanName?: string | null;
  status: number;
  isLocked: boolean;
  requiresMigration: boolean;
  canPrepare: boolean;
  totalStudents: number;
  allocatedStudents: number;
  pendingStudents: number;
  roomsUsed: number;
  usableCapacity: number;
  emptySeats: number;
  utilization: number;
  issues: SeatingWorkspaceIssueDto[];
}

export interface SeatingPlanGroupDto {
  seatingPlanId: string;
  name: string;
  scopeType: 0 | 1 | 2;
  status: number;
  isLocked: boolean;
  hasCompleteSchedule: boolean;
  canConfigure: boolean;
  scheduleCount: number;
  subjects: SeatingSubjectDto[];
  divisions: Array<{ id: string; name: string }>;
  availableRooms: SeatingRoomOptionDto[];
  selectedRoomIds: string[];
  totalStudents: number;
  allocatedStudents: number;
  pendingStudents: number;
  roomsUsed: number;
  usableCapacity: number;
  emptySeats: number;
  utilization: number;
  issues: SeatingWorkspaceIssueDto[];
}

export interface ExaminationSeatingIssueDto {
  code: string;
  message: string;
  seatingPlanId?: string | null;
  seatingPlanName?: string | null;
  examSubjectIds: string[];
}

export interface ExaminationSeatingReadinessDto {
  examId: string;
  isPublished: boolean;
  isReadyToPublish: boolean;
  canResetDraft: boolean;
  totalSubjectCount: number;
  plannedSubjectCount: number;
  totalPlanCount: number;
  readyPlanCount: number;
  totalStudentSeats: number;
  allocatedStudentSeats: number;
  publishedAt?: string | null;
  publishedByUserId?: string | null;
  publicationVersion?: string | null;
  blockers: ExaminationSeatingIssueDto[];
  warnings: ExaminationSeatingIssueDto[];
}

export interface SeatingPlanWorkspaceDto {
  examId: string;
  examName: string;
  standardId: string;
  standardName: string;
  selectedSeatingPlanId?: string | null;
  version?: string | null;
  availableSubjects: SeatingSubjectDto[];
  plans: SeatingPlanGroupDto[];
  sessions: SeatingSessionDto[];
  readiness: ExaminationSeatingReadinessDto;
}

export interface GuidedSeatingDraftDto {
  seatingPlanId: string;
  roomIds: string[];
  allocationRulesJson: string;
  excludedStudentIds: string[];
  specialRequirementStudentIds: string[];
  totalStudents: number;
  allocatedStudents: number;
  pendingStudents: number;
  allocationProgress: number;
  status: number;
  isLocked: boolean;
  lastModifiedTime?: string | null;
  version: string;
}

export interface GuidedAllocationPreviewDto {
  assignments: Array<{
    studentId: string;
    studentName?: string | null;
    rollNo?: number | null;
    divisionId?: string | null;
    divisionName?: string | null;
    roomId: string;
    roomName?: string | null;
    seatNumber: number;
    benchId?: string | null;
  }>;
  unallocatedStudentIds: string[];
  totalStudents: number;
  roomsUsed: number;
  emptySeats: number;
  utilizationPercent: number;
}

export interface SeatingValidationDto {
  isValid: boolean;
  blockers: SeatingValidationIssueDto[];
  warnings: SeatingValidationIssueDto[];
}

export interface SeatingValidationIssueDto {
  code: string;
  message: string;
  roomName?: string | null;
  seatNumber?: number | null;
  suggestedActionLabel?: string | null;
}

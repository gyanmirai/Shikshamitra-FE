import type {
  AdmissionAssessmentPolicy,
  AdmissionAssessmentClassProfile,
} from './admission-assessment-policy';

export type AssessmentScope = {
  className?: string;
  admissionOfferingId: string;
  academicYearId?: string;
  boardId?: string;
  mediumId?: string;
  standardId?: string;
  offeringName: string;
  offeringCode?: string | null;
  workflowName?: string | null;
  workflowStageDefinitionId: string;
  stageName: string;
  workflowDefinitionId: string;
  workflowVersion: number;
  schedulingEnabled: boolean;
};

export type AssessmentSessionInput = {
  admissionOfferingId: string;
  workflowStageDefinitionId: string;
  name: string;
  startsAt: string;
  endsAt: string;
  location: string;
  capacity: number;
  concurrencyStamp?: string;
};

export type AssessmentSession = AssessmentSessionInput & {
  id: string;
  bookedCount: number;
  isCancelled: boolean;
  concurrencyStamp: string;
  canManage?: boolean;
  scopes?: AssessmentSessionScope[];
  scopeDetails?: AssessmentScope[];
  sessionType?: AssessmentSessionType;
  roomId?: string | null;
  roomReservationId?: string | null;
  roomReservationStatus?: number | null;
  interviewerId?: string | null;
  interviewerName?: string | null;
  slotDurationMinutes?: number | null;
  breakMinutes?: number | null;
};

export type AssessmentSessionType = 'exam' | 'individualInterview' | 'groupInterview';
export type AssessmentSessionScope = {
  admissionOfferingId: string;
  workflowStageDefinitionId: string;
};
export type AssessmentSharedSessionInput = Omit<
  AssessmentSessionInput,
  'admissionOfferingId' | 'workflowStageDefinitionId'
> & {
  admissionOfferingId?: string;
  workflowStageDefinitionId?: string;
  scopes: AssessmentSessionScope[];
  sessionType: AssessmentSessionType;
  roomId: string;
  interviewerId?: string | null;
  slotDurationMinutes?: number | null;
  breakMinutes?: number | null;
};
export type AssessmentSessionRoom = {
  id: string;
  roomName: string;
  buildingId: string;
  buildingName: string;
  floorId: string;
  floorName: string;
  capacity: number;
};
export type AssessmentSessionStaff = { id: string; name: string };
export type AssessmentSessionResources = {
  rooms: AssessmentSessionRoom[];
  interviewers: AssessmentSessionStaff[];
};
export type AssessmentInterviewSlot = { startsAt: string; endsAt: string };
export type AssessmentBookingCandidate = AssessmentSessionScope & {
  applicationId: string;
  stageInstanceId: string;
  applicationNumber: string;
  applicantName: string;
  concurrencyStamp: string;
  slotStartsAt?: string | null;
  slotEndsAt?: string | null;
};
export type AssessmentSelectedBooking = {
  applicationId: string;
  stageInstanceId: string;
  concurrencyStamp: string;
  slotStartsAt?: string | null;
};
export type AssessmentBookingPreview = {
  proposedBookings: AssessmentBookingCandidate[];
  totalCount: number;
  items: AssessmentBookingCandidate[];
  eligibleCount: number;
  availableCount: number;
  remainingCount: number;
  requiresRoomApproval: boolean;
  roomName: string;
  buildingName: string;
  floorName: string;
  previewFingerprint: string;
  slots: AssessmentInterviewSlot[];
  warnings: string[];
};
export type AssessmentSessionConfirmation = { session: AssessmentSession; bookedCount: number };
export type AssessmentSessionList = { totalCount: number; items: AssessmentSession[] };
export type AssessmentSessionListQuery = {
  academicYearId?: string;
  boardId?: string;
  mediumId?: string;
  standardId?: string;
  standardIds?: string;
  admissionOfferingId?: string;
  workflowStageDefinitionId?: string;
  search?: string;
  includeCancelled?: boolean;
  skipCount: number;
  maxResultCount: number;
};

export type AssessmentAttendance = 'pending' | 'present' | 'absent';
export type AssessmentOutcome = 'pending' | 'passed' | 'failed' | 'absent' | 'retake' | 'waived';
/** Server-resolved configuration, frozen when the attempt is created. */
export type AssessmentEffectiveProfile = AdmissionAssessmentClassProfile;
export type AssessmentSubjectScore = { code: string; marks: number | null };
export type AssessmentResultInput = AssessmentAttemptAction & {
  marks?: number;
  outcome?: 'passed' | 'failed';
  subjectScores?: AssessmentSubjectScore[];
};
export type AssessmentAttempt = {
  id: string;
  attemptNumber: number;
  sessionId?: string | null;
  sessionName?: string | null;
  sessionStartsAt?: string | null;
  sessionEndsAt?: string | null;
  sessionLocation?: string | null;
  slotStartsAt?: string | null;
  slotEndsAt?: string | null;
  attendance: AssessmentAttendance;
  status: 'pending' | 'pendingReview' | 'completed' | 'cancelled';
  outcome: AssessmentOutcome;
  marks?: number | null;
  notes?: string | null;
  reviewNotes?: string | null;
  recordedBy?: string | null;
  reviewedBy?: string | null;
  concurrencyStamp: string;
  createdAt: string;
  reviewedAt?: string | null;
  effectiveProfile?: AssessmentEffectiveProfile | null;
  subjectScores?: AssessmentSubjectScore[];
};

export type ApplicationAssessment = {
  applicationId: string;
  stageInstanceId: string;
  assessmentEnabled: boolean;
  policy: AdmissionAssessmentPolicy | null;
  attempts: AssessmentAttempt[];
  concurrencyStamp: string;
  outcome?: string | null;
  blockers: string[];
  canComplete: boolean;
  canBook: boolean;
  canRecordAttendance: boolean;
  canRecordResult: boolean;
  canReview: boolean;
  canRetake: boolean;
  canWaive: boolean;
  canCancel: boolean;
  effectiveProfile?: AssessmentEffectiveProfile | null;
  canSaveResultDraft?: boolean;
  canSubmitResult?: boolean;
};

export type AssessmentStageKey = { applicationId: string; stageInstanceId: string };
export type ManagedApplicationAssessment = ApplicationAssessment & {
  policy: AdmissionAssessmentPolicy;
};
export type AssessmentAttemptAction = {
  attemptId: string;
  concurrencyStamp: string;
  notes?: string;
};

export const ASSESSMENTS_URL = '/student/enrollment/admissions/assessments';
export function unwrapAssessment<T>(response: { data?: T } | T): T {
  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    response.data !== undefined
  ) {
    return response.data;
  }
  return response as T;
}

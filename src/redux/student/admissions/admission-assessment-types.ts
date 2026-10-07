import type { AdmissionAssessmentPolicy } from './admission-assessment-policy';

export type AssessmentScope = {
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
};

export type AssessmentAttendance = 'pending' | 'present' | 'absent';
export type AssessmentOutcome = 'pending' | 'passed' | 'failed' | 'absent' | 'retake' | 'waived';
export type AssessmentAttempt = {
  id: string;
  attemptNumber: number;
  sessionId?: string | null;
  sessionName?: string | null;
  sessionStartsAt?: string | null;
  sessionEndsAt?: string | null;
  sessionLocation?: string | null;
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

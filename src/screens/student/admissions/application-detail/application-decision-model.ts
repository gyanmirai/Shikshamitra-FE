import type { AdmissionDecisionAction } from './use-admission-application-decisions';

export const ADMISSION_DECISION_ACTION_LABELS: Record<AdmissionDecisionAction, string> = {
  approve: 'Approve Application',
  reject: 'Reject Application',
  waitlist: 'Waitlist Application',
};

export const admissionDecisionRequiresReason = (action: AdmissionDecisionAction | null) =>
  action === 'reject' || action === 'waitlist';

export const isDangerousAdmissionDecision = (action: AdmissionDecisionAction | null) =>
  action === 'reject';

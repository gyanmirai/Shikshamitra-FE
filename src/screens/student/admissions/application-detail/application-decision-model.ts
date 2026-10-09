import type { AdmissionDecisionAction } from './use-admission-application-decisions';

export const ADMISSION_DECISION_ACTION_LABELS: Record<AdmissionDecisionAction, string> = {
  approve: 'Approve application',
  reject: 'Reject application',
  waitlist: 'Waitlist application',
};

export const admissionDecisionRequiresReason = (action: AdmissionDecisionAction | null) =>
  action === 'reject' || action === 'waitlist';

export const isDangerousAdmissionDecision = (action: AdmissionDecisionAction | null) =>
  action === 'reject';

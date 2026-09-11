import type { AdmissionDecisionAction } from './use-admission-application-decisions';

export const ADMISSION_DECISION_ACTION_LABELS: Record<AdmissionDecisionAction, string> = {
  review: 'Move to review',
  approve: 'Approve application',
  reject: 'Reject application',
  waitlist: 'Waitlist application',
  offer: 'Issue admission offer',
  accept: 'Accept offer',
  decline: 'Decline offer',
};

export const admissionDecisionRequiresReason = (action: AdmissionDecisionAction | null) =>
  action === 'reject' || action === 'waitlist' || action === 'decline';

export const isDangerousAdmissionDecision = (action: AdmissionDecisionAction | null) =>
  action === 'reject' || action === 'decline';

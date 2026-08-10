import type { GrantedPermission } from 'src/utils/permissions';

import { hasGrantedPermission } from 'src/utils/permissions';

import { admissionCrmActionPermissions } from './admission-action-permissions';

import type { ApplicantJourneyStep } from './applicant-journey-model';

export type ApplicantCommandTab =
  'next' | 'inquiry' | 'exam' | 'registration' | 'finance' | 'offer' | 'activation' | 'governance';

export type ApplicantExamAction = 'record-result' | 'review-eligibility' | 'review-absence';

export type ApplicantPrimaryAction = {
  label: string;
  tab: ApplicantCommandTab;
  kind: 'schedule-exam' | 'open-stage' | 'open-exams';
  examAction?: ApplicantExamAction;
  requiredPermission?: string;
};

const actionMap: Record<string, ApplicantPrimaryAction> = {
  ScheduleExam: {
    label: 'Schedule Assessment',
    tab: 'exam',
    kind: 'schedule-exam',
    requiredPermission: admissionCrmActionPermissions.scheduleExam,
  },
  RecordExamResult: {
    label: 'Record Exam Result',
    tab: 'exam',
    kind: 'open-exams',
    examAction: 'record-result',
    requiredPermission: admissionCrmActionPermissions.changeExamResult,
  },
  ReviewEligibility: {
    label: 'Review Eligibility',
    tab: 'exam',
    kind: 'open-exams',
    examAction: 'review-eligibility',
    requiredPermission: admissionCrmActionPermissions.changeExamResult,
  },
  ReviewExamAbsence: {
    label: 'Review Exam Absence',
    tab: 'exam',
    kind: 'open-exams',
    examAction: 'review-absence',
    requiredPermission: admissionCrmActionPermissions.changeExamResult,
  },
  StartRegistration: {
    label: 'Issue Registration Form',
    tab: 'registration',
    kind: 'open-stage',
    requiredPermission: admissionCrmActionPermissions.issueRegistrationForm,
  },
  ContinueRegistration: {
    label: 'Continue Registration',
    tab: 'registration',
    kind: 'open-stage',
    requiredPermission: admissionCrmActionPermissions.issueRegistrationForm,
  },
  VerifyRegistration: {
    label: 'Verify Registration',
    tab: 'registration',
    kind: 'open-stage',
    requiredPermission: admissionCrmActionPermissions.verifyRegistration,
  },
  ReissueRegistration: {
    label: 'Reissue Registration',
    tab: 'registration',
    kind: 'open-stage',
    requiredPermission: admissionCrmActionPermissions.manageRegistrationLinks,
  },
  ReviewRegistrationCorrection: {
    label: 'Review Registration Correction',
    tab: 'registration',
    kind: 'open-stage',
    requiredPermission: admissionCrmActionPermissions.issueRegistrationForm,
  },
  RequestFinanceVerification: {
    label: 'Request Finance Review',
    tab: 'finance',
    kind: 'open-stage',
    requiredPermission: admissionCrmActionPermissions.issueQuotations,
  },
  ViewFinanceReference: {
    label: 'View Finance Status',
    tab: 'finance',
    kind: 'open-stage',
  },
  ReviewFinanceIssue: {
    label: 'Review Finance Issue',
    tab: 'finance',
    kind: 'open-stage',
    requiredPermission: admissionCrmActionPermissions.recordFinanceStatus,
  },
  ReviewPlacement: {
    label: 'Review Class Placement',
    tab: 'offer',
    kind: 'open-stage',
    requiredPermission: admissionCrmActionPermissions.manageOffers,
  },
  RequestActivation: {
    label: 'Request Activation',
    tab: 'activation',
    kind: 'open-stage',
    requiredPermission: admissionCrmActionPermissions.requestActivation,
  },
  ReviewActivation: {
    label: 'Review Activation',
    tab: 'activation',
    kind: 'open-stage',
    requiredPermission: admissionCrmActionPermissions.approveActivation,
  },
  ContinueActivation: {
    label: 'Continue Activation',
    tab: 'activation',
    kind: 'open-stage',
    requiredPermission: admissionCrmActionPermissions.executeActivation,
  },
  RepairActivation: {
    label: 'Repair Activation',
    tab: 'activation',
    kind: 'open-stage',
    requiredPermission: admissionCrmActionPermissions.repairActivation,
  },
};

export function getApplicantPrimaryAction(actionCode?: string | null) {
  return actionCode ? actionMap[actionCode] : undefined;
}

export function isApplicantPrimaryActionPermitted(
  action: ApplicantPrimaryAction | undefined,
  permissions: GrantedPermission[] | undefined
) {
  return Boolean(
    action &&
    (!action.requiredPermission || hasGrantedPermission(permissions, action.requiredPermission))
  );
}

export function getJourneyTab(step: ApplicantJourneyStep): ApplicantCommandTab {
  return step.id === 'inquiry' ? 'inquiry' : step.workspaceTab;
}

export function resolveApplicantCommandTab(
  requestedTab: ApplicantCommandTab,
  currentStep: ApplicantJourneyStep | undefined
) {
  if (requestedTab !== 'next') return requestedTab;
  return currentStep ? getJourneyTab(currentStep) : 'inquiry';
}

export function canOpenJourneyStep(step: ApplicantJourneyStep) {
  if (step.state === 'complete' || step.state === 'in-progress' || step.state === 'needs-review') {
    return true;
  }

  return Boolean(
    (step.state === 'not-started' || step.state === 'blocked') &&
    getApplicantPrimaryAction(step.actionCode)
  );
}

export function isApplicantJourneyActionable(step: ApplicantJourneyStep | undefined) {
  return Boolean(
    step &&
    step.state !== 'complete' &&
    step.state !== 'skipped' &&
    getApplicantPrimaryAction(step.actionCode)
  );
}

export function getJourneyStateLabel(step: ApplicantJourneyStep) {
  switch (step.state) {
    case 'complete':
      return 'Complete';
    case 'in-progress':
      return 'In progress';
    case 'needs-review':
      return 'Needs review';
    case 'skipped':
      return 'Not required';
    case 'blocked':
      return 'Blocked';
    default:
      return 'Not started';
  }
}

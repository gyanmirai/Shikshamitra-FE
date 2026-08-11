import type {
  AdmissionCrmApplicantStepDto,
  AdmissionCrmApplicantProgressDto,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  AdmissionCrmApplicantStepKey,
  AdmissionCrmApplicantStepStatus,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

export type ApplicantJourneyStepId =
  'inquiry' | 'exam' | 'registration' | 'finance' | 'placement' | 'activation';

export type ApplicantJourneyStepState =
  'not-started' | 'in-progress' | 'complete' | 'skipped' | 'blocked' | 'needs-review';

export type ApplicantJourneyWorkspaceTab =
  'inquiry' | 'exam' | 'registration' | 'finance' | 'offer' | 'activation';

export type ApplicantJourneyStep = {
  stepKey: AdmissionCrmApplicantStepKey;
  id: ApplicantJourneyStepId;
  label: string;
  workspaceTab: ApplicantJourneyWorkspaceTab;
  state: ApplicantJourneyStepState;
  reason?: string;
  reasonCode?: string;
  actionCode?: string | null;
};

type ApplicantJourneyPermissions = {
  canViewPlacement: boolean;
  canViewActivation: boolean;
};

const stepMetadata: Record<
  AdmissionCrmApplicantStepKey,
  { id: ApplicantJourneyStepId; workspaceTab: ApplicantJourneyWorkspaceTab }
> = {
  [AdmissionCrmApplicantStepKey.Inquiry]: { id: 'inquiry', workspaceTab: 'inquiry' },
  [AdmissionCrmApplicantStepKey.Exam]: { id: 'exam', workspaceTab: 'exam' },
  [AdmissionCrmApplicantStepKey.Registration]: {
    id: 'registration',
    workspaceTab: 'registration',
  },
  [AdmissionCrmApplicantStepKey.Finance]: { id: 'finance', workspaceTab: 'finance' },
  [AdmissionCrmApplicantStepKey.Placement]: { id: 'placement', workspaceTab: 'offer' },
  [AdmissionCrmApplicantStepKey.Activation]: {
    id: 'activation',
    workspaceTab: 'activation',
  },
};

const statusState: Record<AdmissionCrmApplicantStepStatus, ApplicantJourneyStepState> = {
  [AdmissionCrmApplicantStepStatus.NotStarted]: 'not-started',
  [AdmissionCrmApplicantStepStatus.InProgress]: 'in-progress',
  [AdmissionCrmApplicantStepStatus.Complete]: 'complete',
  [AdmissionCrmApplicantStepStatus.Skipped]: 'skipped',
  [AdmissionCrmApplicantStepStatus.Blocked]: 'blocked',
  [AdmissionCrmApplicantStepStatus.NeedsReview]: 'needs-review',
};

const permissionReason: Partial<Record<ApplicantJourneyStepId, string>> = {
  placement: 'You do not have permission to review class placement.',
  activation: 'You do not have permission to review activation.',
};

function mapStep(
  step: AdmissionCrmApplicantStepDto,
  permissions: ApplicantJourneyPermissions
): ApplicantJourneyStep {
  const metadata = stepMetadata[step.step];
  const permissionBlocked =
    (metadata.id === 'placement' && !permissions.canViewPlacement) ||
    (metadata.id === 'activation' && !permissions.canViewActivation);

  return {
    stepKey: step.step,
    ...metadata,
    label: step.title,
    state: permissionBlocked ? 'blocked' : statusState[step.status],
    reason: permissionBlocked ? permissionReason[metadata.id] : step.reason,
    reasonCode: step.reasonCode,
    actionCode: step.actionCode,
  };
}

export function buildApplicantJourney(
  progress: AdmissionCrmApplicantProgressDto | undefined,
  permissions: ApplicantJourneyPermissions
): ApplicantJourneyStep[] {
  if (!progress) return [];
  return progress.steps
    .filter((step) => step.step !== AdmissionCrmApplicantStepKey.Finance || step.isRequired)
    .map((step) => mapStep(step, permissions));
}

export function getApplicantNextJourneyStep(steps: ApplicantJourneyStep[]) {
  return (
    steps.find((step) => step.state === 'needs-review') ||
    steps.find((step) => step.state === 'in-progress' && step.id !== 'inquiry') ||
    steps.find((step) => step.state === 'not-started') ||
    steps.find((step) => step.state === 'in-progress')
  );
}

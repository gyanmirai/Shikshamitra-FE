'use client';

import { AdmissionCrmPipelineColumnKey } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { ApplicantWorklistWorkspace } from './applicant-worklist-workspace';

import type { ApplicantWorklistTableConfiguration } from './applicant-worklist-workspace';

const activationTableConfiguration: ApplicantWorklistTableConfiguration = {
  stageFilter: {
    label: 'Activation Stage',
    description: 'Focus the worklist on one activation readiness stage.',
  },
};

const activationStages = [
  {
    key: AdmissionCrmPipelineColumnKey.FinanceVerification,
    label: 'Finance Pending',
    icon: 'mdi:cash-clock',
  },
  {
    key: AdmissionCrmPipelineColumnKey.PlacementPending,
    label: 'Placement Pending',
    icon: 'mdi:account-school-outline',
  },
  {
    key: AdmissionCrmPipelineColumnKey.ReadyForActivation,
    label: 'Ready for Activation',
    icon: 'mdi:rocket-launch-outline',
  },
  {
    key: AdmissionCrmPipelineColumnKey.Activated,
    label: 'Activated',
    icon: 'mdi:check-decagram-outline',
  },
] as const;

export function ActivationWorkspace() {
  return (
    <ApplicantWorklistWorkspace
      title="Activation"
      description="Review admission gates, approvals, repair work, and the Student Records handoff."
      tableId="student-enrollment-activation"
      defaultColumn={AdmissionCrmPipelineColumnKey.ReadyForActivation}
      columns={activationStages}
      applicantTab="activation"
      tableConfiguration={activationTableConfiguration}
    />
  );
}

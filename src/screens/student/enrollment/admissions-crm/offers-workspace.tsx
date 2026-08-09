'use client';

import { AdmissionCrmPipelineColumnKey } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { ApplicantWorklistWorkspace } from './applicant-worklist-workspace';

import type { ApplicantWorklistTableConfiguration } from './applicant-worklist-workspace';

const placementTableConfiguration: ApplicantWorklistTableConfiguration = {
  stageFilter: {
    label: 'Placement Stage',
    description: 'Focus the worklist on one class placement stage.',
  },
};

const placementStages = [
  {
    key: AdmissionCrmPipelineColumnKey.RegistrationDone,
    label: 'Registration Done',
    icon: 'mdi:clipboard-check-outline',
  },
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
    label: 'Placement Complete',
    icon: 'mdi:school-outline',
  },
] as const;

export function OffersWorkspace() {
  return (
    <ApplicantWorklistWorkspace
      title="Class Placement"
      description="Review academic placement, division assignment, capacity, and authorized overrides."
      tableId="student-enrollment-class-placement"
      defaultColumn={AdmissionCrmPipelineColumnKey.PlacementPending}
      columns={placementStages}
      applicantTab="offer"
      tableConfiguration={placementTableConfiguration}
    />
  );
}

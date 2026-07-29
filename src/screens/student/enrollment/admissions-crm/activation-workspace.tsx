'use client';

import { AdmissionCrmPipelineColumnKey } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { ApplicantWorklistWorkspace } from './applicant-worklist-workspace';

export function ActivationWorkspace() {
  return (
    <ApplicantWorklistWorkspace
      title="Activation"
      description="Review admission gates, approvals, repair work, and the Student Records handoff."
      tableId="student-enrollment-activation"
      defaultColumn={AdmissionCrmPipelineColumnKey.ReadyForActivation}
      columns={[
        { key: AdmissionCrmPipelineColumnKey.FinanceVerification, label: 'Finance pending' },
        { key: AdmissionCrmPipelineColumnKey.PlacementPending, label: 'Placement pending' },
        { key: AdmissionCrmPipelineColumnKey.ReadyForActivation, label: 'Ready for activation' },
        { key: AdmissionCrmPipelineColumnKey.Activated, label: 'Activated' },
      ]}
      applicantTab="activation"
    />
  );
}

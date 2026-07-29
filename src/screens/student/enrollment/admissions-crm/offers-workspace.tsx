'use client';

import { AdmissionCrmPipelineColumnKey } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { ApplicantWorklistWorkspace } from './applicant-worklist-workspace';

export function OffersWorkspace() {
  return (
    <ApplicantWorklistWorkspace
      title="Class Placement"
      description="Review academic placement, division assignment, capacity, and authorized overrides."
      tableId="student-enrollment-class-placement"
      defaultColumn={AdmissionCrmPipelineColumnKey.PlacementPending}
      columns={[
        { key: AdmissionCrmPipelineColumnKey.RegistrationDone, label: 'Registration done' },
        { key: AdmissionCrmPipelineColumnKey.FinanceVerification, label: 'Finance pending' },
        { key: AdmissionCrmPipelineColumnKey.PlacementPending, label: 'Placement pending' },
        { key: AdmissionCrmPipelineColumnKey.ReadyForActivation, label: 'Placement complete' },
      ]}
      applicantTab="offer"
    />
  );
}

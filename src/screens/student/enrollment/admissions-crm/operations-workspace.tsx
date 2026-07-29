'use client';

import { AdmissionCrmPipelineColumnKey } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { ApplicantWorklistWorkspace } from './applicant-worklist-workspace';

export function AdmissionsOperationsWorkspaceContent() {
  return (
    <ApplicantWorklistWorkspace
      title="Follow-ups & Messages"
      description="Review applicants who need contact, complete assigned follow-ups, and open message history."
      tableId="student-enrollment-follow-ups-messages"
      defaultColumn={AdmissionCrmPipelineColumnKey.FollowUp}
      columns={[
        { key: AdmissionCrmPipelineColumnKey.NewInquiry, label: 'New inquiries' },
        { key: AdmissionCrmPipelineColumnKey.FollowUp, label: 'Follow-up due' },
        { key: AdmissionCrmPipelineColumnKey.ExamPending, label: 'Exam reminder' },
        { key: AdmissionCrmPipelineColumnKey.RegistrationPending, label: 'Registration reminder' },
      ]}
      applicantTab="overview"
    />
  );
}

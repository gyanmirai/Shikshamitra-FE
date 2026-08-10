'use client';

import { AdmissionCrmPipelineColumnKey } from 'src/redux/student/admissions-crm/core-leads-contracts';

import { ApplicantWorklistWorkspace } from './applicant-worklist-workspace';

import type { ApplicantWorklistTableConfiguration } from './applicant-worklist-workspace';

const followUpTableConfiguration: ApplicantWorklistTableConfiguration = {
  stageFilter: {
    label: 'Follow-up Focus',
    description: 'Focus the worklist on one communication need.',
  },
};

const followUpStages = [
  {
    key: AdmissionCrmPipelineColumnKey.NewInquiry,
    label: 'New Inquiries',
    icon: 'mdi:account-plus-outline',
  },
  {
    key: AdmissionCrmPipelineColumnKey.FollowUp,
    label: 'Follow-up Due',
    icon: 'mdi:phone-clock-outline',
  },
  {
    key: AdmissionCrmPipelineColumnKey.ExamPending,
    label: 'Exam Reminder',
    icon: 'mdi:school-outline',
  },
  {
    key: AdmissionCrmPipelineColumnKey.RegistrationPending,
    label: 'Registration Reminder',
    icon: 'mdi:file-clock-outline',
  },
] as const;

export function AdmissionsOperationsWorkspaceContent() {
  return (
    <ApplicantWorklistWorkspace
      title="Follow-ups & Messages"
      description="Review applicants who need contact, complete assigned follow-ups, and open message history."
      tableId="student-enrollment-follow-ups-messages"
      defaultColumn={AdmissionCrmPipelineColumnKey.FollowUp}
      columns={followUpStages}
      applicantTab="next"
      tableConfiguration={followUpTableConfiguration}
    />
  );
}

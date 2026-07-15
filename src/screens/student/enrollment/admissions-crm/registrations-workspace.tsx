'use client';

import { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { registrationQueues } from './operations-queue-config';
import { OperationsQueueWorkspace } from './operations-queue-workspace';

export function RegistrationsWorkspace() {
  return (
    <OperationsQueueWorkspace
      title="Registration"
      description="Invite eligible applicants, complete registrations, verify documents, and confirm readiness."
      defaultQueue={AdmissionCrmOperationsQueueType.RegistrationInvitationPending}
      allowedQueues={registrationQueues}
      applicantTab="registration"
      variant="registration"
    />
  );
}

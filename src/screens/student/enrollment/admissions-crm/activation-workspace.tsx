'use client';

import { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { activationQueues } from './operations-queue-config';
import { OperationsQueueWorkspace } from './operations-queue-workspace';

export function ActivationWorkspace() {
  return (
    <OperationsQueueWorkspace
      title="Student Activation"
      description="Repair pending activations and review controlled cancellation or service handoff exceptions."
      defaultQueue={AdmissionCrmOperationsQueueType.ActivationRepair}
      allowedQueues={activationQueues}
      applicantTab="activation"
      variant="activation"
    />
  );
}

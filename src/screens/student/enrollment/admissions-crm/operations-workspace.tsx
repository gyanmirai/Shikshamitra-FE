'use client';

import { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { operationsQueues } from './operations-queue-config';
import { OperationsQueueWorkspace } from './operations-queue-workspace';

export function AdmissionsOperationsWorkspaceContent() {
  return (
    <OperationsQueueWorkspace
      title="Admissions Operations"
      description="Resolve household, identity, transfer, returning-student, and data-quality exceptions."
      defaultQueue={AdmissionCrmOperationsQueueType.HouseholdResolution}
      allowedQueues={operationsQueues}
      variant="operations"
      showOperationsUtilities
    />
  );
}

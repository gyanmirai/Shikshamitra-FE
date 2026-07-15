'use client';

import { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { offerQueues } from './operations-queue-config';
import { OperationsQueueWorkspace } from './operations-queue-workspace';

export function OffersWorkspace() {
  return (
    <OperationsQueueWorkspace
      title="Offers & Seats"
      description="Review approval, policy, payment, waitlist, and allotment decisions."
      defaultQueue={AdmissionCrmOperationsQueueType.FinalApproval}
      allowedQueues={offerQueues}
      applicantTab="offer"
      variant="offer"
    />
  );
}

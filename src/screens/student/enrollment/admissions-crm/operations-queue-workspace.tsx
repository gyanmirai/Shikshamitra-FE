'use client';

import type { ReactNode } from 'react';
import type { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/operations-governance-contracts';
import type { ApplicantWorkspaceTab } from './applicant-workspace-page';
import type { EnrollmentQueueVariant } from './operations-queue-columns';

import { OperationsQueueView } from './operations-queue-workspace-view';
import { OperationsQueueProvider } from './operations-queue-workspace-context';
import { useOperationsQueueController } from './operations-queue-workspace-controller';

type Props = {
  title: string;
  description: string;
  defaultQueue: AdmissionCrmOperationsQueueType;
  allowedQueues?: AdmissionCrmOperationsQueueType[];
  applicantTab?: ApplicantWorkspaceTab;
  variant?: EnrollmentQueueVariant;
  showOperationsUtilities?: boolean;
  headerActions?: ReactNode;
};

export function OperationsQueueWorkspace({
  title,
  description,
  defaultQueue,
  allowedQueues,
  applicantTab,
  variant,
  showOperationsUtilities,
  headerActions,
}: Props) {
  const controller = useOperationsQueueController({
    title,
    description,
    defaultQueue,
    allowedQueues,
    applicantTab,
    variant,
    showOperationsUtilities,
    headerActions,
  });

  return (
    <OperationsQueueProvider value={controller}>
      <OperationsQueueView />
    </OperationsQueueProvider>
  );
}

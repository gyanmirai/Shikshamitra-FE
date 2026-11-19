import { CommunicationCampaignStatus } from 'src/redux/communication/communicationTypes';

import { notificationLabel } from './response-adapters';
import { AcademicDispatchStatus } from './delivery-types';

export const dispatchStatusLabels: Record<AcademicDispatchStatus, string> = {
  [AcademicDispatchStatus.Pending]: 'Queued',
  [AcademicDispatchStatus.Processing]: 'Processing',
  [AcademicDispatchStatus.ProviderAccepted]: 'Provider accepted',
  [AcademicDispatchStatus.Delivered]: 'Delivered',
  [AcademicDispatchStatus.Read]: 'Read',
  [AcademicDispatchStatus.Failed]: 'Failed',
  [AcademicDispatchStatus.Skipped]: 'Skipped',
  [AcademicDispatchStatus.UnknownAcceptance]: 'Acceptance unknown',
};

export const operationStatusLabels: Record<CommunicationCampaignStatus, string> = {
  [CommunicationCampaignStatus.Draft]: 'Draft',
  [CommunicationCampaignStatus.PendingApproval]: 'Pending approval',
  [CommunicationCampaignStatus.Approved]: 'Approved',
  [CommunicationCampaignStatus.Scheduled]: 'Scheduled',
  [CommunicationCampaignStatus.Queued]: 'Queued',
  [CommunicationCampaignStatus.Sending]: 'Sending',
  [CommunicationCampaignStatus.Sent]: 'Sending complete',
  [CommunicationCampaignStatus.PartiallyFailed]: 'Partially failed',
  [CommunicationCampaignStatus.Failed]: 'Failed',
  [CommunicationCampaignStatus.Cancelled]: 'Cancelled',
};

export function deliveryReason(reason: string | null) {
  if (!reason) return '—';
  const code = reason.split(':').at(-1) ?? '';
  return notificationLabel(code).replace(/^(\w)(.*)$/, (_, first, rest) => first + rest.toLowerCase());
}

export function notificationRecordId(value: string | null) {
  return value && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)
    && value !== '00000000-0000-0000-0000-000000000000' ? value : undefined;
}

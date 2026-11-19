import type { AcademicNotificationChannel } from './types';
import type { CommunicationCampaignStatus } from '../communication/communicationTypes';

export enum AcademicDispatchStatus {
  Pending,
  Processing,
  ProviderAccepted,
  Delivered,
  Read,
  Failed,
  Skipped,
  UnknownAcceptance,
}

export interface AcademicNotificationSource {
  eventKey: string;
  sourceType: string;
  sourceId: string;
}

export interface AcademicNotificationOperation {
  operationId: string;
  status: CommunicationCampaignStatus;
}

export interface AcademicNotificationOperationStatus extends AcademicNotificationSource, AcademicNotificationOperation {
  approvalRequired: boolean;
  createdAt: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  approvedAt: string | null;
  deliveries: { channel: AcademicNotificationChannel; status: AcademicDispatchStatus; count: number }[];
  intents: { status: number; reasonCode: string | null; count: number }[];
  excludedBeforeDispatch: number;
}

export interface AcademicNotificationHistoryItem {
  operationId: string;
  dispatchId: string | null;
  attemptId: string | null;
  recipientSnapshotId: string | null;
  recipientKind: string | null;
  channel: AcademicNotificationChannel | null;
  status: AcademicDispatchStatus;
  attemptNumber: number | null;
  recordedAt: string;
  acceptedAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  reasonCode: string | null;
}

export interface AcademicNotificationCancellation extends AcademicNotificationOperation {
  cancelledIntents: number;
  cancelledDispatches: number;
  remainingInFlight: number;
}

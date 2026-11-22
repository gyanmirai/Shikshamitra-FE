import type { AcademicNotificationReview } from './manual-types';
import type { CommunicationCampaignStatus } from '../communication/communicationTypes';
import type { AcademicNotificationChannel, AcademicNotificationQueueStatus } from './types';

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

export interface AcademicNotificationRecentDelivery extends AcademicNotificationSource {
  operationId: string;
  createdAt: string;
  canViewSummary: boolean;
}

export interface AcademicNotificationRecentDeliveries {
  items: AcademicNotificationRecentDelivery[];
  nextCursor: string | null;
}

export interface AcademicNotificationOperation extends AcademicNotificationQueueStatus {
  operationId: string;
  status: CommunicationCampaignStatus;
}

export interface AcademicNotificationOperationStatus extends AcademicNotificationSource, AcademicNotificationOperation {
  approvalRequired: boolean;
  isSynthetic?: boolean;
  canReviewApproval?: boolean;
  approvalRejected?: boolean;
  createdAt: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  approvedAt: string | null;
  deliveries: { channel: AcademicNotificationChannel; status: AcademicDispatchStatus; count: number }[];
  intents: { status: number; reasonCode: string | null; count: number }[];
  excludedBeforeDispatch: number;
}

export type AcademicNotificationApprovalReview = Pick<
  AcademicNotificationReview, 'eligibleRecipientCount' | 'channels' | 'samples' | 'blockingIssues'
> & { canApprove: boolean };

export interface AcademicNotificationPendingApprovals {
  items: { operationId: string; eventKey: string; createdAt: string; eligibleRecipientCount: number }[];
  nextAfterId: string | null;
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
  canRequestRetry?: boolean;
}

export interface AcademicNotificationRetry {
  dispatchId: string;
  operationId: string;
  status: AcademicDispatchStatus;
  nextAttemptAt: string;
}

export interface AcademicNotificationCancellation extends AcademicNotificationOperation {
  cancelledIntents: number;
  cancelledDispatches: number;
  remainingInFlight: number;
}

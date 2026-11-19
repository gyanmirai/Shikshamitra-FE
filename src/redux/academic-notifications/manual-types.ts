import type { AcademicNotificationChannel } from './types';
import type { AcademicNotificationSource } from './delivery-types';
import type { AcademicNotificationTemplatePreview } from './template-types';

export interface AcademicNotificationRecipient {
  kind: string;
  studentId?: string;
  familyRelationship?: string;
  userId?: string;
  employeeId?: string;
}

export interface PreviewAcademicNotification extends AcademicNotificationSource {
  selectedRecipients: AcademicNotificationRecipient[];
  channels: AcademicNotificationChannel[];
  templateId?: string;
}

export interface AcademicNotificationReview {
  reviewToken: string | null;
  expiresAt: string | null;
  eligibleRecipientCount: number;
  requiresApproval: boolean;
  channels: {
    channel: AcademicNotificationChannel;
    eligibleRecipientCount: number;
    readyDeliveryCount: number;
    exclusions: { code: string; count: number }[];
  }[];
  samples: {
    templateId: string;
    revisionId: string;
    recipientKind: string;
    channel: AcademicNotificationChannel;
    languageCode: string;
    isSynthetic: boolean;
    rendered: AcademicNotificationTemplatePreview['rendered'];
  }[];
  blockingIssues: string[];
}

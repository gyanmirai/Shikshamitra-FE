import type { AcademicNotificationSource } from './delivery-types';
import type { AcademicNotificationTemplatePreview } from './template-types';
import type { AcademicNotificationChannel, AcademicNotificationQueueStatus } from './types';

export interface AcademicNotificationRecipient {
  kind: string;
  studentId?: string;
  familyRelationship?: string;
  userId?: string;
  employeeId?: string;
}

export interface Student360NotificationAudience {
  academicMediumId: string | null;
  primaryGuardianNotConfigured?: boolean;
  family: { relationship: 'father' | 'mother' | 'guardian' | 'self'; isPrimary: boolean }[];
  staff: AcademicNotificationRecipient[];
}

export interface PreviewAcademicNotification extends AcademicNotificationSource {
  selectedRecipients: AcademicNotificationRecipient[];
  channels: AcademicNotificationChannel[];
  templateId?: string;
  selectedFamilyRelationships?: string[];
}

export interface AcademicNotificationReview extends AcademicNotificationQueueStatus {
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

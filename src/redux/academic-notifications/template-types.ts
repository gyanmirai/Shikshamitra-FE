import type { PublishedNotificationTemplateOption } from './types';

export interface AcademicNotificationTemplate extends PublishedNotificationTemplateOption {
  eventKey: string;
  revision: number;
  subject: string;
  body: string;
  schemaVersion: number;
  contentHash: string;
  isPublished: boolean;
  isRetired: boolean;
  isCurrent: boolean;
  concurrencyStamp: string;
  headerConcurrencyStamp: string;
  publishedAt: string | null;
  publishedByUserId: string | null;
  isDeleted: boolean;
}

export type CreateAcademicNotificationTemplate = Omit<PublishedNotificationTemplateOption, 'templateId' | 'revisionId'> & {
  eventKey: string;
  subject: string;
  body: string;
  existingTemplateId?: string;
  headerConcurrencyStamp?: string;
};

export interface AcademicNotificationTemplateRevisionCommand {
  revisionId: string;
  concurrencyStamp: string;
}

export interface AcademicNotificationTemplatePreview {
  isSynthetic: true;
  rendered: {
    isSuccess: boolean;
    errorCode: string | null;
    subject: string | null;
    body: string | null;
    linkUrl: string | null;
    contentHash: string | null;
  };
}

export interface AcademicNotificationTemplateTest {
  operationId: string;
  status: number;
  channel: PublishedNotificationTemplateOption['channel'];
  isSynthetic: true;
}

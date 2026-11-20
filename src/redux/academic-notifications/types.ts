import type { CommunicationChannelType } from '../communication/communicationTypes';

export type AcademicNotificationChannel = Exclude<CommunicationChannelType, CommunicationChannelType.Sms>;
export type AcademicNotificationGuardianMode = 0 | 1;

export interface AcademicNotificationCacheIdentity {
  tenantCacheKey: string;
  userCacheKey: string;
}

export interface AcademicNotificationScope {
  academicYearId?: string | null;
  boardId?: string | null;
  mediumId?: string | null;
  classId?: string | null;
  divisionId?: string | null;
}

export interface AcademicNotificationEvent {
  definition: {
    eventKey: string;
    category: string;
    sourceType: string;
    linkBuilderKey: string;
    schemaVersion: number;
    triggerType: 0 | 1 | 2;
    deliveryProfile: 0 | 1 | 2 | 3 | 4 | 5;
    recipientSelectors: string[];
    supportedChannels: AcademicNotificationChannel[];
    variables: { key: string; type: 0 | 1 | 2 | 3 | 4; required: boolean; sensitivity: 0 | 1 | 2 }[];
    materialChangeFields: string[];
    allowsQuietHoursBypass: boolean;
  };
  availability: { isAvailable: boolean; reasonCode: string | null };
  availabilityDetail?: string | null;
  manualAvailability?: AcademicNotificationEvent['availability'];
}

export interface AcademicNotificationCatalogue {
  events: AcademicNotificationEvent[];
  channels: { channel: AcademicNotificationChannel; isConfigured: boolean }[];
}

export interface PublishedNotificationTemplateOption {
  templateId: string;
  revisionId: string;
  templateName: string;
  recipientKind: string;
  channel: AcademicNotificationChannel;
  languageCode: string;
  academicMediumId: string | null;
}

interface AcademicNotificationRuleAudience {
  guardianMode?: AcademicNotificationGuardianMode;
  additionalGuardianRelationships?: string[];
  includeStudentAccount?: boolean;
  staffAudienceSelectors?: string[];
}

interface AcademicNotificationRuleTiming {
  delayMinutes: number;
  reminderSchoolDaysBefore: number;
  reminderLocalTime: string;
  weeklySummaryDay?: number;
  reviewerEscalationMinutes?: number | null;
  progressMilestonePercentage?: number | null;
  quietHoursEnabled: boolean;
  quietStart: string;
  quietEnd: string;
  bypassQuietHours: boolean;
}

export interface AcademicNotificationRule {
  id: string;
  eventKey: string;
  scope: AcademicNotificationScope;
  enabled: boolean;
  revision: number;
  concurrencyStamp: string;
  configuration: (Required<AcademicNotificationRuleAudience> & {
    schemaVersion: number;
    channels: AcademicNotificationChannel[];
    templateIds: string[];
    timing: AcademicNotificationRuleTiming;
    fallbackLanguage: string;
  }) | null;
}

export interface AcademicNotificationRuleListItem {
  eventKey: string;
  requestedScope: AcademicNotificationScope;
  effectiveRule: AcademicNotificationRule | null;
  isInherited: boolean;
}

export interface AcademicNotificationRulesQuery extends AcademicNotificationCacheIdentity {
  scope: AcademicNotificationScope;
  eventKey?: string;
  skipCount: number;
  maxResultCount: number;
}

export interface SaveAcademicNotificationRule extends AcademicNotificationRuleAudience {
  eventKey: string;
  scope: AcademicNotificationScope;
  enabled: boolean;
  channels?: AcademicNotificationChannel[];
  templateIds?: string[];
  timing?: Partial<Pick<AcademicNotificationRuleTiming,
    'delayMinutes' | 'reminderSchoolDaysBefore' | 'reminderLocalTime' | 'reviewerEscalationMinutes' | 'progressMilestonePercentage' | 'weeklySummaryDay'>>;
  quietHours?: { enabled?: boolean; start?: string | null; end?: string | null; bypass?: boolean };
  fallbackLanguage?: string;
  concurrencyStamp?: string | null;
}

export enum CommunicationChannelType {
  WhatsApp = 0,
  Sms = 1,
  Email = 2,
  InApp = 3,
}

export enum CommunicationProviderStatus {
  Disabled = 0,
  Enabled = 1,
  Suspended = 2,
}

export enum CommunicationDeliveryStatus {
  Queued = 0,
  Sent = 1,
  Delivered = 2,
  Read = 3,
  Failed = 4,
  Bounced = 5,
  Replied = 6,
  Acknowledged = 7,
  Skipped = 8,
}

export enum CommunicationReplyStatus {
  Open = 0,
  Assigned = 1,
  Resolved = 2,
  Archived = 3,
}

export enum CommunicationTemplateApprovalStatus {
  Draft = 0,
  PendingApproval = 1,
  Approved = 2,
  Rejected = 3,
  Retired = 4,
}

export enum CommunicationImportanceLevel {
  Normal = 0,
  Urgent = 1,
  Critical = 2,
}

export enum CommunicationCampaignStatus {
  Draft = 0,
  PendingApproval = 1,
  Approved = 2,
  Scheduled = 3,
  Queued = 4,
  Sending = 5,
  Sent = 6,
  PartiallyFailed = 7,
  Failed = 8,
  Cancelled = 9,
}

export enum CommunicationSourceModule {
  Manual = 0,
  Student = 1,
  HR = 2,
  Finance = 3,
  Transport = 4,
  Calendar = 5,
  Academic = 6,
  Library = 7,
  Hostel = 8,
  System = 9,
}

export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
}

export interface CommunicationAttachmentDto {
  name: string;
  url: string;
  contentType?: string | null;
  sizeInBytes?: number | null;
}

export interface CommunicationAudienceFilterDto {
  field: string;
  operator: string;
  value: string;
}

export interface CommunicationExplicitRecipientDto {
  recipientType: string;
  recipientId?: string | null;
  userId?: string | null;
  displayName: string;
  email?: string | null;
  mobileNumber?: string | null;
  preferredLanguageCode: string;
  isParentDefault: boolean;
}

export interface CommunicationAudienceDefinitionDto {
  groupIds: string[];
  organizationIds: string[];
  classIds: string[];
  divisionIds: string[];
  studentIds: string[];
  parentGuardianIds: string[];
  employeeIds: string[];
  userIds: string[];
  roles: string[];
  filters: CommunicationAudienceFilterDto[];
  explicitRecipients: CommunicationExplicitRecipientDto[];
  parentsFirst: boolean;
  includeStudentsWhenEligible: boolean;
}

export interface CommunicationCampaignDto {
  id: string;
  academicMediumId?: string | null;
  academicYearId?: string | null;
  sourceModule: CommunicationSourceModule;
  sourceEntityType?: string | null;
  sourceEntityId?: string | null;
  sourceReference?: string | null;
  campaignType: string;
  title: string;
  subject?: string | null;
  body: string;
  importanceLevel: CommunicationImportanceLevel;
  status: CommunicationCampaignStatus;
  approvalRequired: boolean;
  templateId?: string | null;
  announcementTypeId?: string | null;
  channels: CommunicationChannelType[];
  fallbackOrder: CommunicationChannelType[];
  attachments: CommunicationAttachmentDto[];
  linkUrl?: string | null;
  languageCode: string;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  recipientCount: number;
  eligibleRecipientCount: number;
  blockedRecipientCount: number;
  queuedCount: number;
  deliveredCount: number;
  failedCount: number;
}

export interface CalendarCommunicationRequestDto {
  campaignType?: string;
  templateId?: string | null;
  subject?: string | null;
  body?: string | null;
  importanceLevel?: CommunicationImportanceLevel;
  approvalRequired?: boolean;
  audienceDefinition?: Partial<CommunicationAudienceDefinitionDto>;
  includeSourceAudience?: boolean;
  channels?: CommunicationChannelType[];
  fallbackOrder?: CommunicationChannelType[];
  attachments?: CommunicationAttachmentDto[];
  linkUrl?: string | null;
  languageCode?: string;
  scheduledAt?: string | null;
  requiresAcknowledgement?: boolean;
  publishImmediately?: boolean;
}

export interface CalendarCommunicationResultDto {
  campaign: CommunicationCampaignDto;
  published: boolean;
  approvalRequired: boolean;
  sourceEntityType: string;
  sourceEntityId: string;
}

export interface CommunicationDashboardDto {
  totalCampaigns: number;
  draftCampaigns: number;
  pendingApprovalCampaigns: number;
  queuedCampaigns: number;
  sentCampaigns: number;
  failedCampaigns: number;
  openReplies: number;
  enabledProviders: number;
  consentOptInCount: number;
  consentOptOutCount: number;
  deliveryAttemptCount: number;
  deliveryFailureCount: number;
  estimatedCost: number;
  recentUsage: UsageLedgerEntryDto[];
}

export interface ChannelProviderSettingDto {
  id: string;
  channel: CommunicationChannelType;
  providerName: string;
  senderId?: string | null;
  isEnabled: boolean;
  isDefault: boolean;
  configurationJson?: string | null;
  secretReference?: string | null;
  fallbackOrder: CommunicationChannelType[];
  dailyQuota?: number | null;
  monthlyQuota?: number | null;
  consentRequired: boolean;
  templateApprovalRequired: boolean;
  status: CommunicationProviderStatus;
}

export interface ProviderSettingFormValues {
  channel: CommunicationChannelType;
  providerName: string;
  senderId: string;
  isEnabled: boolean;
  isDefault: boolean;
  consentRequired: boolean;
  templateApprovalRequired: boolean;
  fallbackOrder: CommunicationChannelType[];
  dailyQuota: string;
  monthlyQuota: string;
  secretReference: string;
  status: CommunicationProviderStatus;
}

export interface DeliveryAttemptDto {
  id: string;
  campaignId: string;
  recipientSnapshotId?: string | null;
  channel: CommunicationChannelType;
  destination: string;
  status: CommunicationDeliveryStatus;
  providerName?: string | null;
  providerMessageId?: string | null;
  attemptNumber: number;
  errorCode?: string | null;
  errorMessage?: string | null;
  queuedAt?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  estimatedCost?: number | null;
  currencyCode: string;
}

export interface CommunicationReplyDto {
  id: string;
  campaignId?: string | null;
  deliveryAttemptId?: string | null;
  recipientSnapshotId?: string | null;
  channel: CommunicationChannelType;
  fromAddress: string;
  body: string;
  receivedAt: string;
  assignedToUserId?: string | null;
  assignedDepartment?: string | null;
  status: CommunicationReplyStatus;
  internalNotes?: string | null;
}

export interface UsageLedgerEntryDto {
  id: string;
  campaignId?: string | null;
  channel: CommunicationChannelType;
  providerName: string;
  usageDate: string;
  attemptCount: number;
  deliveredCount: number;
  failedCount: number;
  estimatedCost: number;
  currencyCode: string;
}

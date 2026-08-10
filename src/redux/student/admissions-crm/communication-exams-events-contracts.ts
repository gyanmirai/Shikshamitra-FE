import type { FetchArgs } from '@reduxjs/toolkit/query';

import {
  AdmissionCrmListParams,
  AdmissionCrmReviewRecommendation,
  AdmissionInquiryStage,
} from './core-leads-contracts';

import { AdmissionCrmEventRegistrationDto } from './registration-documents-contracts';

import { AdmissionCrmAssessmentComponentType } from './setup-playbooks-contracts';

export enum AdmissionCrmExamAttendanceStatus {
  NotMarked = 0,
  Present = 1,
  Absent = 2,
  NoShow = 3,
  Excused = 4,
}

export enum AdmissionCrmEligibilityDecision {
  Pending = 0,
  Eligible = 1,
  Waitlisted = 2,
  Rejected = 3,
}

export enum EntranceExamStatusEnum {
  Pending = 0,
  Pass = 1,
  Fail = 2,
  Absent = 3,
}

export enum AdmissionCrmEventType {
  CampusVisit = 0,
  OpenHouse = 1,
  Counselling = 2,
  Orientation = 3,
  Other = 4,
}

export enum AdmissionCrmEventStatus {
  Draft = 0,
  Published = 1,
  Cancelled = 2,
  Completed = 3,
}

export enum AdmissionCrmStructuredReviewStatus {
  InReview = 0,
  ReadyForDecision = 1,
  Closed = 2,
  Cancelled = 3,
}

export enum AdmissionCrmReviewAssignmentStatus {
  Assigned = 0,
  Submitted = 1,
  Recused = 2,
  Cancelled = 3,
}

export enum AdmissionCrmExamReadinessField {
  None = 0,
  Contact = 1,
  AdmissionIntent = 2,
  DesiredClass = 4,
  StudentName = 8,
  ParentGuardianName = 16,
  InquirySource = 32,
}

export enum AdmissionCrmMessageChannel {
  WhatsApp = 0,
  Sms = 1,
  Email = 2,
}

export enum AdmissionCrmMessageTemplateStatus {
  Draft = 0,
  Approved = 1,
  Retired = 2,
}

export enum AdmissionCrmTimelineEventType {
  LeadCreated = 0,
  PublicFormSubmitted = 1,
  OwnerAssigned = 2,
  ScoreUpdated = 3,
  DuplicateContinued = 4,
  DuplicateMerged = 5,
  TaskCreated = 6,
  TaskCompleted = 7,
  MarkedStale = 8,
  Archived = 9,
  Reopened = 10,
  ExamScheduled = 11,
  ExamAttendanceMarked = 12,
  ExamResultRecorded = 13,
  EligibilityDecided = 14,
  MessageTemplateChanged = 15,
  AutomationFailed = 16,
  StageChanged = 17,
  NoteAdded = 18,
  PriorityChanged = 19,
  RegistrationFormIssued = 20,
  ApplicantChecklistUpdated = 21,
  RegistrationOpened = 22,
  RegistrationSaved = 23,
  RegistrationSubmitted = 24,
  RegistrationReturnedForCorrection = 25,
  RegistrationVerified = 26,
  RegistrationLinkExtended = 27,
  RegistrationLinkRevoked = 28,
  RegistrationLinkReissued = 29,
  RegistrationPaymentReferenceRecorded = 30,
  RegistrationFeeWaived = 31,
  DocumentChecklistAssigned = 32,
  DocumentUploaded = 33,
  DocumentReviewStarted = 34,
  DocumentVerified = 35,
  DocumentRejected = 36,
  DocumentWaived = 37,
  DocumentOriginalSeen = 38,
  AdmissionReadinessConfirmed = 39,
  AdmissionReadinessOverridden = 40,
  AdmissionReadinessApprovalRecorded = 41,
  SeatPoolConfigured = 42,
  SeatReserved = 43,
  SeatReleased = 44,
  OfferCreated = 45,
  OfferSubmittedForApproval = 46,
  OfferApproved = 47,
  OfferIssued = 48,
  OfferAccepted = 49,
  OfferDeclined = 50,
  OfferExpired = 51,
  OfferRevoked = 52,
  Waitlisted = 53,
  WaitlistPromoted = 54,
  AdmissionDecisionRecorded = 55,
  WaitlistPromotionOverridden = 56,
  PolicyPackAdopted = 57,
  PolicyEvaluated = 58,
  PolicyExceptionRequested = 59,
  PolicyExceptionDecided = 60,
  ActivationRequested = 61,
  ActivationApproved = 62,
  StudentActivated = 63,
  ActivationRepairRequired = 64,
  ActivationRepairCompleted = 65,
  IdentifierAllocated = 66,
  AdmissionRouteAssigned = 67,
  AdmissionRouteChanged = 68,
  AdmissionRouteEvaluated = 69,
  ActivationCancellationRequested = 70,
  ActivationCancelled = 71,
  AdmissionRouteAppealed = 72,
  AdmissionRouteAppealDecided = 73,
  GovernmentAllotmentImported = 74,
  OfferOpened = 75,
  OfferSuperseded = 76,
  ServiceHandoffRequested = 77,
  ServiceHandoffChanged = 78,
  PrivacyRequestCreated = 79,
  PrivacyRequestDecided = 80,
  PrivacyRequestCompleted = 81,
  SensitiveExportCreated = 82,
  SensitiveExportDownloaded = 83,
  WorkDelegationChanged = 84,
}

export type AdmissionCrmExamComponentDto = {
  code: string;
  name: string;
  componentType: AdmissionCrmAssessmentComponentType;
  maximumMarks: number;
  minimumMarks?: number | null;
  weightPercentage: number;
  isMandatory: boolean;
  scorePrecision: number;
};

export type AdmissionCrmExamResultRuleDto = {
  aggregatePassingPercentage: number;
  requireMandatoryComponentPass: boolean;
  meritCapacity?: number | null;
  waitlistCapacity?: number | null;
  tieBreakerCodes: string[];
};

export type AdmissionCrmExamDefinitionDto = {
  code: string;
  name: string;
  roundCode?: string | null;
  campus?: string | null;
  desiredClass?: string | null;
  board?: string | null;
  medium?: string | null;
  durationMinutes: number;
  hallTicketEnabled: boolean;
  instructions?: string | null;
  components: AdmissionCrmExamComponentDto[];
  resultRule: AdmissionCrmExamResultRuleDto;
};

export type PreviewAdmissionCrmExamResultDto = {
  examDefinitionCode: string;
  componentScores: Record<string, number>;
};

export type AdmissionCrmExamComponentResultPreviewDto = {
  componentCode: string;
  score: number;
  maximumMarks: number;
  percentage: number;
  weightedContribution: number;
  passedMinimum: boolean;
};

export type AdmissionCrmExamResultPreviewDto = {
  examDefinitionCode: string;
  weightedPercentage: number;
  mandatoryComponentsPassed: boolean;
  passed: boolean;
  outcome: string;
  decisionReasons: string[];
  tieBreakerCodes: string[];
  components: AdmissionCrmExamComponentResultPreviewDto[];
};

export type AdmissionCrmMessageTemplateDto = {
  id: string;
  academicYearId: string;
  templateName: string;
  channel: AdmissionCrmMessageChannel;
  purpose: string;
  subject?: string | null;
  body: string;
  variables: string[];
  status: AdmissionCrmMessageTemplateStatus;
  isActive: boolean;
};

export type AdmissionCrmMessageTemplateListParams = AdmissionCrmListParams & {
  filterText?: string;
  channel?: AdmissionCrmMessageChannel;
  status?: AdmissionCrmMessageTemplateStatus;
  isActive?: boolean;
};

export type AdmissionCrmTimelineEventDto = {
  id: string;
  leadId: string;
  academicYearId: string;
  eventType: AdmissionCrmTimelineEventType;
  title: string;
  details?: string | null;
  relatedEntityId?: string | null;
  actorUserId?: string | null;
  occurredAt: string;
};

export type AdmissionCrmEntranceExamDto = {
  id: string;
  academicYearId: string;
  leadId: string;
  applicantNumber: number;
  applicantName: string;
  entranceExamSlotId: string;
  slotNameSnapshot?: string | null;
  examStartTime: string;
  examEndTime: string;
  examRoomNo: number;
  capacityOverrideUsed: boolean;
  capacityOverrideReason?: string | null;
  scheduledAt: string;
  attendanceStatus: AdmissionCrmExamAttendanceStatus;
  attendanceMarkedAt?: string | null;
  totalMarks?: number | null;
  passingMarks?: number | null;
  obtainedMarks?: number | null;
  percentage?: number | null;
  examStatus: EntranceExamStatusEnum;
  resultRecordedAt?: string | null;
  meritRank?: number | null;
  eligibilityDecision: AdmissionCrmEligibilityDecision;
  eligibilityDecisionReason?: string | null;
  eligibilityOverrideUsed: boolean;
  eligibilityOverrideReason?: string | null;
  eligibilityDecidedAt?: string | null;
};

export type AdmissionCrmEventDto = {
  id: string;
  academicYearId: string;
  title: string;
  eventType: AdmissionCrmEventType;
  startsAt: string;
  endsAt: string;
  location: string;
  capacity: number;
  reservedCount: number;
  availableCount: number;
  ownerUserId?: string | null;
  instructions?: string | null;
  allowFamilySelfScheduling: boolean;
  status: AdmissionCrmEventStatus;
  publishedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  registrations: AdmissionCrmEventRegistrationDto[];
};

export type AdmissionCrmEventUpsertDto = {
  title: string;
  eventType: AdmissionCrmEventType;
  startsAt: string;
  endsAt: string;
  location: string;
  capacity: number;
  ownerUserId?: string;
  instructions?: string;
  allowFamilySelfScheduling?: boolean;
};

export type AdmissionCrmReviewCriterionDto = {
  id?: string;
  key: string;
  label: string;
  maximumScore: number;
  isRequired: boolean;
  displayOrder: number;
};

export type AdmissionCrmReviewConfigurationDto = {
  id?: string;
  academicYearId: string;
  isEnabled: boolean;
  title: string;
  requiredCompletedReviews: number;
  requireConflictDeclaration: boolean;
  version: number;
  criteria: AdmissionCrmReviewCriterionDto[];
};

export type UpdateAdmissionCrmReviewConfigurationDto = Omit<
  AdmissionCrmReviewConfigurationDto,
  'id' | 'academicYearId' | 'version' | 'criteria'
> & {
  criteria: Array<Omit<AdmissionCrmReviewCriterionDto, 'id' | 'displayOrder'>>;
};

export type AdmissionCrmReviewAssignmentDto = {
  id: string;
  reviewId: string;
  leadId: string;
  reviewTitle: string;
  reviewStatus: AdmissionCrmStructuredReviewStatus;
  reviewerUserId: string;
  isCurrentReviewer: boolean;
  dueAt: string;
  status: AdmissionCrmReviewAssignmentStatus;
  assignedAt: string;
  hasDeclaredConflict?: boolean | null;
  conflictReason?: string | null;
  conflictDeclaredAt?: string | null;
  recommendation?: AdmissionCrmReviewRecommendation | null;
  confidentialRecommendation?: string | null;
  scores?: Record<string, number | null> | null;
  submittedAt?: string | null;
  criteria: AdmissionCrmReviewCriterionDto[];
};

export type AdmissionCrmStructuredReviewDto = {
  id: string;
  academicYearId: string;
  leadId: string;
  configurationVersion: number;
  title: string;
  requiredCompletedReviews: number;
  submittedReviewCount: number;
  requireConflictDeclaration: boolean;
  status: AdmissionCrmStructuredReviewStatus;
  startedAt: string;
  readyAt?: string | null;
  closedAt?: string | null;
  closureReason?: string | null;
  criteria: AdmissionCrmReviewCriterionDto[];
  assignments: AdmissionCrmReviewAssignmentDto[];
};

export const buildAdmissionCrmEventListRequest = ({
  academicYearId,
  ...params
}: {
  academicYearId: string;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
  filterText?: string;
  eventType?: AdmissionCrmEventType;
  status?: AdmissionCrmEventStatus;
  startsFrom?: string;
  startsUntil?: string;
}) => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/events`,
  params,
});

export const buildCreateAdmissionCrmEventRequest = ({
  academicYearId,
  body,
}: {
  academicYearId: string;
  body: AdmissionCrmEventUpsertDto;
}) => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/events`,
  method: 'POST',
  body,
});

export const buildReserveAdmissionCrmEventRequest = ({
  eventId,
  leadId,
  notes,
}: {
  eventId: string;
  leadId: string;
  notes?: string;
}) => ({
  url: `/student-enrollment/admissions-crm/events/${eventId}/registrations`,
  method: 'POST',
  body: { leadId, notes },
});

export type AdmissionCrmEligibilityHandoffDto = {
  academicYearId: string;
  leadId: string;
  examRecordId: string;
  applicantNumber: number;
  canStartAdmission: boolean;
  requiresManualReview: boolean;
  missingAdmissionFields: string[];
  applicantName: string;
  dateOfBirth?: string | null;
  parentGuardianName?: string | null;
  primaryContactNo?: string | null;
  email?: string | null;
  admissionIntent: string;
  targetStandardId?: string | null;
  desiredClassName?: string | null;
  inquirySourceId?: string | null;
  inquirySourceSnapshot?: string | null;
  leadStage: AdmissionInquiryStage;
  attendanceStatus: AdmissionCrmExamAttendanceStatus;
  examStatus: EntranceExamStatusEnum;
  totalMarks?: number | null;
  passingMarks?: number | null;
  obtainedMarks?: number | null;
  percentage?: number | null;
  meritRank?: number | null;
  eligibilityDecision: AdmissionCrmEligibilityDecision;
  eligibilityDecisionReason?: string | null;
  eligibilityOverrideUsed: boolean;
  eligibilityOverrideReason?: string | null;
  resultRecordedAt?: string | null;
  eligibilityDecidedAt?: string | null;
};

export type AdmissionCrmExamAnalyticsDto = {
  scheduledCount: number;
  presentCount: number;
  absentCount: number;
  notMarkedCount: number;
  passCount: number;
  failCount: number;
  eligibleCount: number;
  waitlistedCount: number;
  rejectedCount: number;
  meritRankedCount: number;
  capacityOverrideCount: number;
  eligibilityOverrideCount: number;
  attendanceRate: number;
  passRate: number;
  eligibilityRate: number;
  waitlistRate: number;
  rejectionRate: number;
  averagePercentage: number;
  highestPercentage?: number | null;
  lowestPercentage?: number | null;
  slotCount: number;
  totalSlotCapacity: number;
  overCapacitySlotCount: number;
  slotUtilizationRate: number;
  classPerformance: AdmissionCrmExamClassPerformanceDto[];
};

export type AdmissionCrmExamClassPerformanceDto = {
  targetStandardId?: string | null;
  className: string;
  scheduledCount: number;
  presentCount: number;
  absentCount: number;
  passCount: number;
  failCount: number;
  eligibleCount: number;
  waitlistedCount: number;
  rejectedCount: number;
  meritRankedCount: number;
  attendanceRate: number;
  passRate: number;
  eligibilityRate: number;
  averagePercentage: number;
};

export type AdmissionCrmEntranceExamListParams = AdmissionCrmListParams & {
  filterText?: string;
  applicantSearch?: string;
  examStartFrom?: string;
  examStartUntil?: string;
  attendanceStatus?: AdmissionCrmExamAttendanceStatus;
  examStatus?: EntranceExamStatusEnum;
  eligibilityDecision?: AdmissionCrmEligibilityDecision;
};

export type AdmissionCrmCommunicationProviderDto = {
  id: string;
  academicYearId: string;
  channel: AdmissionCrmMessageChannel;
  status: string;
  isEnabled: boolean;
  providerName?: string | null;
  senderId?: string | null;
  settings: AdmissionCrmCommunicationProviderSettingsDto;
  webhookUrl?: string | null;
  lastValidatedAt?: string | null;
};

export type AdmissionCrmCommunicationProviderSettingsDto = {
  adapter: string;
  payloadMode: string;
  responseProviderMessageIdPath?: string | null;
  headers: Record<string, string>;
  parameters: Record<string, string>;
  callbackSecret?: string | null;
  hasStoredHeaderValues?: boolean;
  hasStoredParameterValues?: boolean;
  hasCallbackSecret?: boolean;
  callbackMappings: {
    statusPath?: string | null;
    statusDetailsPath?: string | null;
    providerMessageIdPath?: string | null;
    callbackSecretPath?: string | null;
  };
};

export type UpdateAdmissionCrmCommunicationProviderDto = {
  isEnabled: boolean;
  providerName?: string | null;
  senderId?: string | null;
  settings: AdmissionCrmCommunicationProviderSettingsDto;
  webhookUrl?: string | null;
  lastValidatedAt?: string | null;
};

export type AdmissionCrmCommunicationOptOutDto = {
  id: string;
  academicYearId: string;
  leadId?: string | null;
  channel: AdmissionCrmMessageChannel;
  contactValue: string;
  normalizedContactValue: string;
  isActive: boolean;
  reason: string;
  optedOutAt: string;
  optedInAt?: string | null;
  optInReason?: string | null;
};

export type AdmissionCrmCommunicationOptOutListParams = AdmissionCrmListParams & {
  leadId?: string;
  channel?: AdmissionCrmMessageChannel;
  isActive?: boolean;
  contactSearch?: string;
};

export type AdmissionCrmMessageDeliveryLogDto = {
  id: string;
  academicYearId: string;
  leadId?: string | null;
  templateId?: string | null;
  channel: AdmissionCrmMessageChannel;
  recipient: string;
  normalizedRecipient: string;
  providerName?: string | null;
  providerMessageId?: string | null;
  subjectSnapshot?: string | null;
  bodySnapshot: string;
  status: string;
  statusDetails: string;
  attemptCount: number;
  createdAt: string;
  lastAttemptAt?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
};

export type AdmissionCrmMessageDeliveryLogListParams = AdmissionCrmListParams & {
  leadId?: string;
  templateId?: string;
  channel?: AdmissionCrmMessageChannel;
  status?: string;
  providerMessageId?: string;
};

export type SendAdmissionCrmMessageTemplateDto = {
  templateId: string;
  recipientOverride?: string | null;
  variables?: Record<string, string>;
};

export type PreviewAdmissionCrmMessageTemplateDto = {
  templateId: string;
  leadId?: string | null;
  variables?: Record<string, string>;
};

export type AdmissionCrmMessageTemplatePreviewDto = {
  templateId: string;
  leadId?: string | null;
  channel: AdmissionCrmMessageChannel;
  renderedSubject?: string | null;
  renderedBody: string;
  resolvedVariables: Record<string, string>;
  unresolvedVariables: string[];
};

export type ApplyAdmissionCrmDeliveryCallbackDto = {
  status?: string;
  statusDetails?: string | null;
  providerMessageId?: string | null;
  callbackSecret?: string;
  payload?: Record<string, unknown>;
};

export const buildAdmissionCrmExamListRequest = ({
  academicYearId,
  ...params
}: { academicYearId: string } & AdmissionCrmEntranceExamListParams): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/exams`,
  method: 'GET',
  params,
});

export const buildAdmissionCrmMessageTemplateListRequest = ({
  academicYearId,
  ...params
}: { academicYearId: string } & AdmissionCrmMessageTemplateListParams): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/message-templates`,
  method: 'GET',
  params,
});

export const buildPreviewAdmissionCrmExamResultRequest = ({
  playbookId,
  body,
}: {
  playbookId: string;
  body: PreviewAdmissionCrmExamResultDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/configuration/playbooks/${playbookId}/exam-results/preview`,
  method: 'POST',
  body,
});

export const buildAdmissionCrmCommunicationProvidersRequest = ({
  academicYearId,
}: {
  academicYearId: string;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/communication/providers`,
  method: 'GET',
});

export const buildUpdateAdmissionCrmCommunicationProviderRequest = ({
  academicYearId,
  channel,
  body,
}: {
  academicYearId: string;
  channel: AdmissionCrmMessageChannel;
  body: UpdateAdmissionCrmCommunicationProviderDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/communication/providers/${channel}`,
  method: 'PUT',
  body,
});

export const buildAdmissionCrmCommunicationOptOutListRequest = ({
  academicYearId,
  ...params
}: { academicYearId: string } & AdmissionCrmCommunicationOptOutListParams): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/communication/opt-outs`,
  method: 'GET',
  params,
});

export const buildSendAdmissionCrmTemplateMessageRequest = ({
  leadId,
  body,
}: {
  leadId: string;
  body: SendAdmissionCrmMessageTemplateDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/messages/send-template`,
  method: 'POST',
  body,
});

export const buildPreviewAdmissionCrmMessageTemplateRequest = ({
  academicYearId,
  body,
}: {
  academicYearId: string;
  body: PreviewAdmissionCrmMessageTemplateDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/communication/message-templates/preview`,
  method: 'POST',
  body,
});

export const buildAdmissionCrmMessageDeliveryLogListRequest = ({
  academicYearId,
  ...params
}: { academicYearId: string } & AdmissionCrmMessageDeliveryLogListParams): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/communication/delivery-logs`,
  method: 'GET',
  params,
});

export const buildScheduleAdmissionCrmExamRequest = ({
  leadId,
  body,
}: {
  leadId: string;
  body: { entranceExamSlotId: string; overrideCapacity?: boolean; capacityOverrideReason?: string };
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/exam/schedule`,
  method: 'POST',
  body,
});

export const buildBulkAdmissionCrmExamResultsRequest = ({
  academicYearId,
  items,
}: {
  academicYearId: string;
  items: Array<{
    examRecordId: string;
    totalMarks: number;
    passingMarks: number;
    obtainedMarks: number;
    meritRank?: number;
    correctionReason?: string;
  }>;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/bulk/exam-results`,
  method: 'POST',
  body: { items },
});

export enum AdmissionCrmRouteEligibilityStatus {
  PendingReview = 0,
  EvidencePending = 1,
  Eligible = 2,
  Ineligible = 3,
  ExceptionApproved = 4,
  Withdrawn = 5,
  Superseded = 6,
}

export type AdmissionCrmExamSlotDto = {
  id: string;
  academicYearId: string;
  playbookId?: string | null;
  slotTemplateCode?: string | null;
  examDefinitionCode?: string | null;
  slotName: string;
  campus?: string | null;
  roomOrHall?: string | null;
  startDate: string;
  endDate: string;
  studentLimit: number;
  roomNo: number;
  isActive: boolean;
  scheduledCount: number;
  remainingCapacity: number;
};

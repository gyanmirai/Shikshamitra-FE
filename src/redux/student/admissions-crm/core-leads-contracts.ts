import type { FetchArgs } from '@reduxjs/toolkit/query';

import {
  AdmissionCrmIdentifierType,
  AdmissionCrmQuickInquiryRouteOptionDto,
  AdmissionCrmRouteType,
} from './final-admission-contracts';

import { AdmissionCrmOperationsQueueType } from './operations-governance-contracts';

import { AdmissionCrmSlotAssignmentStrategy } from './setup-playbooks-contracts';

export enum AdmissionInquiryChannel {
  ManualBackOffice = 0,
  QuickCallEntry = 1,
  WalkInReception = 2,
  SchoolWebsiteForm = 3,
  WhatsAppInquiry = 4,
  StaffSharedLink = 5,
  QrCodeScan = 6,
  CampaignLink = 7,
}

export enum AdmissionInquiryStage {
  NewInquiry = 0,
  FollowUp = 1,
  ExamReady = 2,
  ExamScheduled = 3,
  ExamCompleted = 4,
  Eligible = 5,
  Waitlisted = 6,
  Rejected = 7,
  Stale = 8,
  Archived = 9,
}

export enum AdmissionCrmLeadPriority {
  None = 0,
  Hot = 1,
  Warm = 2,
  Cold = 3,
  Low = 4,
}

export enum AdmissionCrmApplicantChecklistProgressStatus {
  Pending = 0,
  Requested = 1,
  Received = 2,
  Waived = 3,
}

export enum AdmissionCrmReviewRecommendation {
  Admit = 0,
  Waitlist = 1,
  Reject = 2,
  MoreInformation = 3,
}

export enum AdmissionCrmFormFieldType {
  Text = 0,
  TextArea = 1,
  Number = 2,
  Date = 3,
  Email = 4,
  Phone = 5,
  Select = 6,
  MultiSelect = 7,
  Checkbox = 8,
}

export enum AdmissionCrmLeadRoutingStrategy {
  FirstMatchingRule = 0,
  RoundRobin = 1,
  LeastOpenLeads = 2,
}

export enum AdmissionCrmJourneyTrigger {
  LeadCreated = 0,
  StageReached = 1,
  SlaMissed = 2,
  StaleMarked = 3,
  ExamScheduled = 4,
  ExamCompleted = 5,
  EligibilityDecided = 6,
  RegistrationIssued = 7,
  RegistrationIncomplete = 8,
  RegistrationExpiring = 9,
  RegistrationSubmitted = 10,
  RegistrationCorrectionRequested = 11,
  RegistrationVerified = 12,
  DocumentUploaded = 13,
  DocumentRejected = 14,
  DocumentPending = 15,
  ExamNoShow = 16,
  AdmissionReady = 17,
  DocumentExpiring = 18,
  FeeFollowUp = 19,
  OfferIssued = 20,
  OfferAccepted = 21,
  ActivationWelcome = 22,
}

export enum AdmissionCrmPaymentGateType {
  None = 0,
  ReferenceRecorded = 1,
  PaymentInitiated = 2,
  PartialAmountConfirmed = 3,
  RequiredAmountConfirmed = 4,
  FinanceCleared = 5,
}

export enum AdmissionCrmPaymentGateMilestone {
  OfferAcceptance = 0,
  FinalApproval = 1,
  StudentActivation = 2,
}

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
};

export type AdmissionCrmListParams = {
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
};

export type AdmissionCrmLeadListParams = AdmissionCrmListParams & {
  filterText?: string;
  applicantSearch?: string;
  registrationFormNumber?: string;
  lastActivityFrom?: string;
  lastActivityUntil?: string;
  stage?: AdmissionInquiryStage;
  pipelineColumn?: AdmissionCrmPipelineColumnKey;
  channel?: AdmissionInquiryChannel;
  inquirySourceId?: string;
  inquiryTypeId?: string;
  campaignName?: string;
  ownerUserId?: string;
  priority?: AdmissionCrmLeadPriority;
  intendedRouteType?: AdmissionCrmRouteType;
  desiredClassName?: string;
  academicMediumId?: string;
};

export type AdmissionCrmLeadDto = {
  id: string;
  applicantNumber: number;
  academicYearId: string;
  admissionYearSetupId?: string | null;
  admissionYearSetupVersion?: number | null;
  studentId?: string | null;
  inquirySourceId?: string | null;
  inquirySourceSnapshot?: string | null;
  inquiryTypeId?: string | null;
  inquiryTypeSnapshot?: string | null;
  channel: AdmissionInquiryChannel;
  campaignName?: string | null;
  campusBranchName?: string | null;
  preferredCommunicationLanguage?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  parentGuardianName?: string | null;
  primaryContactNo?: string | null;
  email?: string | null;
  admissionIntent: string;
  intendedRouteType?: AdmissionCrmRouteType | null;
  intendedRouteDefinitionId?: string | null;
  intendedRouteDefinitionVersion?: number | null;
  intendedRouteNameSnapshot?: string | null;
  targetStandardId?: string | null;
  desiredClassName?: string | null;
  stage: AdmissionInquiryStage;
  ownerUserId?: string | null;
  leadScore: number;
  priority: AdmissionCrmLeadPriority;
  lastActivityTime: string;
  notes?: string | null;
  archivedAt?: string | null;
  archiveReason?: string | null;
  reopenedAt?: string | null;
  reopenReason?: string | null;
  mergedIntoLeadId?: string | null;
  mergedAt?: string | null;
  mergeReason?: string | null;
  duplicateContinueReason?: string | null;
  pipelineColumn?: AdmissionCrmPipelineColumnKey | null;
  closedOutcome?: AdmissionCrmClosedOutcome | null;
  currentStep?: AdmissionCrmApplicantStepKey | null;
  nextAction?: string | null;
  nextActionCode?: string | null;
  registrationFormNumber?: string | null;
  registrationFormAmount?: number | null;
  registrationFormIssuedAt?: string | null;
  likelyDuplicateCount: number;
  likelyDuplicates: AdmissionCrmLeadDuplicateDto[];
};

export type AdmissionCrmLeadDuplicateDto = {
  leadId: string;
  stage: AdmissionInquiryStage;
  firstName?: string | null;
  lastName?: string | null;
  primaryContactNo?: string | null;
  email?: string | null;
  matchReason: string;
  confidenceScore: number;
  matchedFields: string[];
  lastActivityTime: string;
};

export type CreateAdmissionCrmLeadDto = {
  inquirySourceId?: string | null;
  inquiryTypeId?: string | null;
  channel: AdmissionInquiryChannel;
  campaignName?: string | null;
  campusBranchName?: string | null;
  preferredCommunicationLanguage?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  parentGuardianName?: string | null;
  primaryContactNo?: string | null;
  email?: string | null;
  admissionIntent: string;
  intendedRouteDefinitionId?: string | null;
  intendedRouteType?: AdmissionCrmRouteType | null;
  targetStandardId?: string | null;
  academicBoardId?: string | null;
  academicMediumId?: string | null;
  academicMediumStageId?: string | null;
  desiredClassName?: string | null;
  notes?: string | null;
  duplicateContinueReason?: string | null;
};

export type AdmissionCrmQuickInquiryChannelOptionDto = {
  channel: AdmissionInquiryChannel;
  label: string;
  displayOrder: number;
  isDefault: boolean;
};

export type AdmissionCrmQuickInquirySourceOptionDto = {
  inquirySourceId: string;
  name: string;
  allowedChannels: AdmissionInquiryChannel[];
  isDefault: boolean;
};

export type AdmissionCrmQuickInquiryTypeOptionDto = {
  inquiryTypeId: string;
  name: string;
  isDefault: boolean;
};

export type AdmissionCrmQuickInquiryOptionsDto = {
  academicYearId: string;
  cycleName: string;
  isAdmissionCycleActive: boolean;
  registrationFormRequiredBeforeExam: boolean;
  entranceExamRequired: boolean;
  journeyLocked: boolean;
  channels: AdmissionCrmQuickInquiryChannelOptionDto[];
  sources: AdmissionCrmQuickInquirySourceOptionDto[];
  inquiryTypes: AdmissionCrmQuickInquiryTypeOptionDto[];
  routes: AdmissionCrmQuickInquiryRouteOptionDto[];
};

export type ChangeAdmissionCrmLeadStageDto = {
  stage: AdmissionInquiryStage;
  reason: string;
};

export type ChangeAdmissionCrmLeadPriorityDto = {
  priority: AdmissionCrmLeadPriority;
  reason?: string | null;
};

export type CreateAdmissionCrmLeadNoteDto = {
  note: string;
  isCallNote?: boolean;
};

export type AdmissionCrmLeadDuplicatePreviewInput = Pick<
  CreateAdmissionCrmLeadDto,
  | 'firstName'
  | 'lastName'
  | 'dateOfBirth'
  | 'parentGuardianName'
  | 'primaryContactNo'
  | 'email'
  | 'admissionIntent'
  | 'targetStandardId'
  | 'desiredClassName'
  | 'campaignName'
>;

export type AdmissionCrmSettingsAccessMode = 0 | 1 | 2;

export enum AdmissionCrmSlaHoldReason {
  ParentAction = 0,
  ExternalAuthority = 1,
  ApprovedHold = 2,
}

export type AdmissionCrmSlaHoldDto = {
  id: string;
  academicYearId: string;
  leadId: string;
  holdReason: AdmissionCrmSlaHoldReason;
  reason: string;
  startedAt: string;
  resumedAt?: string | null;
  resumeReason?: string | null;
  isActive: boolean;
};

export type AdmissionCrmApplicantChecklistItemDto = {
  key: string;
  label: string;
  details?: string | null;
  isRequired: boolean;
  displayOrder: number;
};

export type AdmissionCrmApplicantChecklistProgressDto = {
  id?: string | null;
  leadId: string;
  academicYearId: string;
  key: string;
  label: string;
  details?: string | null;
  isRequired: boolean;
  status: AdmissionCrmApplicantChecklistProgressStatus;
  statusLabel: string;
  isComplete: boolean;
  notes?: string | null;
  statusChangedAt?: string | null;
};

export type UpdateAdmissionCrmApplicantChecklistProgressDto = {
  status: AdmissionCrmApplicantChecklistProgressStatus;
  notes?: string | null;
};

export type AdmissionCrmJourneyRunResultDto = {
  trigger: AdmissionCrmJourneyTrigger;
  leadId?: string | null;
  stage?: AdmissionInquiryStage | null;
  evaluatedLeadCount: number;
  matchedRuleCount: number;
  createdTaskCount: number;
  skippedExistingTaskCount: number;
  sentMessageCount: number;
  skippedExistingMessageCount: number;
  failedActionCount: number;
  failureMessages: string[];
};

export type AdmissionCrmAdmissionRoundDto = {
  code: string;
  name: string;
  openingDate: string;
  closingDate: string;
  examWindowStart?: string | null;
  examWindowEnd?: string | null;
  registrationDeadline?: string | null;
  decisionDeadline?: string | null;
  isActive: boolean;
};

export type AdmissionCrmSlotTemplateDto = {
  code: string;
  name: string;
  examDefinitionCode: string;
  campus?: string | null;
  roomOrHall?: string | null;
  roomNo: number;
  capacity: number;
  reportingTime: string;
  startTime: string;
  endTime: string;
  validFrom?: string | null;
  validTo?: string | null;
  daysOfWeek: number[];
  blackoutDates: string[];
  isActive: boolean;
};

export type AdmissionCrmGeneratedSlotDto = {
  slotId: string;
  slotTemplateCode: string;
  examDefinitionCode: string;
  slotName: string;
  startTime: string;
  endTime: string;
  capacity: number;
  roomNo: number;
  wasCreated: boolean;
};

export type AdmissionCrmSlotGenerationResultDto = {
  createdCount: number;
  existingCount: number;
  slots: AdmissionCrmGeneratedSlotDto[];
};

export type AdmissionCrmSlotRecommendationDto = {
  entranceExamSlotId: string;
  slotName: string;
  startTime: string;
  endTime: string;
  roomNo: number;
  capacity: number;
  scheduledCount: number;
  availableSeats: number;
  strategy: AdmissionCrmSlotAssignmentStrategy;
  explanation: string;
};

export type AdmissionCrmFormFieldDto = {
  key: string;
  label: string;
  fieldType: AdmissionCrmFormFieldType;
  systemField?: string | null;
  sectionName?: string | null;
  helperText?: string | null;
  placeholder?: string | null;
  defaultValue?: string | null;
  visibleWhenFieldKey?: string | null;
  visibleWhenValue?: string | null;
  required: boolean;
  displayOrder: number;
  options?: string[];
  optionLabels?: string[];
  localizedLabels?: Record<string, string>;
  localizedHelperTexts?: Record<string, string>;
  localizedPlaceholders?: Record<string, string>;
  localizedOptions?: Record<string, string[]>;
};

export type AdmissionCrmFollowUpTaskDto = {
  id: string;
  leadId: string;
  academicYearId: string;
  title: string;
  dueAt: string;
  assignedUserId?: string | null;
  status: number;
  notes?: string | null;
  completedAt?: string | null;
  completionNotes?: string | null;
};

export type AdmissionCrmSlaReminderRunResultDto = {
  createdTaskCount: number;
  skippedExistingTaskCount: number;
  slaThresholdHours: number;
  stageOverrideCount: number;
  slaCutoff: string;
};

export type AdmissionCrmAddressDto = {
  type: string;
  line1: string;
  line2?: string | null;
  locality?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isVerified: boolean;
};

export type AdmissionCrmDailyTrendDto = {
  date: string;
  leadCount: number;
  examScheduledCount: number;
  examCompletedCount: number;
  eligibleCount: number;
  waitlistedCount: number;
  rejectedCount: number;
  staleCount: number;
  archivedCount: number;
  slaMissedCount: number;
};

export type AdmissionCrmAutomationFailureDto = {
  eventId: string;
  leadId: string;
  title: string;
  details?: string | null;
  occurredAt: string;
};

export type AdmissionCrmStageFunnelDto = {
  stage: AdmissionInquiryStage;
  stageName: string;
  leadCount: number;
  shareOfLeads: number;
};

export type AdmissionCrmChannelPerformanceDto = {
  channel: AdmissionInquiryChannel;
  channelName: string;
  leadCount: number;
  examScheduledCount: number;
  eligibleCount: number;
  waitlistedCount: number;
  rejectedCount: number;
  eligibilityRate: number;
};

export type AdmissionCrmSourcePerformanceDto = {
  sourceName: string;
  leadCount: number;
  examScheduledCount: number;
  eligibleCount: number;
  eligibilityRate: number;
};

export type AdmissionCrmCampaignPerformanceDto = {
  campaignName: string;
  leadCount: number;
  examScheduledCount: number;
  eligibleCount: number;
  waitlistedCount: number;
  rejectedCount: number;
  eligibilityRate: number;
  averageLeadScore: number;
};

export type AdmissionCrmStaffWorkloadDto = {
  ownerUserId?: string | null;
  ownerLabel: string;
  leadCount: number;
  openLeadCount: number;
  staleLeadCount: number;
  pendingTaskCount: number;
  overdueTaskCount: number;
  examScheduledCount: number;
};

export type AdmissionCrmOperationQueueContextDto = {
  queueType: AdmissionCrmOperationsQueueType;
  severity: string;
  assignmentStatus: string;
  serviceHandoffStatus?: AdmissionCrmServiceHandoffStatus | null;
  retryAttemptCount?: number | null;
};

export const buildAdmissionCrmLeadListRequest = ({
  academicYearId,
  ...params
}: { academicYearId: string } & AdmissionCrmLeadListParams): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/leads`,
  method: 'GET',
  params,
});

export const buildCreateAdmissionCrmLeadRequest = ({
  academicYearId,
  body,
}: {
  academicYearId: string;
  body: CreateAdmissionCrmLeadDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/leads`,
  method: 'POST',
  body,
});

export const buildAdmissionCrmQuickInquiryOptionsRequest = ({
  academicYearId,
}: {
  academicYearId: string;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/quick-inquiry-options`,
  method: 'GET',
});

export const buildPreviewAdmissionCrmLeadDuplicatesRequest = ({
  academicYearId,
  body,
}: {
  academicYearId: string;
  body: AdmissionCrmLeadDuplicatePreviewInput;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/leads/duplicate-preview`,
  method: 'POST',
  body,
});

export const buildChangeAdmissionCrmLeadStageRequest = ({
  leadId,
  body,
}: {
  leadId: string;
  body: ChangeAdmissionCrmLeadStageDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/stage`,
  method: 'POST',
  body,
});

export const buildChangeAdmissionCrmLeadPriorityRequest = ({
  leadId,
  body,
}: {
  leadId: string;
  body: ChangeAdmissionCrmLeadPriorityDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/priority`,
  method: 'POST',
  body,
});

export const buildAdmissionCrmTimelineRequest = ({
  leadId,
  ...params
}: { leadId: string } & AdmissionCrmListParams): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/timeline`,
  method: 'GET',
  params,
});

export const buildAdmissionCrmLeadApplicantChecklistRequest = ({
  leadId,
}: {
  leadId: string;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/applicant-checklist`,
  method: 'GET',
});

export const buildUpdateAdmissionCrmLeadApplicantChecklistRequest = ({
  leadId,
  key,
  body,
}: {
  leadId: string;
  key: string;
  body: UpdateAdmissionCrmApplicantChecklistProgressDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/applicant-checklist/${key}`,
  method: 'PUT',
  body,
});

export const buildAddAdmissionCrmLeadNoteRequest = ({
  leadId,
  body,
}: {
  leadId: string;
  body: CreateAdmissionCrmLeadNoteDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/notes`,
  method: 'POST',
  body,
});

export const buildMergeAdmissionCrmDuplicateLeadRequest = ({
  leadId,
  body,
}: {
  leadId: string;
  body: { duplicateLeadId: string; reason: string };
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/duplicates/merge`,
  method: 'POST',
  body,
});

export const buildAdmissionCrmSlaReminderRunRequest = ({
  academicYearId,
}: {
  academicYearId: string;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/automation/sla-reminders/run`,
  method: 'POST',
});

export const buildAdmissionCrmDecisionHistoryRequest = ({
  leadId,
}: {
  leadId: string;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/final-admission/decisions`,
  method: 'GET',
});

export enum AdmissionCrmNumberSeriesStatus {
  Draft = 0,
  ApprovalPending = 1,
  Published = 2,
  Retired = 3,
}

export enum AdmissionCrmServiceHandoffType {
  Transport = 0,
  Hostel = 1,
  Library = 2,
  HealthSupport = 3,
  Meal = 4,
  Uniform = 5,
  Device = 6,
  Other = 7,
}

export enum AdmissionCrmServiceHandoffStatus {
  Pending = 0,
  Dispatched = 1,
  Acknowledged = 2,
  Failed = 3,
  Cancelled = 4,
}

export interface AdmissionCrmServiceHandoffDto {
  id: string;
  activationId: string;
  leadId: string;
  studentId: string;
  type: AdmissionCrmServiceHandoffType;
  destinationModule: string;
  consentConfirmed: boolean;
  payload: Record<string, string | null>;
  status: AdmissionCrmServiceHandoffStatus;
  attemptCount: number;
  requestedAt: string;
  dispatchedAt?: string | null;
  acknowledgedAt?: string | null;
  externalReference?: string | null;
  lastError?: string | null;
}

export interface AdmissionCrmNumberSeriesDto {
  id: string;
  academicYearId: string;
  code: string;
  name: string;
  identifierType: AdmissionCrmIdentifierType;
  educationBoardId?: string | null;
  academicMediumId?: string | null;
  standardId?: string | null;
  prefix: string;
  suffix: string;
  padding: number;
  startingSequence: number;
  nextSequence: number;
  maximumSequence?: number | null;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  status: AdmissionCrmNumberSeriesStatus;
  nextPreview: string;
}

export enum AdmissionCrmReportFrequency {
  Daily = 0,
  Weekly = 1,
  Monthly = 2,
}

export type AdmissionCrmInquirySourceDto = {
  id: string;
  academicYearId: string;
  code: string;
  displayName: string;
  description?: string | null;
  allowedChannels: AdmissionInquiryChannel[];
  displayOrder: number;
  isRoutingEligible: boolean;
  isActive: boolean;
  deactivationReason?: string | null;
};

export type AdmissionCrmInquirySourceUpsertDto = {
  code: string;
  displayName: string;
  description?: string | null;
  allowedChannels: AdmissionInquiryChannel[];
  displayOrder: number;
  isRoutingEligible: boolean;
};

export type AdmissionCrmInquiryTypeDto = {
  id: string;
  academicYearId: string;
  code: string;
  displayName: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  deactivationReason?: string | null;
};

export type AdmissionCrmInquiryTypeUpsertDto = {
  code: string;
  displayName: string;
  description?: string | null;
  displayOrder: number;
};

export type AdmissionCrmCatalogStatusDto = {
  isActive: boolean;
  reason?: string | null;
};

export type AdmissionCrmStaffLookupDto = {
  id: string;
  employeeId: string;
  employeeCode: string;
  displayName: string;
  userName: string;
  email?: string | null;
  isOwnerEligible: boolean;
};

export enum AdmissionCrmIntegrationCapabilityState {
  NotConfigured = 0,
  Manual = 1,
  Configured = 2,
}

export type AdmissionCrmIntegrationCapabilityDto = {
  code: string;
  displayName: string;
  state: AdmissionCrmIntegrationCapabilityState;
  operationalMode: string;
  detail: string;
};

export enum AdmissionCrmApplicantStepKey {
  Inquiry = 0,
  Exam = 1,
  Registration = 2,
  Finance = 3,
  Placement = 4,
  Activation = 5,
}

export enum AdmissionCrmApplicantStepStatus {
  NotStarted = 0,
  InProgress = 1,
  Complete = 2,
  Skipped = 3,
  Blocked = 4,
  NeedsReview = 5,
}

export enum AdmissionCrmPipelineColumnKey {
  NewInquiry = 0,
  FollowUp = 1,
  ExamPending = 2,
  ExamDone = 3,
  Eligible = 4,
  RegistrationPending = 5,
  RegistrationDone = 6,
  FinanceVerification = 7,
  PlacementPending = 8,
  ReadyForActivation = 9,
  Activated = 10,
}

export enum AdmissionCrmClosedOutcome {
  Rejected = 0,
  Withdrawn = 1,
  Ineligible = 2,
  Cancelled = 3,
  Duplicate = 4,
  NotInterested = 5,
}

export type AdmissionCrmApplicantStepDto = {
  step: AdmissionCrmApplicantStepKey;
  title: string;
  status: AdmissionCrmApplicantStepStatus;
  isRequired: boolean;
  reasonCode: string;
  reason: string;
  actionCode?: string | null;
  completedAt?: string | null;
};

export type AdmissionCrmApplicantProgressDto = {
  leadId: string;
  academicYearId: string;
  admissionYearSetupId?: string | null;
  admissionYearSetupVersion: number;
  pipelineColumn: AdmissionCrmPipelineColumnKey;
  closedOutcome?: AdmissionCrmClosedOutcome | null;
  currentStep: AdmissionCrmApplicantStepKey;
  nextAction: string;
  nextActionCode?: string | null;
  steps: AdmissionCrmApplicantStepDto[];
};

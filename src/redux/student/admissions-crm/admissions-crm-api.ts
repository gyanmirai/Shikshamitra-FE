import type { FetchArgs } from '@reduxjs/toolkit/query';

import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

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

export enum AdmissionCrmExamAttendanceStatus {
  NotMarked = 0,
  Present = 1,
  Absent = 2,
}

export enum AdmissionCrmEligibilityDecision {
  Pending = 0,
  Eligible = 1,
  Waitlisted = 2,
  Rejected = 3,
}

export enum AdmissionCrmGeneratedDocumentType {
  HallTicket = 0,
  RegistrationAcknowledgement = 1,
  OfferLetter = 2,
  AdmissionLetter = 3,
  CorrectionNotice = 4,
  CancellationLetter = 5,
}

export enum EntranceExamStatusEnum {
  Pending = 0,
  Pass = 1,
  Fail = 2,
  Absent = 3,
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

export enum AdmissionCrmMeritRankingMode {
  MarksThenInquiryDate = 0,
  MarksThenLeadScore = 1,
  LeadScoreThenMarks = 2,
}

export enum AdmissionCrmLeadRoutingStrategy {
  FirstMatchingRule = 0,
  RoundRobin = 1,
  LeastOpenLeads = 2,
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
}

export enum AdmissionCrmOperationsQueueType {
  UnassignedExam = 0,
  CapacityConflict = 1,
  NoShow = 2,
  ExpiringRegistrationLink = 3,
  IncompleteRegistration = 4,
  RejectedDocument = 5,
  DocumentVerificationBacklog = 6,
  AdmissionReady = 7,
  PolicyException = 8,
  PaymentCondition = 9,
  HouseholdResolution = 10,
  IdentityConflict = 11,
  FinalApproval = 12,
  ActivationRepair = 13,
  RouteEligibilityReview = 14,
  GovernmentAllotmentReconciliation = 15,
  TransferEvidencePending = 16,
  ReturningIdentityMatch = 17,
  CancellationReview = 18,
  RouteAppealReview = 19,
  ServiceHandoffException = 20,
  RegistrationInvitationPending = 21,
}

export enum AdmissionCrmAutomationRunType {
  StaleArchive = 0,
  SlaReminder = 1,
  Journey = 2,
}

export enum AdmissionCrmAutomationRunStatus {
  Completed = 0,
  CompletedWithFailures = 1,
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

export enum AdmissionCrmSeatPoolStatus {
  Active = 0,
  Closed = 1,
}

export enum AdmissionCrmSeatReservationStatus {
  Active = 0,
  Committed = 1,
  Released = 2,
  Expired = 3,
  Cancelled = 4,
}

export enum AdmissionCrmSeatOfferType {
  Provisional = 0,
  Final = 1,
}

export enum AdmissionCrmSeatOfferStatus {
  Draft = 0,
  ApprovalPending = 1,
  Approved = 2,
  Issued = 3,
  Accepted = 4,
  Declined = 5,
  Expired = 6,
  Revoked = 7,
  Superseded = 8,
  Cancelled = 9,
  Opened = 10,
}

export enum AdmissionCrmWaitlistStatus {
  Active = 0,
  Promoted = 1,
  Accepted = 2,
  Withdrawn = 3,
  Expired = 4,
}

export enum AdmissionCrmAdmissionDecisionStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Waitlisted = 3,
  Withdrawn = 4,
  Expired = 5,
  Cancelled = 6,
}

export enum AdmissionCrmFeePolicyStatus {
  Draft = 0,
  ApprovalPending = 1,
  Approved = 2,
  Published = 3,
  Retired = 4,
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

export enum AdmissionCrmFinanceState {
  NotRequired = 0,
  NotStarted = 1,
  Initiated = 2,
  PendingConfirmation = 3,
  PartiallyConfirmed = 4,
  Confirmed = 5,
  Failed = 6,
  Reversed = 7,
  Disputed = 8,
  Waived = 9,
  Sponsored = 10,
  Refunded = 11,
}

export enum AdmissionCrmQuotationStatus {
  Draft = 0,
  Issued = 1,
  Superseded = 2,
  Expired = 3,
  Cancelled = 4,
}

export enum AdmissionCrmConcessionType {
  Sibling = 0,
  StaffChild = 1,
  Alumni = 2,
  Merit = 3,
  NeedBased = 4,
  RteOrAuthority = 5,
  Scholarship = 6,
  Discretionary = 7,
  SchoolDefined = 8,
}

export enum AdmissionCrmConcessionStatus {
  Draft = 0,
  ApprovalPending = 1,
  ApprovedPendingFinance = 2,
  FinanceAcknowledged = 3,
  Rejected = 4,
  Expired = 5,
  Revoked = 6,
  Superseded = 7,
}

export enum AdmissionCrmPersonProvenance {
  ApplicantSupplied = 0,
  StaffSupplied = 1,
  DocumentExtracted = 2,
  DocumentVerified = 3,
  GovernmentSourced = 4,
  Imported = 5,
  Derived = 6,
}

export enum AdmissionCrmGuardianRelationshipType {
  Mother = 0,
  Father = 1,
  LegalGuardian = 2,
  FosterGuardian = 3,
  Grandparent = 4,
  Sibling = 5,
  Relative = 6,
  LocalGuardian = 7,
  InstitutionGuardian = 8,
  SchoolDefined = 9,
}

export enum AdmissionCrmIdentityResolutionStatus {
  Unresolved = 0,
  PendingReview = 1,
  Ready = 2,
  Conflict = 3,
  Overridden = 4,
}

export enum AdmissionCrmIdentityVerificationStatus {
  NotProvided = 0,
  Pending = 1,
  Verified = 2,
  Rejected = 3,
  Mismatch = 4,
  Expired = 5,
}

export enum AdmissionCrmConsentStatus {
  NotAsked = 0,
  Requested = 1,
  Granted = 2,
  Refused = 3,
  Revoked = 4,
}

export enum AdmissionCrmUdiseSyncStatus {
  NotReady = 0,
  Ready = 1,
  Exported = 2,
  Rejected = 3,
  NeedsCorrection = 4,
}

export enum AdmissionCrmPlaybookStatus {
  Draft = 0,
  Published = 1,
  Retired = 2,
}

export enum AdmissionCrmRegistrationTemplateStatus {
  Draft = 0,
  Published = 1,
  Retired = 2,
}

export enum AdmissionCrmRegistrationStatus {
  Issued = 0,
  Opened = 1,
  Started = 2,
  PartiallyCompleted = 3,
  Submitted = 4,
  ReturnedForCorrection = 5,
  Resubmitted = 6,
  Verified = 7,
  Expired = 8,
  Revoked = 9,
  Withdrawn = 10,
  AdmissionReady = 11,
}

export enum AdmissionCrmRegistrationFeeStatus {
  NotRequired = 0,
  Pending = 1,
  ReferenceRecorded = 2,
  Waived = 3,
  ConfirmedExternally = 4,
}

export enum AdmissionCrmDocumentChecklistTemplateStatus {
  Draft = 0,
  Published = 1,
  Retired = 2,
}

export enum AdmissionCrmDocumentRequirementLevel {
  Required = 0,
  Optional = 1,
  Conditional = 2,
  RequiredLater = 3,
}

export enum AdmissionCrmApplicantDocumentStatus {
  Uploaded = 0,
  UnderReview = 1,
  Verified = 2,
  Rejected = 3,
  Expired = 4,
  Waived = 5,
  OriginalSeen = 6,
}

export enum AdmissionCrmRegistrationPath {
  RegistrationAfterExam = 0,
  RegistrationBeforeExam = 1,
  ExamWaived = 2,
  DirectRegistration = 3,
}

export enum AdmissionCrmSlotAssignmentStrategy {
  Manual = 0,
  EarliestAvailable = 1,
  RoundRobin = 2,
  ClassMatch = 3,
  CampusMatch = 4,
  PreferredDate = 5,
  LanguageMatch = 6,
  SiblingGrouping = 7,
  BalancedCapacity = 8,
}

export enum AdmissionCrmAssessmentComponentType {
  WrittenTest = 0,
  Interview = 1,
  Interaction = 2,
  Observation = 3,
  ReadinessAssessment = 4,
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
  stage?: AdmissionInquiryStage;
  channel?: AdmissionInquiryChannel;
  inquirySourceId?: string;
  campaignName?: string;
  ownerUserId?: string;
  priority?: AdmissionCrmLeadPriority;
};

export type AdmissionCrmAnalyticsSummaryParams = {
  fromDate?: string;
  toDate?: string;
  channel?: AdmissionInquiryChannel;
  inquirySourceId?: string;
  campaignName?: string;
  ownerUserId?: string;
  stage?: AdmissionInquiryStage;
  targetStandardId?: string;
  minimumLeadScore?: number;
  maximumLeadScore?: number;
};

export type AdmissionCrmLeadDto = {
  id: string;
  academicYearId: string;
  studentId?: string | null;
  inquirySourceId?: string | null;
  inquirySourceSnapshot?: string | null;
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
  targetStandardId?: string | null;
  desiredClassName?: string | null;
  notes?: string | null;
  duplicateContinueReason?: string | null;
};

export type ChangeAdmissionCrmLeadStageDto = {
  stage: AdmissionInquiryStage;
  reason: string;
};

export type ChangeAdmissionCrmLeadPriorityDto = {
  priority: AdmissionCrmLeadPriority;
  reason?: string | null;
};

export type IssueAdmissionCrmRegistrationFormDto = {
  formNumber: string;
  amount: number;
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

export type AdmissionCrmCycleConfigurationDto = {
  id: string;
  academicYearId: string;
  cycleName: string;
  isActive: boolean;
  registrationFormRequiredBeforeExam: boolean;
  staleAfterDays: number;
  archiveAfterDays: number;
  defaultLeadSlaHours: number;
  slaPolicy: AdmissionCrmSlaPolicyDto;
  activationCancellationWindowDays: number;
  defaultExamPassingPercentage: number;
  meritRankingMode: AdmissionCrmMeritRankingMode;
  examReadinessFields: AdmissionCrmExamReadinessField;
  leadScoringRules: AdmissionCrmLeadScoringRulesDto;
  leadRoutingSettings: AdmissionCrmLeadRoutingSettingsDto;
  journeyRules: AdmissionCrmJourneyRuleDto[];
  applicantChecklist: AdmissionCrmApplicantChecklistItemDto[];
  channelSettings: AdmissionCrmChannelSettingDto[];
  notes?: string | null;
};

export type AdmissionCrmSettingsAccessMode = 0 | 1 | 2;
export type AdmissionCrmSetupReadiness = 0 | 1 | 2 | 3 | 4;

export type AdmissionCrmSetupItemDto = {
  key: string;
  title: string;
  status: AdmissionCrmSetupReadiness;
  accessMode: AdmissionCrmSettingsAccessMode;
  blockerCodes: string[];
  path: string;
};

export type AdmissionCrmSetupStatusDto = {
  academicYearId: string;
  cycleName: string;
  status: AdmissionCrmSetupReadiness;
  appliedPresetName?: string | null;
  appliedPresetVersion?: number | null;
  lastUpdatedAt?: string | null;
  items: AdmissionCrmSetupItemDto[];
};

export type AdmissionCrmSlaPolicyDto = {
  timeZoneId: string;
  workingDays: number[];
  workingDayStartHour: number;
  workingDayEndHour: number;
  holidays: string[];
  escalationAfterHours: number;
  escalationOwnerUserId?: string | null;
};

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

export type AdmissionCrmLeadScoringRulesDto = {
  baseScore: number;
  bothContactChannelsScore: number;
  parentGuardianScore: number;
  desiredClassScore: number;
  campaignScore: number;
  manualBackOfficeChannelScore: number;
  quickCallEntryChannelScore: number;
  walkInReceptionChannelScore: number;
  schoolWebsiteFormChannelScore: number;
  whatsAppInquiryChannelScore: number;
  staffSharedLinkChannelScore: number;
  qrCodeScanChannelScore: number;
  campaignLinkChannelScore: number;
  examPassScore: number;
  examFailPenalty: number;
  highPerformanceScore: number;
  highPerformancePercentage: number;
  maxScore: number;
};

export type AdmissionCrmLeadRoutingRuleDto = {
  ruleName: string;
  isEnabled: boolean;
  priority: number;
  ownerUserId?: string | null;
  channel?: AdmissionInquiryChannel | null;
  inquirySourceId?: string | null;
  targetStandardId?: string | null;
  campaignContains?: string | null;
  campusBranchContains?: string | null;
  preferredLanguageContains?: string | null;
  desiredClassContains?: string | null;
};

export type AdmissionCrmLeadRoutingSettingsDto = {
  isEnabled: boolean;
  defaultOwnerUserId?: string | null;
  routingStrategy: AdmissionCrmLeadRoutingStrategy;
  ownerPoolUserIds: string[];
  rules: AdmissionCrmLeadRoutingRuleDto[];
};

export type AdmissionCrmChannelSettingDto = {
  channel: AdmissionInquiryChannel;
  isEnabled: boolean;
  defaultInquirySourceId?: string | null;
  defaultFormTemplateId?: string | null;
  defaultOwnerUserId?: string | null;
  defaultAcknowledgementTemplateId?: string | null;
  displayOrder: number;
};

export type AdmissionCrmJourneyRuleDto = {
  ruleName: string;
  isEnabled: boolean;
  priority: number;
  trigger: AdmissionCrmJourneyTrigger;
  stage?: AdmissionInquiryStage | null;
  channel?: AdmissionInquiryChannel | null;
  inquirySourceId?: string | null;
  campaignContains?: string | null;
  leadStage?: AdmissionInquiryStage | null;
  leadPriority?: AdmissionCrmLeadPriority | null;
  ownerUserId?: string | null;
  targetStandardId?: string | null;
  desiredClassContains?: string | null;
  campusBranchContains?: string | null;
  preferredLanguageContains?: string | null;
  minimumLeadScore?: number | null;
  maximumLeadScore?: number | null;
  daysSinceLastActivity?: number | null;
  daysSinceCreation?: number | null;
  createTask: boolean;
  taskTitle?: string | null;
  taskDueOffsetHours: number;
  taskNotes?: string | null;
  sendMessage: boolean;
  messageTemplateId?: string | null;
};

export type RunAdmissionCrmJourneyRulesDto = {
  trigger: AdmissionCrmJourneyTrigger;
  leadId?: string | null;
  stage?: AdmissionInquiryStage | null;
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

export type AdmissionCrmPipelineStageDto = {
  id: string;
  academicYearId: string;
  systemStage: AdmissionInquiryStage;
  stageName: string;
  displayOrder: number;
  isEnabled: boolean;
  isSystem: boolean;
  colorHex?: string | null;
  slaTargetHours?: number | null;
  ownerResponsibility?: string | null;
  allowedNextStages: AdmissionInquiryStage[];
};

export type AdmissionCrmPlaybookApplicabilityDto = {
  campus?: string | null;
  desiredClass?: string | null;
  board?: string | null;
  medium?: string | null;
  applicantCategory?: string | null;
  admissionRound?: string | null;
  admissionRoute?: string | null;
};

export type AdmissionCrmPlaybookStageDto = {
  code: string;
  displayName: string;
  reportingMilestone: AdmissionInquiryStage;
  order: number;
  isRequired: boolean;
  isParentVisible: boolean;
  slaHours?: number | null;
  allowedNextStageCodes: string[];
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

export type AdmissionCrmSeatPlanDto = {
  code: string;
  roundCode?: string | null;
  campus?: string | null;
  desiredClass?: string | null;
  board?: string | null;
  medium?: string | null;
  applicantCategory?: string | null;
  plannedSeats: number;
  approvedCapacity: number;
  offeredSeats: number;
  acceptedSeats: number;
  waitlistedApplicants: number;
  withdrawnApplicants: number;
  remainingCapacity: number;
  isOverAllocated: boolean;
};

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

export type AdmissionCrmSlotAssignmentRuleDto = {
  code: string;
  name: string;
  trigger: string;
  strategy: AdmissionCrmSlotAssignmentStrategy;
  priority: number;
  slotTemplateCode?: string | null;
  isActive: boolean;
};

export type AdmissionCrmPlaybookUpsertDto = {
  name: string;
  isFallback: boolean;
  registrationPath: AdmissionCrmRegistrationPath;
  applicability: AdmissionCrmPlaybookApplicabilityDto;
  stages: AdmissionCrmPlaybookStageDto[];
  rounds: AdmissionCrmAdmissionRoundDto[];
  seatPlans: AdmissionCrmSeatPlanDto[];
  examDefinitions: AdmissionCrmExamDefinitionDto[];
  slotTemplates: AdmissionCrmSlotTemplateDto[];
  assignmentRules: AdmissionCrmSlotAssignmentRuleDto[];
  notes?: string | null;
};

export type AdmissionCrmPlaybookDto = AdmissionCrmPlaybookUpsertDto & {
  id: string;
  academicYearId: string;
  version: number;
  status: AdmissionCrmPlaybookStatus;
  publishedAt?: string | null;
  retiredAt?: string | null;
};

export type AdmissionCrmPlaybookListParams = AdmissionCrmListParams & {
  filter?: string;
  status?: AdmissionCrmPlaybookStatus;
};

export type ResolveAdmissionCrmPlaybookDto = AdmissionCrmPlaybookApplicabilityDto;

export type AdmissionCrmPlaybookResolutionDto = {
  playbook: AdmissionCrmPlaybookDto;
  specificityScore: number;
  explanation: string;
};

export type GenerateAdmissionCrmPlaybookSlotsDto = {
  slotTemplateCode: string;
  fromDate: string;
  toDate: string;
  utcOffsetMinutes: number;
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

export type RecommendAdmissionCrmPlaybookSlotDto = {
  assignmentRuleCode: string;
  preferredDate?: string | null;
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

export type AdmissionCrmRegistrationFieldDto = {
  key: string;
  label: string;
  fieldType: AdmissionCrmFormFieldType;
  systemField?: string | null;
  helpText?: string | null;
  required: boolean;
  parentEditable: boolean;
  displayOrder: number;
  visibleWhenFieldKey?: string | null;
  visibleWhenValue?: string | null;
  requiredWhenFieldKey?: string | null;
  requiredWhenValue?: string | null;
  validationPattern?: string | null;
  minimumLength?: number | null;
  maximumLength?: number | null;
  minimumValue?: number | null;
  maximumValue?: number | null;
  options: string[];
};

export type AdmissionCrmRegistrationSectionDto = {
  key: string;
  title: string;
  description?: string | null;
  displayOrder: number;
  parentVisible: boolean;
  fields: AdmissionCrmRegistrationFieldDto[];
};

export type AdmissionCrmRegistrationTemplateUpsertDto = {
  name: string;
  isFallback: boolean;
  applicability: AdmissionCrmPlaybookApplicabilityDto;
  sections: AdmissionCrmRegistrationSectionDto[];
  linkExpiryDays: number;
  allowPartialSave: boolean;
  feeRequired: boolean;
  feeAmount: number;
  autoIssueAtStage?: AdmissionInquiryStage | null;
  notes?: string | null;
};

export type AdmissionCrmRegistrationTemplateDto = AdmissionCrmRegistrationTemplateUpsertDto & {
  id: string;
  academicYearId: string;
  version: number;
  status: AdmissionCrmRegistrationTemplateStatus;
  publishedAt?: string | null;
  retiredAt?: string | null;
};

export type AdmissionCrmRegistrationTemplateListParams = AdmissionCrmListParams & {
  filter?: string;
  status?: AdmissionCrmRegistrationTemplateStatus;
};

export type AdmissionCrmFormNumberSeriesUpsertDto = {
  name: string;
  prefix: string;
  suffix: string;
  padding: number;
  nextNumber: number;
  applicability: AdmissionCrmPlaybookApplicabilityDto;
  isActive: boolean;
};

export type AdmissionCrmFormNumberSeriesDto = AdmissionCrmFormNumberSeriesUpsertDto & {
  id: string;
  academicYearId: string;
  nextPreview: string;
};

export type IssueAdmissionCrmRegistrationApplicationDto = {
  registrationTemplateId: string;
  formNumberSeriesId?: string | null;
  manualFormNumber?: string | null;
  playbookId?: string | null;
  linkExpiryDays?: number | null;
  waiveFee: boolean;
  waiverReason?: string | null;
};

export type AdmissionCrmRegistrationApplicationDto = {
  id: string;
  academicYearId: string;
  leadId: string;
  registrationTemplateId: string;
  registrationTemplateVersion: number;
  playbookId?: string | null;
  formNumber: string;
  status: AdmissionCrmRegistrationStatus;
  sections: AdmissionCrmRegistrationSectionDto[];
  prefill: Record<string, unknown>;
  responses: Record<string, unknown>;
  correctionFieldKeys: string[];
  completionPercentage: number;
  issuedAt: string;
  linkExpiresAt: string;
  openedAt?: string | null;
  lastSavedAt?: string | null;
  submittedAt?: string | null;
  verifiedAt?: string | null;
  feeAmount: number;
  feeStatus: AdmissionCrmRegistrationFeeStatus;
  paymentReference?: string | null;
  lifecycleReason?: string | null;
  applicantStatusPath?: string | null;
};

export type AdmissionCrmDocumentRequirementDto = {
  key: string;
  documentTypeId?: string | null;
  name: string;
  requirementLevel: AdmissionCrmDocumentRequirementLevel;
  conditionalFieldKey?: string | null;
  conditionalFieldValue?: string | null;
  blocksAdmissionReadiness: boolean;
  requiresOriginal: boolean;
  validityDateRequired: boolean;
  maximumSizeMb: number;
  acceptedExtensions: string[];
  uploadInstructions?: string | null;
  displayOrder: number;
};

export type AdmissionCrmDocumentChecklistTemplateUpsertDto = {
  name: string;
  isFallback: boolean;
  applicability: AdmissionCrmPlaybookApplicabilityDto;
  requirements: AdmissionCrmDocumentRequirementDto[];
  readinessApprovalCount: number;
  notes?: string | null;
};

export type AdmissionCrmDocumentChecklistTemplateDto =
  AdmissionCrmDocumentChecklistTemplateUpsertDto & {
    id: string;
    academicYearId: string;
    version: number;
    status: AdmissionCrmDocumentChecklistTemplateStatus;
    publishedAt?: string | null;
    retiredAt?: string | null;
  };

export type AdmissionCrmApplicantDocumentDto = {
  id?: string | null;
  requirementKey: string;
  requirementName: string;
  requirementLevel: AdmissionCrmDocumentRequirementLevel;
  isCurrentlyRequired: boolean;
  blocksAdmissionReadiness: boolean;
  requiresOriginal: boolean;
  validityDateRequired: boolean;
  originalSeen: boolean;
  status?: AdmissionCrmApplicantDocumentStatus | null;
  version: number;
  fileName?: string | null;
  contentType?: string | null;
  fileSize?: number | null;
  validUntil?: string | null;
  uploadedAt?: string | null;
  decisionReason?: string | null;
  decisionAt?: string | null;
  acceptedExtensions: string[];
  maximumSizeMb: number;
  uploadInstructions?: string | null;
};

export type AdmissionCrmApplicantDocumentChecklistDto = {
  assignmentId: string;
  registrationApplicationId: string;
  checklistTemplateId: string;
  checklistTemplateVersion: number;
  checklistName: string;
  completionPercentage: number;
  admissionReady: boolean;
  readinessConfirmed: boolean;
  readinessOverridden: boolean;
  requiredReadinessApprovalCount: number;
  receivedReadinessApprovalCount: number;
  awaitingSecondReadinessApproval: boolean;
  blockingReasons: string[];
  documents: AdmissionCrmApplicantDocumentDto[];
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

export type AdmissionCrmFormTemplateLocalizationDto = {
  templateName: string;
  description?: string | null;
  consentText?: string | null;
};

export type AdmissionCrmFormTemplateDto = {
  id: string;
  academicYearId: string;
  templateName: string;
  description?: string | null;
  channel: AdmissionInquiryChannel;
  isPublic: boolean;
  isActive: boolean;
  consentText?: string | null;
  privacyNoticeUrl?: string | null;
  fields: AdmissionCrmFormFieldDto[];
  localizations?: Record<string, AdmissionCrmFormTemplateLocalizationDto>;
};

export type AdmissionCrmFormTemplateListParams = AdmissionCrmListParams & {
  filterText?: string;
  isActive?: boolean;
  isPublic?: boolean;
  channel?: AdmissionInquiryChannel;
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

export type AdmissionCrmEligibilityHandoffDto = {
  academicYearId: string;
  leadId: string;
  examRecordId: string;
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

export type AdmissionCrmSeatPoolUpsertDto = {
  concurrencyStamp?: string | null;
  playbookId?: string | null;
  code: string;
  name: string;
  roundCode?: string | null;
  campus?: string | null;
  desiredClass?: string | null;
  board?: string | null;
  medium?: string | null;
  applicantCategory?: string | null;
  operationalTarget: number;
  approvedCapacity: number;
  isActive: boolean;
};

export type AdmissionCrmSeatPoolDto = Omit<AdmissionCrmSeatPoolUpsertDto, 'isActive'> & {
  id: string;
  academicYearId: string;
  reservedSeats: number;
  acceptedSeats: number;
  activatedSeats: number;
  waitlistedApplicants: number;
  releasedSeats: number;
  cancelledSeats: number;
  occupiedSeats: number;
  remainingCapacity: number;
  isOverCapacity: boolean;
  status: AdmissionCrmSeatPoolStatus;
  concurrencyStamp: string;
};

export type AdmissionCrmSeatReservationDto = {
  id: string;
  leadId: string;
  seatPoolId: string;
  seatOfferId: string;
  status: AdmissionCrmSeatReservationStatus;
  reservedAt: string;
  expiresAt: string;
  committedAt?: string | null;
  releasedAt?: string | null;
  releaseReason?: string | null;
  capacityOverrideUsed: boolean;
  capacityOverrideReason?: string | null;
};

export type AdmissionCrmSeatOfferDto = {
  id: string;
  academicYearId: string;
  leadId: string;
  seatPoolId: string;
  registrationApplicationId?: string | null;
  playbookId?: string | null;
  previousOfferId?: string | null;
  reservationId?: string | null;
  offerNumber: string;
  version: number;
  offerType: AdmissionCrmSeatOfferType;
  status: AdmissionCrmSeatOfferStatus;
  terms: Record<string, string | null>;
  language: string;
  validFrom: string;
  validUntil: string;
  submittedByUserId?: string | null;
  submittedAt?: string | null;
  approvedByUserId?: string | null;
  approvedAt?: string | null;
  issuedAt?: string | null;
  openedAt?: string | null;
  respondedAt?: string | null;
  responseSource?: string | null;
  responseReason?: string | null;
  responseSnapshot: Record<string, unknown>;
  reservation?: AdmissionCrmSeatReservationDto | null;
};

export type CreateAdmissionCrmSeatOfferDto = {
  seatPoolId: string;
  registrationApplicationId?: string | null;
  playbookId?: string | null;
  offerType: AdmissionCrmSeatOfferType;
  terms: Record<string, string | null>;
  language: string;
  validFrom: string;
  validUntil: string;
};

export type AdmissionCrmWaitlistEntryDto = {
  id: string;
  academicYearId: string;
  leadId: string;
  seatPoolId: string;
  priorityScore: number;
  positionSequence: number;
  currentPosition: number;
  status: AdmissionCrmWaitlistStatus;
  addedAt: string;
  promotedAt?: string | null;
  offerId?: string | null;
  closedAt?: string | null;
  closureReason?: string | null;
  isProtected: boolean;
  protectionReason?: string | null;
  promotionPaused: boolean;
  promotionPauseReason?: string | null;
};

export enum AdmissionCrmWaitlistHistoryAction {
  Added = 0,
  PriorityChanged = 1,
  Protected = 2,
  ProtectionRemoved = 3,
  PromotionPaused = 4,
  PromotionResumed = 5,
  OfferPrepared = 6,
  Promoted = 7,
  Withdrawn = 8,
  Expired = 9,
}

export type AdmissionCrmWaitlistHistoryDto = {
  id: string;
  waitlistEntryId: string;
  action: AdmissionCrmWaitlistHistoryAction;
  previousPriorityScore?: number | null;
  priorityScore: number;
  reason: string;
  relatedOfferId?: string | null;
  actorUserId?: string | null;
  occurredAt: string;
};

export type AdmissionCrmAdmissionDecisionDto = {
  id: string;
  academicYearId: string;
  leadId: string;
  seatPoolId?: string | null;
  offerId?: string | null;
  status: AdmissionCrmAdmissionDecisionStatus;
  reason?: string | null;
  overrideUsed: boolean;
  overrideReason?: string | null;
  decidedByUserId?: string | null;
  decidedAt?: string | null;
};

export type AdmissionCrmFeePolicyApplicabilityDto = {
  campus?: string | null;
  board?: string | null;
  medium?: string | null;
  desiredClass?: string | null;
  admissionRoute?: string | null;
  admissionRound?: string | null;
  applicantCategory?: string | null;
};

export type AdmissionCrmFeeComponentDto = {
  key: string;
  name: string;
  amount: number;
  ownerModule: string;
  accountingReference?: string | null;
  dueMilestone?: string | null;
  isRefundable: boolean;
  parentDescription?: string | null;
};

export type CreateAdmissionCrmFeePolicyDto = {
  code: string;
  name: string;
  applicability: AdmissionCrmFeePolicyApplicabilityDto;
  components: AdmissionCrmFeeComponentDto[];
  currency: string;
  gateType: AdmissionCrmPaymentGateType;
  gateMilestone: AdmissionCrmPaymentGateMilestone;
  requiredAmount: number;
  requiredPercentage: number;
  gracePeriodHours: number;
  effectiveFrom: string;
  effectiveUntil?: string | null;
};

export type AdmissionCrmFeePolicyDto = CreateAdmissionCrmFeePolicyDto & {
  id: string;
  academicYearId: string;
  version: number;
  status: AdmissionCrmFeePolicyStatus;
  submittedByUserId?: string | null;
  submittedAt?: string | null;
  approvedByUserId?: string | null;
  approvedAt?: string | null;
  publishedAt?: string | null;
  concurrencyStamp: string;
};

export type AdmissionCrmAdmissionQuotationDto = {
  id: string;
  academicYearId: string;
  leadId: string;
  feePolicyId: string;
  feePolicyVersion: number;
  quotationNumber: string;
  version: number;
  status: AdmissionCrmQuotationStatus;
  currency: string;
  components: AdmissionCrmFeeComponentDto[];
  grossAmount: number;
  concessionAmount: number;
  netAmount: number;
  gateType: AdmissionCrmPaymentGateType;
  gateMilestone: AdmissionCrmPaymentGateMilestone;
  requiredAmount: number;
  financeState: AdmissionCrmFinanceState;
  confirmedAmount: number;
  financeReference?: string | null;
  financeStateSource?: string | null;
  financeConfirmedAt?: string | null;
  validUntil: string;
  issuedAt?: string | null;
  gateOverrideUsed: boolean;
  gateOverrideReason?: string | null;
  gateOverrideUntil?: string | null;
  isGateSatisfied: boolean;
};

export type AdmissionCrmConcessionRequestDto = {
  id: string;
  academicYearId: string;
  leadId: string;
  quotationId?: string | null;
  type: AdmissionCrmConcessionType;
  status: AdmissionCrmConcessionStatus;
  requestedAmount: number;
  requestedPercentage: number;
  approvedAmount: number;
  reason: string;
  evidenceReference?: string | null;
  requestedByUserId: string;
  requestedAt: string;
  approvedByUserId?: string | null;
  approvedAt?: string | null;
  decisionReason?: string | null;
  financeReference?: string | null;
  financeAcknowledgedAt?: string | null;
};

export type AdmissionCrmFinancialReadinessDto = {
  leadId: string;
  currentQuotation?: AdmissionCrmAdmissionQuotationDto | null;
  quotationHistory: AdmissionCrmAdmissionQuotationDto[];
  concessions: AdmissionCrmConcessionRequestDto[];
  canAcceptOffer: boolean;
  canApproveAdmission: boolean;
  canActivateStudent: boolean;
  blockingReason?: string | null;
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

export type AdmissionCrmPersonInputDto = {
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  phone?: string | null;
  email?: string | null;
  provenance: AdmissionCrmPersonProvenance;
};

export type AdmissionCrmPersonDto = AdmissionCrmPersonInputDto & {
  id: string;
  studentId?: string | null;
  userId?: string | null;
  coreIdentityVerified: boolean;
  coreIdentityVerifiedAt?: string | null;
  aadhaarMasked?: string | null;
  aadhaarStatus: AdmissionCrmIdentityVerificationStatus;
  penNumber?: string | null;
  penStatus: AdmissionCrmIdentityVerificationStatus;
  apaarId?: string | null;
  apaarConsentStatus: AdmissionCrmConsentStatus;
  apaarStatus: AdmissionCrmIdentityVerificationStatus;
  udiseStudentCode?: string | null;
  udiseStatus: AdmissionCrmUdiseSyncStatus;
};

export type AdmissionCrmGuardianRelationshipDto = {
  id: string;
  guardianPersonId: string;
  guardian: AdmissionCrmPersonDto;
  relationshipType: AdmissionCrmGuardianRelationshipType;
  isPrimaryContact: boolean;
  isEmergencyContact: boolean;
  isAccountableContact: boolean;
  hasFeeResponsibility: boolean;
  hasPickupAuthorization: boolean;
  hasPortalAccess: boolean;
  communicationPriority: number;
  authorityVerified: boolean;
  authorityEvidenceReference?: string | null;
  hasProtectedRestriction: boolean;
  protectedRestriction?: string | null;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  isActive: boolean;
};

export type AdmissionCrmApplicantIdentityProfileDto = {
  id: string;
  academicYearId: string;
  leadId: string;
  applicantPersonId: string;
  householdId: string;
  householdCode: string;
  householdDisplayName: string;
  preferredLanguage: string;
  addresses: AdmissionCrmAddressDto[];
  applicant: AdmissionCrmPersonDto;
  guardians: AdmissionCrmGuardianRelationshipDto[];
  status: AdmissionCrmIdentityResolutionStatus;
  accountableContactReady: boolean;
  identityConsentReady: boolean;
  accountLinkReady: boolean;
  conflictReason?: string | null;
  overrideUsed: boolean;
  overrideReason?: string | null;
};

export type AdmissionCrmHouseholdSummaryDto = {
  id: string;
  code: string;
  displayName: string;
  preferredLanguage: string;
  activeMemberCount: number;
  addresses: AdmissionCrmAddressDto[];
};

export type AdmissionCrmAnalyticsSummaryDto = {
  academicYearId: string;
  trendFromDate: string;
  trendToDate: string;
  totalLeadCount: number;
  activeLeadCount: number;
  examScheduledLeadCount: number;
  eligibilityHandoffCount: number;
  staleLeadCount: number;
  archivedLeadCount: number;
  staleOrArchivedLeadCount: number;
  duplicateWarningCount: number;
  examScheduledRate: number;
  eligibilityHandoffRate: number;
  staleRate: number;
  archiveRate: number;
  staleOrArchivedRate: number;
  duplicateWarningRate: number;
  averageLeadScore: number;
  stageFunnel: AdmissionCrmStageFunnelDto[];
  channelPerformance: AdmissionCrmChannelPerformanceDto[];
  sourcePerformance: AdmissionCrmSourcePerformanceDto[];
  campaignPerformance: AdmissionCrmCampaignPerformanceDto[];
  staffWorkload: AdmissionCrmStaffWorkloadDto[];
  taskAnalytics: AdmissionCrmTaskAnalyticsDto;
  slaAnalytics: AdmissionCrmSlaAnalyticsDto;
  examAnalytics: AdmissionCrmExamAnalyticsDto;
  registrationAnalytics: AdmissionCrmRegistrationAnalyticsDto;
  documentAnalytics: AdmissionCrmDocumentAnalyticsDto;
  finalAdmissionAnalytics: AdmissionCrmFinalAdmissionAnalyticsDto;
  financialAnalytics: AdmissionCrmFinancialAnalyticsDto;
  householdIdentityAnalytics: AdmissionCrmHouseholdIdentityAnalyticsDto;
  policyAnalytics: AdmissionCrmPolicyAnalyticsDto;
  routeAnalytics: AdmissionCrmRouteAnalyticsDto;
  activationAnalytics: AdmissionCrmActivationAnalyticsDto;
  automationAnalytics: AdmissionCrmAutomationAnalyticsDto;
  dailyTrends: AdmissionCrmDailyTrendDto[];
};

export type AdmissionCrmPolicyAnalyticsDto = {
  activeAdoptionCount: number;
  evaluationCount: number;
  blockingFailureCount: number;
  evidencePendingCount: number;
  approvedExceptionCount: number;
  sourceReviewOverdueCount: number;
};
export type AdmissionCrmRouteAnalyticsDto = {
  assignedApplicantCount: number;
  eligibleCount: number;
  pendingReviewCount: number;
  evidencePendingCount: number;
  routeChangeCount: number;
  appealPendingCount: number;
  appealApprovedCount: number;
  applicantsByRoute: Record<string, number>;
};
export type AdmissionCrmActivationAnalyticsDto = {
  requestedCount: number;
  approvalPendingCount: number;
  firstDayReadyCount: number;
  repairRequiredCount: number;
  cancellationPendingCount: number;
  cancelledCount: number;
  firstPassSuccessCount: number;
  firstPassSuccessRate: number;
  averageAttempts: number;
  committedIdentifierCount: number;
  voidedIdentifierCount: number;
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

export type AdmissionCrmAutomationAnalyticsDto = {
  runCount: number;
  failedRunCount: number;
  failureCount: number;
  recentRuns: AdmissionCrmAutomationRunDto[];
  recentFailures: AdmissionCrmAutomationFailureDto[];
};

export type AdmissionCrmAutomationRunDto = {
  id: string;
  runType: AdmissionCrmAutomationRunType;
  status: AdmissionCrmAutomationRunStatus;
  trigger?: AdmissionCrmJourneyTrigger | null;
  stage?: AdmissionInquiryStage | null;
  leadId?: string | null;
  startedAt: string;
  completedAt: string;
  evaluatedLeadCount: number;
  matchedRuleCount: number;
  createdTaskCount: number;
  sentMessageCount: number;
  skippedExistingTaskCount: number;
  skippedExistingMessageCount: number;
  failedActionCount: number;
  markedStaleCount: number;
  archivedCount: number;
  details?: string | null;
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

export type AdmissionCrmTaskAnalyticsDto = {
  pendingCount: number;
  completedCount: number;
  overdueCount: number;
};

export type AdmissionCrmSlaAnalyticsDto = {
  firstResponseSlaHours: number;
  firstResponseCount: number;
  firstResponsePendingCount: number;
  firstResponseSlaMetCount: number;
  firstResponseSlaMissedCount: number;
  firstResponseRate: number;
  firstResponseSlaMetRate: number;
  firstResponseSlaMissedRate: number;
  averageFirstResponseHours: number;
  followUpSlaMissedCount: number;
  followUpSlaMissedRate: number;
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

export type AdmissionCrmRegistrationAnalyticsDto = {
  issuedCount: number;
  openedCount: number;
  startedCount: number;
  submittedCount: number;
  verifiedCount: number;
  admissionReadyCount: number;
  expiredCount: number;
  correctionPendingCount: number;
  abandonedCount: number;
  openRate: number;
  completionRate: number;
  verificationRate: number;
  admissionYieldRate: number;
  averageCompletionPercentage: number;
};

export type AdmissionCrmDocumentAnalyticsDto = {
  assignedChecklistCount: number;
  uploadedCount: number;
  underReviewCount: number;
  verifiedCount: number;
  rejectedCount: number;
  waivedCount: number;
  originalSeenCount: number;
  readinessConfirmedCount: number;
  readinessOverrideCount: number;
  rejectionRate: number;
  averageReviewAgeDays: number;
};

export type AdmissionCrmFinalAdmissionAnalyticsDto = {
  seatPoolCount: number;
  approvedCapacity: number;
  reservedSeatCount: number;
  acceptedSeatCount: number;
  activatedSeatCount: number;
  remainingSeatCount: number;
  overCapacityPoolCount: number;
  draftOfferCount: number;
  approvalPendingOfferCount: number;
  issuedOfferCount: number;
  acceptedOfferCount: number;
  declinedOfferCount: number;
  expiredOfferCount: number;
  cancelledOfferCount: number;
  activeWaitlistCount: number;
  promotedWaitlistCount: number;
  acceptedWaitlistCount: number;
  capacityOverrideCount: number;
  approvedDecisionCount: number;
  rejectedDecisionCount: number;
  waitlistedDecisionCount: number;
  cancelledDecisionCount: number;
  seatOccupancyRate: number;
  offerResponseRate: number;
  offerAcceptanceRate: number;
  waitlistPromotionRate: number;
  admissionApprovalRate: number;
};

export type AdmissionCrmFinancialAnalyticsDto = {
  issuedQuotationCount: number;
  financeConfirmedCount: number;
  pendingGateCount: number;
  failedOrDisputedCount: number;
  gateOverrideCount: number;
  grossQuotedAmount: number;
  concessionAmount: number;
  netQuotedAmount: number;
  confirmedAmount: number;
  outstandingAmount: number;
  concessionRequestCount: number;
  concessionApprovalPendingCount: number;
  financeAcknowledgedConcessionCount: number;
  financeAcknowledgedConcessionAmount: number;
  financeConfirmationRate: number;
  paymentGateSatisfactionRate: number;
};

export type AdmissionCrmHouseholdIdentityAnalyticsDto = {
  profileCount: number;
  readyCount: number;
  pendingReviewCount: number;
  conflictCount: number;
  overrideCount: number;
  reusedHouseholdCount: number;
  guardianRelationshipCount: number;
  missingAccountableContactCount: number;
  missingIdentityConsentCount: number;
  accountLinkPendingCount: number;
  aadhaarProvidedCount: number;
  penReadyCount: number;
  apaarReadyCount: number;
  identityReadinessRate: number;
  householdReuseRate: number;
};

export type AdmissionCrmOperationsQueueCountDto = {
  queueType: AdmissionCrmOperationsQueueType;
  label: string;
  count: number;
  urgentCount: number;
};

export type AdmissionCrmOperationsQueueSummaryDto = {
  academicYearId: string;
  generatedAt: string;
  queues: AdmissionCrmOperationsQueueCountDto[];
};

export type AdmissionCrmOperationsQueueItemDto = {
  key: string;
  leadId: string;
  examRecordId?: string | null;
  registrationApplicationId?: string | null;
  documentId?: string | null;
  checklistAssignmentId?: string | null;
  serviceHandoffId?: string | null;
  applicantName: string;
  title: string;
  details?: string | null;
  status: string;
  dueAt?: string | null;
  ageDays: number;
  isUrgent: boolean;
  ownerUserId?: string | null;
  registration?: AdmissionCrmRegistrationQueueContextDto | null;
  offer?: AdmissionCrmOfferQueueContextDto | null;
  activation?: AdmissionCrmActivationQueueContextDto | null;
  operation?: AdmissionCrmOperationQueueContextDto | null;
};

export type AdmissionCrmRegistrationQueueContextDto = {
  registrationApplicationId?: string | null;
  status?: AdmissionCrmRegistrationStatus | null;
  formNumber?: string | null;
  completionPercentage: number;
  linkExpiresAt?: string | null;
  feeStatus?: AdmissionCrmRegistrationFeeStatus | null;
  documentTotalCount: number;
  documentResolvedCount: number;
  documentPendingCount: number;
  currentDocumentStatus?: AdmissionCrmApplicantDocumentStatus | null;
  readinessConfirmed: boolean;
};

export type AdmissionCrmOfferQueueContextDto = {
  offerId?: string | null;
  offerNumber?: string | null;
  offerStatus?: AdmissionCrmSeatOfferStatus | null;
  offerExpiresAt?: string | null;
  seatPoolId?: string | null;
  seatPoolName?: string | null;
  remainingSeats?: number | null;
  decisionStatus?: AdmissionCrmAdmissionDecisionStatus | null;
  routeType?: AdmissionCrmRouteType | null;
  routeStatus?: AdmissionCrmRouteEligibilityStatus | null;
  financeState?: AdmissionCrmFinanceState | null;
  paymentGateSatisfied?: boolean | null;
};

export type AdmissionCrmActivationQueueContextDto = {
  activationId?: string | null;
  studentId?: string | null;
  activationReference?: string | null;
  status?: AdmissionCrmActivationStatus | null;
  placementConfigured: boolean;
  rollNumber?: number | null;
  requireStudentAccount: boolean;
  requireGuardianAccount: boolean;
  attemptCount: number;
  repairStep?: string | null;
  repairReason?: string | null;
};

export type AdmissionCrmOperationQueueContextDto = {
  queueType: AdmissionCrmOperationsQueueType;
  severity: string;
  assignmentStatus: string;
  serviceHandoffStatus?: AdmissionCrmServiceHandoffStatus | null;
  retryAttemptCount?: number | null;
};

export type AdmissionCrmEnrollmentOverviewItemDto = {
  workspace: 'registrations' | 'offers' | 'activation' | 'exams' | 'operations';
  queueType: AdmissionCrmOperationsQueueType;
  item: AdmissionCrmOperationsQueueItemDto;
};

export type AdmissionCrmEnrollmentOverviewDto = {
  academicYearId: string;
  generatedAt: string;
  unassignedLeadCount: number;
  upcomingExamCount: number;
  expiringRegistrationCount: number;
  pendingApprovalCount: number;
  activationFailureCount: number;
  handoffBlockerCount: number;
  urgentCount: number;
  queues: AdmissionCrmOperationsQueueCountDto[];
  urgentItems: AdmissionCrmEnrollmentOverviewItemDto[];
};

export type AdmissionCrmOperationsQueueDto = {
  academicYearId: string;
  queueType: AdmissionCrmOperationsQueueType;
  label: string;
  generatedAt: string;
  totalCount: number;
  items: AdmissionCrmOperationsQueueItemDto[];
};

export type AdmissionCrmOperationsQueueFilters = {
  search?: string;
  ownerUserId?: string;
  assignedToUserId?: string;
  urgentOnly?: boolean;
  minimumAgeDays?: number;
  dueBefore?: string;
  registrationStatus?: AdmissionCrmRegistrationStatus;
  documentStatus?: AdmissionCrmApplicantDocumentStatus;
  offerStatus?: AdmissionCrmSeatOfferStatus;
  routeType?: AdmissionCrmRouteType;
  seatPoolId?: string;
  activationStatus?: AdmissionCrmActivationStatus;
  serviceHandoffStatus?: AdmissionCrmServiceHandoffStatus;
  skipCount?: number;
  maxResultCount?: number;
};

export type AdmissionCrmOperationsSavedViewDto = {
  id: string;
  academicYearId: string;
  ownerUserId: string;
  name: string;
  queueType: AdmissionCrmOperationsQueueType;
  filters: AdmissionCrmOperationsQueueFilters;
  isShared: boolean;
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

export const buildIssueAdmissionCrmRegistrationFormRequest = ({
  leadId,
  body,
}: {
  leadId: string;
  body: IssueAdmissionCrmRegistrationFormDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/registration-form`,
  method: 'POST',
  body,
});

export const buildAdmissionCrmExamListRequest = ({
  academicYearId,
  ...params
}: { academicYearId: string } & AdmissionCrmEntranceExamListParams): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/exams`,
  method: 'GET',
  params,
});

export const buildAdmissionCrmAnalyticsSummaryRequest = ({
  academicYearId,
  ...params
}: { academicYearId: string } & AdmissionCrmAnalyticsSummaryParams): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/analytics/summary`,
  method: 'GET',
  params,
});

export const buildAdmissionCrmOperationsQueueSummaryRequest = ({
  academicYearId,
}: {
  academicYearId: string;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/operations/queues/summary`,
  method: 'GET',
});

export const buildAdmissionCrmEnrollmentOverviewRequest = ({
  academicYearId,
}: {
  academicYearId: string;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/operations/overview`,
  method: 'GET',
});

export const buildAdmissionCrmOperationsQueueRequest = ({
  academicYearId,
  queueType,
  ...params
}: {
  academicYearId: string;
  queueType: AdmissionCrmOperationsQueueType;
} & AdmissionCrmOperationsQueueFilters): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/operations/queues/${queueType}`,
  method: 'GET',
  params: { maxResultCount: 50, ...params },
});

export const buildAdmissionCrmMessageTemplateListRequest = ({
  academicYearId,
  ...params
}: { academicYearId: string } & AdmissionCrmMessageTemplateListParams): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/message-templates`,
  method: 'GET',
  params,
});

export const buildAdmissionCrmPlaybookListRequest = ({
  academicYearId,
  ...params
}: { academicYearId: string } & AdmissionCrmPlaybookListParams): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/playbooks`,
  method: 'GET',
  params,
});

export const buildCreateAdmissionCrmPlaybookRequest = ({
  academicYearId,
  body,
}: {
  academicYearId: string;
  body: AdmissionCrmPlaybookUpsertDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/playbooks`,
  method: 'POST',
  body,
});

export const buildResolveAdmissionCrmPlaybookRequest = ({
  academicYearId,
  body,
}: {
  academicYearId: string;
  body: ResolveAdmissionCrmPlaybookDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/playbooks/resolve`,
  method: 'POST',
  body,
});

export const buildGenerateAdmissionCrmPlaybookSlotsRequest = ({
  playbookId,
  body,
}: {
  playbookId: string;
  body: GenerateAdmissionCrmPlaybookSlotsDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/configuration/playbooks/${playbookId}/slots/generate`,
  method: 'POST',
  body,
});

export const buildRecommendAdmissionCrmPlaybookSlotRequest = ({
  playbookId,
  body,
}: {
  playbookId: string;
  body: RecommendAdmissionCrmPlaybookSlotDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/configuration/playbooks/${playbookId}/slots/recommend`,
  method: 'POST',
  body,
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

export const buildAdmissionCrmRegistrationTemplateListRequest = ({
  academicYearId,
  ...params
}: { academicYearId: string } & AdmissionCrmRegistrationTemplateListParams): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/registration-templates`,
  method: 'GET',
  params,
});

export const buildCreateAdmissionCrmRegistrationTemplateRequest = ({
  academicYearId,
  body,
}: {
  academicYearId: string;
  body: AdmissionCrmRegistrationTemplateUpsertDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/registration-templates`,
  method: 'POST',
  body,
});

export const buildAdmissionCrmFormNumberSeriesListRequest = ({
  academicYearId,
}: {
  academicYearId: string;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/form-number-series`,
  method: 'GET',
});

export const buildIssueAdmissionCrmRegistrationApplicationRequest = ({
  leadId,
  body,
}: {
  leadId: string;
  body: IssueAdmissionCrmRegistrationApplicationDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/registrations/issue`,
  method: 'POST',
  body,
});

export const buildSavePublicAdmissionCrmRegistrationRequest = ({
  tenantId,
  token,
  body,
}: {
  tenantId: string;
  token: string;
  body: { accessSessionToken: string; responses: Record<string, unknown> };
}): FetchArgs => ({
  url: `/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/registration`,
  method: 'PUT',
  body,
});

export const buildAdmissionCrmDocumentChecklistTemplateListRequest = ({
  academicYearId,
  ...params
}: {
  academicYearId: string;
  filter?: string;
  status?: AdmissionCrmDocumentChecklistTemplateStatus;
  skipCount?: number;
  maxResultCount?: number;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/document-checklists`,
  method: 'GET',
  params,
});

export const buildAssignAdmissionCrmDocumentChecklistRequest = ({
  registrationApplicationId,
  checklistTemplateId,
}: {
  registrationApplicationId: string;
  checklistTemplateId: string;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/registrations/${registrationApplicationId}/document-checklist`,
  method: 'POST',
  body: { checklistTemplateId },
});

export const buildPublicAdmissionCrmDocumentUploadUrl = ({
  tenantId,
  token,
}: {
  tenantId: string;
  token: string;
}) =>
  `/public/student-enrollment/admissions-crm/${tenantId}/status/${token}/registration/documents`;

export const buildAdmissionCrmSchoolDefaultCycleConfigurationRequest = (): FetchArgs => ({
  url: '/student-enrollment/admissions-crm/configuration/cycle-default',
  method: 'GET',
});

export const buildUpdateAdmissionCrmSchoolDefaultCycleConfigurationRequest = ({
  body,
}: {
  body: Partial<AdmissionCrmCycleConfigurationDto>;
}): FetchArgs => ({
  url: '/student-enrollment/admissions-crm/configuration/cycle-default',
  method: 'PUT',
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

export const buildPublicAdmissionCrmDeliveryCallbackRequest = ({
  tenantId,
  deliveryLogId,
  body,
}: {
  tenantId: string;
  deliveryLogId: string;
  body: ApplyAdmissionCrmDeliveryCallbackDto;
}): FetchArgs => ({
  url: `/public/student-enrollment/admissions-crm/${tenantId}/communication/delivery-logs/${deliveryLogId}/callback`,
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

export const buildAdmissionCrmJourneyRulesRunRequest = ({
  academicYearId,
  body,
}: {
  academicYearId: string;
  body: RunAdmissionCrmJourneyRulesDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/automation/journeys/run`,
  method: 'POST',
  body,
});

export const buildPublicAdmissionCrmFormRequest = ({
  tenantId,
  templateId,
  language,
}: {
  tenantId: string;
  templateId: string;
  language?: 'en' | 'gu' | 'hi';
}): FetchArgs => ({
  url: `/public/student-enrollment/admissions-crm/${tenantId}/forms/${templateId}`,
  method: 'GET',
  ...(language ? { params: { language } } : {}),
});

export const buildAdmissionCrmSeatPoolListRequest = ({
  academicYearId,
  ...params
}: {
  academicYearId: string;
  filter?: string;
  status?: AdmissionCrmSeatPoolStatus;
  skipCount?: number;
  maxResultCount?: number;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/final-admission/seat-pools`,
  method: 'GET',
  params,
});

export const buildCreateAdmissionCrmSeatPoolRequest = ({
  academicYearId,
  body,
}: {
  academicYearId: string;
  body: AdmissionCrmSeatPoolUpsertDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/final-admission/seat-pools`,
  method: 'POST',
  body,
});

export const buildAdmissionCrmOfferListRequest = ({
  academicYearId,
  ...params
}: {
  academicYearId: string;
  leadId?: string;
  seatPoolId?: string;
  status?: AdmissionCrmSeatOfferStatus;
  skipCount?: number;
  maxResultCount?: number;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/final-admission/offers`,
  method: 'GET',
  params,
});

export const buildCreateAdmissionCrmOfferRequest = ({
  leadId,
  body,
}: {
  leadId: string;
  body: CreateAdmissionCrmSeatOfferDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/final-admission/offers`,
  method: 'POST',
  body,
});

export const buildAdmissionCrmDecisionHistoryRequest = ({
  leadId,
}: {
  leadId: string;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/final-admission/decisions`,
  method: 'GET',
});

export const buildAdmissionCrmPolicyPackListRequest = (params: {
  status?: AdmissionCrmPolicyPackStatus;
  board?: string;
  jurisdiction?: string;
  skipCount?: number;
  maxResultCount?: number;
}): FetchArgs => ({
  url: '/student-enrollment/admissions-crm/policy-packs',
  method: 'GET',
  params,
});

export const buildAdmissionCrmActivationPreviewRequest = ({
  leadId,
  body,
}: {
  leadId: string;
  body: Record<string, unknown>;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/activation/preview`,
  method: 'POST',
  body,
});

export const buildAdmissionCrmRouteDefinitionListRequest = ({
  academicYearId,
}: {
  academicYearId: string;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/admission-routes`,
  method: 'GET',
});

export const buildAssignAdmissionCrmSpecialRouteRequest = ({
  leadId,
  body,
}: {
  leadId: string;
  body: Record<string, unknown>;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/leads/${leadId}/admission-route`,
  method: 'POST',
  body,
});

export const buildAdmissionCrmDataQualityListRequest = ({
  academicYearId,
  ...params
}: {
  academicYearId: string;
  status?: AdmissionCrmDataQualityIssueStatus;
  minimumSeverity?: AdmissionCrmDataQualityIssueSeverity;
  maxResultCount?: number;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/governance/data-quality`,
  method: 'GET',
  params,
});

export enum AdmissionCrmPolicyPackStatus {
  Draft = 0,
  ReviewPending = 1,
  Approved = 2,
  Published = 3,
  Superseded = 4,
  Retired = 5,
}

export interface AdmissionCrmIdentifierGovernanceReportDto {
  academicYearId: string;
  numberSeriesId: string;
  seriesCode: string;
  startingSequence: number;
  nextSequence: number;
  maximumSequence?: number | null;
  allocatedCount: number;
  committedCount: number;
  manualCount: number;
  voidedCount: number;
  isExhausted: boolean;
  gapSequences: number[];
  gapReportTruncated: boolean;
  allocations: Array<{
    id: string;
    value: string;
    sequence: number;
    status: number;
    isManual: boolean;
    lifecycleReason?: string | null;
  }>;
}

export enum AdmissionCrmPolicyRuleType {
  AgeEligibility = 0,
  ClassEligibility = 1,
  QualifyingExamination = 2,
  PriorSchoolRecognition = 3,
  DocumentEvidence = 4,
  AdmissionDeadline = 5,
  AuthorityApproval = 6,
  SeatPool = 7,
  Allotment = 8,
  AdmissionRegister = 9,
  PermanentNumber = 10,
  GovernmentIdentifier = 11,
  Consent = 12,
  GovernmentReporting = 13,
  SchoolDefined = 14,
}

export enum AdmissionCrmPolicyRuleSeverity {
  Information = 0,
  Warning = 1,
  Blocking = 2,
  ApprovalRequired = 3,
}

export enum AdmissionCrmPolicyEvaluationStatus {
  NotEvaluated = 0,
  Satisfied = 1,
  NotSatisfied = 2,
  EvidencePending = 3,
  ManualReviewRequired = 4,
  ExceptionApproved = 5,
  NotApplicable = 6,
}

export enum AdmissionCrmPolicyExceptionStatus {
  ApprovalPending = 0,
  Approved = 1,
  Rejected = 2,
  Expired = 3,
  Revoked = 4,
}

export interface AdmissionCrmPolicySourceDto {
  authority: string;
  title: string;
  url: string;
  publishedOrEffectiveAt: string;
  verifiedAt: string;
  applicabilityNote: string;
}

export interface AdmissionCrmPolicyRuleDto {
  code: string;
  name: string;
  type: AdmissionCrmPolicyRuleType;
  severity: AdmissionCrmPolicyRuleSeverity;
  description: string;
  desiredClass?: string | null;
  admissionRoute?: string | null;
  ageCutoffDate?: string | null;
  minimumAgeYears?: number | null;
  maximumAgeYears?: number | null;
  requiredEvidenceCode?: string | null;
  deadline?: string | null;
  manualVerificationRequired: boolean;
  sourceAuthority: string;
  sourceUrl: string;
}

export interface AdmissionCrmPolicyPackDto {
  id: string;
  code: string;
  name: string;
  jurisdiction: string;
  board: string;
  version: number;
  status: AdmissionCrmPolicyPackStatus;
  sources: AdmissionCrmPolicySourceDto[];
  rules: AdmissionCrmPolicyRuleDto[];
  effectiveFrom: string;
  effectiveUntil?: string | null;
  reviewDueAt: string;
  sourceReviewOverdue: boolean;
}

export interface AdmissionCrmPolicyBaselineInstallResultDto {
  catalogVerifiedAt: string;
  createdDrafts: AdmissionCrmPolicyPackDto[];
  alreadyCurrentCodes: string[];
}

export interface AdmissionCrmPolicyAdoptionDto {
  id: string;
  academicYearId: string;
  policyPackId: string;
  policyPackVersion: number;
  applicability: Record<string, string | null | undefined>;
  overrides: Array<Record<string, unknown>>;
  impactWarnings: string[];
  overrideReason?: string | null;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  adoptedByUserId: string;
  adoptedAt: string;
  isActive: boolean;
}

export interface AdmissionCrmPolicyEvaluationDto {
  id: string;
  leadId: string;
  policyAdoptionId: string;
  ruleCode: string;
  ruleType: AdmissionCrmPolicyRuleType;
  severity: AdmissionCrmPolicyRuleSeverity;
  status: AdmissionCrmPolicyEvaluationStatus;
  inputSnapshot: Record<string, unknown>;
  evidenceReferences: string[];
  explanation: string;
  evaluatedAt: string;
  exceptionId?: string | null;
}

export interface AdmissionCrmPolicyExceptionDto {
  id: string;
  leadId: string;
  evaluationId: string;
  status: AdmissionCrmPolicyExceptionStatus;
  reason: string;
  evidenceReference: string;
  requestedAt: string;
  decisionReason?: string | null;
  expiresAt?: string | null;
}

export interface AdmissionCrmPolicyReadinessDto {
  leadId: string;
  evaluations: AdmissionCrmPolicyEvaluationDto[];
  exceptions: AdmissionCrmPolicyExceptionDto[];
  blockingFailureCount: number;
  pendingEvidenceCount: number;
  isPolicyReady: boolean;
}

export enum AdmissionCrmActivationStatus {
  Draft = 0,
  ApprovalPending = 1,
  Approved = 2,
  InProgress = 3,
  RepairRequired = 4,
  FirstDayReady = 5,
  Cancelled = 6,
  CancellationPending = 7,
}

export enum AdmissionCrmActivationStepStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2,
  NotRequired = 3,
  Overridden = 4,
}

export enum AdmissionCrmIdentifierType {
  GrNumber = 0,
  AdmissionNumber = 1,
  StudentCode = 2,
  TemporaryEnrollmentNumber = 3,
  SchoolDefined = 4,
}

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

export interface AdmissionCrmPlacementOptionDto {
  educationBoardId: string;
  boardName: string;
  academicMediumId: string;
  mediumName: string;
  academicMediumStageId: string;
  stageName: string;
  standardId: string;
  standardName: string;
  divisionId: string;
  divisionName: string;
  divisionStrength: number;
}

export interface AdmissionCrmActivationReadinessItemDto {
  key: string;
  label: string;
  status: AdmissionCrmActivationStepStatus;
  blocking: boolean;
  detail: string;
}

export interface AdmissionCrmActivationPreviewDto {
  leadId: string;
  items: AdmissionCrmActivationReadinessItemDto[];
  isReady: boolean;
  existingStudentId?: string | null;
  grNumberPreview: string;
  divisionStrength: number;
  divisionOccupancy: number;
}

export interface AdmissionCrmActivationDto {
  id: string;
  academicYearId: string;
  leadId: string;
  studentId?: string | null;
  activationReference: string;
  status: AdmissionCrmActivationStatus;
  educationBoardId: string;
  academicMediumId: string;
  academicMediumStageId: string;
  standardId: string;
  divisionId: string;
  grNumberSeriesId: string;
  rollNumber?: number | null;
  gender: number;
  requireStudentAccount: boolean;
  requireGuardianAccount: boolean;
  steps: Array<{
    key: string;
    status: AdmissionCrmActivationStepStatus;
    detail: string;
    updatedAt: string;
  }>;
  identifiers: Array<{
    id: string;
    identifierType: AdmissionCrmIdentifierType;
    value: string;
    sequence: number;
    status: number;
    isManual: boolean;
    assignedByUserId?: string | null;
    lifecycleReason?: string | null;
  }>;
  attemptCount: number;
  repairStep?: string | null;
  repairReason?: string | null;
  firstDayReadyAt?: string | null;
  cancellationRequestedByUserId?: string | null;
  cancellationRequestedAt?: string | null;
  cancellationReason?: string | null;
  cancelledByUserId?: string | null;
  cancelledAt?: string | null;
  serviceHandoffs: AdmissionCrmServiceHandoffDto[];
}

export interface AdmissionCrmActivationCancellationPreviewDto {
  activationId: string;
  canCancel: boolean;
  cancellationWindowEndsAt?: string | null;
  checks: Array<{ key: string; passed: boolean; detail: string }>;
}

export enum AdmissionCrmRouteType {
  Fresh = 0,
  SiblingPriority = 1,
  AlumniPreference = 2,
  StaffChild = 3,
  RteEws = 4,
  Transfer = 5,
  Lateral = 6,
  MidYear = 7,
  ReturningStudent = 8,
  Interstate = 9,
  OverseasReturn = 10,
  Direct = 11,
  ManagementApproved = 12,
  SchoolDefined = 13,
}

export enum AdmissionCrmRouteDefinitionStatus {
  Draft = 0,
  ApprovalPending = 1,
  Published = 2,
  Retired = 3,
}
export enum AdmissionCrmRouteEligibilityStatus {
  PendingReview = 0,
  EvidencePending = 1,
  Eligible = 2,
  Ineligible = 3,
  ExceptionApproved = 4,
  Withdrawn = 5,
  Superseded = 6,
}
export enum AdmissionCrmRouteAppealStatus {
  Requested = 0,
  UnderReview = 1,
  Approved = 2,
  Rejected = 3,
  Withdrawn = 4,
}

export interface AdmissionCrmRouteDefinitionDto {
  id: string;
  academicYearId: string;
  code: string;
  name: string;
  routeType: AdmissionCrmRouteType;
  version: number;
  status: AdmissionCrmRouteDefinitionStatus;
  configuration: {
    requiresPolicyEvaluation: boolean;
    requiresDistinctApproval: boolean;
    allowsExamWaiver: boolean;
    allowsOfferWaiver: boolean;
    seatPoolCode?: string | null;
    feePolicyCode?: string | null;
    requiredEvidenceCodes: string[];
    priorityWeight?: number | null;
    decisionSlaHours?: number | null;
  };
  effectiveFrom: string;
  effectiveUntil?: string | null;
}

export interface AdmissionCrmRouteAssignmentDto {
  id: string;
  leadId: string;
  routeDefinitionId: string;
  routeDefinitionVersion: number;
  routeType: AdmissionCrmRouteType;
  status: AdmissionCrmRouteEligibilityStatus;
  routeData: Record<string, string | number | boolean | null | undefined>;
  evidenceReferences: string[];
  previousAssignmentId?: string | null;
  assignmentReason: string;
  isPrimary: boolean;
  assignedAt: string;
  evaluatedAt?: string | null;
  evaluationReason?: string | null;
}

export interface AdmissionCrmRouteImpactPreviewDto {
  leadId: string;
  currentRoute?: AdmissionCrmRouteAssignmentDto | null;
  targetRoute: AdmissionCrmRouteDefinitionDto;
  impacts: Array<{ area: string; impact: string; requiresResolution: boolean }>;
  hasBlockingImpact: boolean;
}

export interface AdmissionCrmRouteAppealDto {
  id: string;
  leadId: string;
  routeAssignmentId: string;
  originalStatus: AdmissionCrmRouteEligibilityStatus;
  requestedStatus: AdmissionCrmRouteEligibilityStatus;
  reason: string;
  evidenceReferences: string[];
  status: AdmissionCrmRouteAppealStatus;
  requestedAt: string;
  decidedAt?: string | null;
  decisionReason?: string | null;
}

export interface AdmissionCrmRteAllotmentImportRowDto {
  leadId?: string | null;
  applicantReference?: string | null;
  routeDefinitionId: string;
  routeData: Record<string, unknown>;
  evidenceReferences: string[];
}

export interface AdmissionCrmRteAllotmentImportResultDto {
  succeeded: number;
  failed: number;
  items: Array<{
    leadId?: string | null;
    applicantReference?: string | null;
    allotmentNumber?: string | null;
    success: boolean;
    errorCode?: string | null;
    routeAssignmentId?: string | null;
  }>;
}

export interface AdmissionCrmOfferExpiryRunResultDto {
  academicYearId: string;
  evaluatedCount: number;
  expiredCount: number;
  failedCount: number;
  failedOfferIds: string[];
}

export enum AdmissionCrmDataQualityIssueType {
  DuplicateApplicant = 0,
  DuplicatePerson = 1,
  AcceptedOfferWithoutReservation = 2,
  ActivatedStudentWithoutLineage = 3,
  DuplicateIdentifier = 4,
  InvalidPlacement = 5,
  ImpossibleActivationState = 6,
  StalePaymentState = 7,
  OrphanedSeatReservation = 8,
  MissingAuditReference = 9,
  ServiceHandoffFailure = 10,
  StalePrivacyRequest = 11,
  ExpiredSensitiveExportContent = 12,
}

export enum AdmissionCrmDataQualityIssueSeverity {
  Information = 0,
  Warning = 1,
  Error = 2,
  Critical = 3,
}
export enum AdmissionCrmDataQualityIssueStatus {
  Open = 0,
  Acknowledged = 1,
  Resolved = 2,
  Ignored = 3,
}

export interface AdmissionCrmDataQualityIssueDto {
  id: string;
  academicYearId: string;
  issueType: AdmissionCrmDataQualityIssueType;
  severity: AdmissionCrmDataQualityIssueSeverity;
  status: AdmissionCrmDataQualityIssueStatus;
  leadId?: string | null;
  studentId?: string | null;
  title: string;
  details: Record<string, string | null | undefined>;
  impactedReports: string[];
  firstDetectedAt: string;
  lastDetectedAt: string;
  ownerUserId?: string | null;
  resolutionReason?: string | null;
  resolvedAt?: string | null;
}

export enum AdmissionCrmRetentionCategory {
  UnsuccessfulApplicant = 0,
  WithdrawnApplicant = 1,
  DuplicateApplicant = 2,
  ActivatedStudent = 3,
  FinancialReference = 4,
  Consent = 5,
  GovernmentAcknowledgement = 6,
  CustodyEvidence = 7,
  Audit = 8,
}

export enum AdmissionCrmRetentionAction {
  ReviewOnly = 0,
  Anonymize = 1,
  DeleteWherePermitted = 2,
}
export enum AdmissionCrmGovernedConfigurationStatus {
  Draft = 0,
  ApprovalPending = 1,
  Published = 2,
  Retired = 3,
}
export enum AdmissionCrmPrivacyRequestType {
  Anonymization = 0,
  Deletion = 1,
  OptionalConsentWithdrawal = 2,
}
export enum AdmissionCrmPrivacyRequestStatus {
  Requested = 0,
  ApprovalPending = 1,
  Approved = 2,
  Rejected = 3,
  Completed = 4,
}
export enum AdmissionCrmExportReportType {
  Funnel = 0,
  OperationsQueue = 1,
  AuditTimeline = 2,
  GovernmentReadiness = 3,
  DataQuality = 4,
}
export enum AdmissionCrmExportStatus {
  Ready = 0,
  Expired = 1,
  Revoked = 2,
  Failed = 3,
}
export enum AdmissionCrmReportFrequency {
  Daily = 0,
  Weekly = 1,
  Monthly = 2,
}
export enum AdmissionCrmDelegationStatus {
  Scheduled = 0,
  Active = 1,
  Expired = 2,
  Cancelled = 3,
}

export type AdmissionCrmRetentionPolicyDto = {
  id: string;
  academicYearId: string;
  code: string;
  name: string;
  category: AdmissionCrmRetentionCategory;
  action: AdmissionCrmRetentionAction;
  retainDays: number;
  scope: Record<string, string | null>;
  authorityNote: string;
  status: AdmissionCrmGovernedConfigurationStatus;
  submittedByUserId?: string | null;
  approvedByUserId?: string | null;
  publishedAt?: string | null;
};

export type AdmissionCrmPrivacyPreviewDto = {
  leadId: string;
  type: AdmissionCrmPrivacyRequestType;
  retentionBlockers: string[];
  plannedActions: string[];
  applicablePolicyIds: string[];
  requiresManualExecution: boolean;
};

export type AdmissionCrmPrivacyRequestDto = {
  id: string;
  academicYearId: string;
  leadId: string;
  type: AdmissionCrmPrivacyRequestType;
  reason: string;
  preview: AdmissionCrmPrivacyPreviewDto;
  status: AdmissionCrmPrivacyRequestStatus;
  requestedByUserId: string;
  requestedAt: string;
  decidedByUserId?: string | null;
  decidedAt?: string | null;
  decisionReason?: string | null;
  completionReference?: string | null;
  completedAt?: string | null;
};

export type AdmissionCrmExportRequestDto = {
  id: string;
  academicYearId: string;
  reportType: AdmissionCrmExportReportType;
  definitionVersion: string;
  filters: Record<string, string | null>;
  fileName: string;
  status: AdmissionCrmExportStatus;
  requestedByUserId: string;
  requestedAt: string;
  dataAsOf: string;
  expiresAt: string;
  downloadCount: number;
  lastDownloadedAt?: string | null;
};

export type AdmissionCrmExportDownloadDto = {
  fileName: string;
  contentType: string;
  base64Content: string;
  expiresAt: string;
};

export type AdmissionCrmReportScheduleDto = {
  id: string;
  academicYearId: string;
  name: string;
  reportType: AdmissionCrmExportReportType;
  frequency: AdmissionCrmReportFrequency;
  destination: string;
  filters: Record<string, string | null>;
  nextRunAt: string;
  isActive: boolean;
  lastRunAt?: string | null;
};

export type AdmissionCrmReportScheduleRunResultDto = {
  academicYearId: string;
  evaluatedCount: number;
  generatedCount: number;
  failedCount: number;
  exportIds: string[];
  failedScheduleIds: string[];
};

export type AdmissionCrmWorkDelegationDto = {
  id: string;
  academicYearId: string;
  delegatorUserId: string;
  delegateUserId: string;
  queueTypes: AdmissionCrmOperationsQueueType[];
  startsAt: string;
  endsAt: string;
  reason: string;
  status: AdmissionCrmDelegationStatus;
};

export type AdmissionCrmForecastDto = {
  academicYearId: string;
  generatedAt: string;
  historicalLeadCount: number;
  currentOpenLeadCount: number;
  observedOfferAcceptanceRate: number;
  observedActivationRate: number;
  projectedAdditionalAcceptedOffers: number;
  projectedAdditionalActivations: number;
  confidence: string;
  inputs: string[];
  limitations: string[];
  isAdvisory: boolean;
};

export type AdmissionCrmBulkOperationItemResultDto = {
  entityId: string;
  success: boolean;
  resultId?: string | null;
  errorCode?: string | null;
  message?: string | null;
  blockingReasons: string[];
};

export type AdmissionCrmBulkOperationResultDto = {
  requestedCount: number;
  succeededCount: number;
  failedCount: number;
  items: AdmissionCrmBulkOperationItemResultDto[];
};

export interface AdmissionCrmReconciliationResultDto {
  academicYearId: string;
  dataAsOf: string;
  detectedCount: number;
  newCount: number;
  reopenedCount: number;
  autoResolvedCount: number;
  countsByType: Record<string, number>;
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

export type AdmissionCrmGeneratedDocumentDto = {
  leadId: string;
  academicYearId: string;
  documentType: AdmissionCrmGeneratedDocumentType;
  documentTypeName: string;
  language: string;
  fileName: string;
  contentType: string;
  content: string;
  isPreview: boolean;
  generatedAt: string;
  timelineEventId?: string | null;
};

export type AdmissionCrmGeneratedDocumentHistoryDto = {
  timelineEventId: string;
  leadId: string;
  documentType: AdmissionCrmGeneratedDocumentType;
  documentTypeName: string;
  fileName: string;
  language: string;
  reason?: string | null;
  generatedAt: string;
  actorUserId?: string | null;
};

export type AdmissionCrmGeneratedDocumentAvailabilityDto = {
  documentType: AdmissionCrmGeneratedDocumentType;
  isAvailable: boolean;
  reasonCode?: string | null;
  message: string;
};

export const StudentAdmissionsCrmApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionCrmInquirySources: builder.query<
      PagedResult<AdmissionCrmInquirySourceDto>,
      { academicYearId: string; includeInactive?: boolean }
    >({
      query: ({ academicYearId, ...params }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/catalog/inquiry-sources`,
        method: 'GET',
        params,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmExamSlots: builder.query<
      PagedResult<AdmissionCrmExamSlotDto>,
      { academicYearId: string; from?: string; to?: string; includeInactive?: boolean }
    >({
      query: ({ academicYearId, ...params }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/catalog/exam-slots`,
        method: 'GET',
        params,
      }),
      providesTags: [studentAdmissionsCrmType.configuration, studentAdmissionsCrmType.exam],
    }),
    getAdmissionCrmStaff: builder.query<
      AdmissionCrmStaffLookupDto[],
      {
        filter?: string;
        ids?: string;
        maxResultCount?: number;
        academicYearId?: string;
        ownerOnly?: boolean;
      } | void
    >({
      query: (params) => ({
        url: '/student-enrollment/admissions-crm/workspace/staff',
        method: 'GET',
        params: params || undefined,
      }),
    }),
    getAdmissionCrmIntegrationCapabilities: builder.query<
      AdmissionCrmIntegrationCapabilityDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/workspace/integration-capabilities`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmLeads: builder.query<
      PagedResult<AdmissionCrmLeadDto>,
      { academicYearId: string } & AdmissionCrmLeadListParams
    >({
      query: buildAdmissionCrmLeadListRequest,
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    getAdmissionCrmLead: builder.query<AdmissionCrmLeadDto, { leadId: string }>({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    previewAdmissionCrmGeneratedDocument: builder.mutation<
      AdmissionCrmGeneratedDocumentDto,
      { leadId: string; documentType: AdmissionCrmGeneratedDocumentType; language?: string }
    >({
      query: ({ leadId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/documents/preview`,
        method: 'POST',
        body,
      }),
    }),
    issueAdmissionCrmGeneratedDocument: builder.mutation<
      AdmissionCrmGeneratedDocumentDto,
      {
        leadId: string;
        documentType: AdmissionCrmGeneratedDocumentType;
        language?: string;
        reason?: string | null;
      }
    >({
      query: ({ leadId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/documents/issue`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.timeline],
    }),
    getAdmissionCrmGeneratedDocumentHistory: builder.query<
      AdmissionCrmGeneratedDocumentHistoryDto[],
      { leadId: string }
    >({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/documents/history`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.timeline],
    }),
    getAdmissionCrmGeneratedDocumentAvailability: builder.query<
      AdmissionCrmGeneratedDocumentAvailabilityDto[],
      { leadId: string }
    >({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/documents/availability`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.exam],
    }),
    createAdmissionCrmLead: builder.mutation<
      AdmissionCrmLeadDto,
      { academicYearId: string; body: CreateAdmissionCrmLeadDto }
    >({
      query: buildCreateAdmissionCrmLeadRequest,
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    previewAdmissionCrmLeadDuplicates: builder.mutation<
      AdmissionCrmLeadDuplicateDto[],
      { academicYearId: string; body: AdmissionCrmLeadDuplicatePreviewInput }
    >({
      query: buildPreviewAdmissionCrmLeadDuplicatesRequest,
    }),
    assignAdmissionCrmLeadOwner: builder.mutation<
      AdmissionCrmLeadDto,
      { leadId: string; body: { ownerUserId?: string | null } }
    >({
      query: ({ leadId, body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/owner`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    changeAdmissionCrmLeadPriority: builder.mutation<
      AdmissionCrmLeadDto,
      { leadId: string; body: ChangeAdmissionCrmLeadPriorityDto }
    >({
      query: buildChangeAdmissionCrmLeadPriorityRequest,
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    changeAdmissionCrmLeadStage: builder.mutation<
      AdmissionCrmLeadDto,
      { leadId: string; body: ChangeAdmissionCrmLeadStageDto }
    >({
      query: buildChangeAdmissionCrmLeadStageRequest,
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.task,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    issueAdmissionCrmRegistrationForm: builder.mutation<
      AdmissionCrmLeadDto,
      { leadId: string; body: IssueAdmissionCrmRegistrationFormDto }
    >({
      query: buildIssueAdmissionCrmRegistrationFormRequest,
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    recalculateAdmissionCrmLeadScore: builder.mutation<AdmissionCrmLeadDto, { leadId: string }>({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/score/recalculate`,
        method: 'POST',
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    mergeAdmissionCrmDuplicateLead: builder.mutation<
      AdmissionCrmLeadDto,
      { leadId: string; body: { duplicateLeadId: string; reason: string } }
    >({
      query: buildMergeAdmissionCrmDuplicateLeadRequest,
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    archiveAdmissionCrmLead: builder.mutation<
      AdmissionCrmLeadDto,
      { leadId: string; body: { reason: string } }
    >({
      query: ({ leadId, body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/archive`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    reopenAdmissionCrmLead: builder.mutation<
      AdmissionCrmLeadDto,
      { leadId: string; body: { reason: string } }
    >({
      query: ({ leadId, body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/reopen`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    runAdmissionCrmStaleRules: builder.mutation<unknown, { academicYearId: string }>({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/automation/stale-archive/run`,
        method: 'POST',
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    runAdmissionCrmSlaReminders: builder.mutation<
      AdmissionCrmSlaReminderRunResultDto,
      { academicYearId: string }
    >({
      query: buildAdmissionCrmSlaReminderRunRequest,
      invalidatesTags: [
        studentAdmissionsCrmType.task,
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    getAdmissionCrmSlaHolds: builder.query<AdmissionCrmSlaHoldDto[], { leadId: string }>({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/sla-holds`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    createAdmissionCrmSlaHold: builder.mutation<
      AdmissionCrmSlaHoldDto,
      { leadId: string; holdReason: AdmissionCrmSlaHoldReason; reason: string }
    >({
      query: ({ leadId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/sla-holds`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    resumeAdmissionCrmSlaHold: builder.mutation<
      AdmissionCrmSlaHoldDto,
      { holdId: string; reason: string }
    >({
      query: ({ holdId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/sla-holds/${holdId}/resume`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    runAdmissionCrmJourneyRules: builder.mutation<
      AdmissionCrmJourneyRunResultDto,
      { academicYearId: string; body: RunAdmissionCrmJourneyRulesDto }
    >({
      query: buildAdmissionCrmJourneyRulesRunRequest,
      invalidatesTags: [
        studentAdmissionsCrmType.task,
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.communication,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    getAdmissionCrmTasks: builder.query<
      PagedResult<AdmissionCrmFollowUpTaskDto>,
      { leadId: string } & AdmissionCrmListParams
    >({
      query: ({ leadId, ...params }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/tasks`,
        method: 'GET',
        params,
      }),
      providesTags: [studentAdmissionsCrmType.task],
    }),
    getAdmissionCrmTimeline: builder.query<
      PagedResult<AdmissionCrmTimelineEventDto>,
      { leadId: string } & AdmissionCrmListParams
    >({
      query: buildAdmissionCrmTimelineRequest,
      providesTags: [studentAdmissionsCrmType.timeline],
    }),
    getAdmissionCrmLeadApplicantChecklist: builder.query<
      AdmissionCrmApplicantChecklistProgressDto[],
      { leadId: string }
    >({
      query: buildAdmissionCrmLeadApplicantChecklistRequest,
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    updateAdmissionCrmLeadApplicantChecklist: builder.mutation<
      AdmissionCrmApplicantChecklistProgressDto,
      {
        leadId: string;
        key: string;
        body: UpdateAdmissionCrmApplicantChecklistProgressDto;
      }
    >({
      query: buildUpdateAdmissionCrmLeadApplicantChecklistRequest,
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    addAdmissionCrmLeadNote: builder.mutation<
      AdmissionCrmTimelineEventDto,
      { leadId: string; body: CreateAdmissionCrmLeadNoteDto }
    >({
      query: buildAddAdmissionCrmLeadNoteRequest,
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    createAdmissionCrmTask: builder.mutation<
      AdmissionCrmFollowUpTaskDto,
      {
        leadId: string;
        body: { title: string; dueAt: string; assignedUserId?: string; notes?: string };
      }
    >({
      query: ({ leadId, body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/tasks`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.task,
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    completeAdmissionCrmTask: builder.mutation<
      AdmissionCrmFollowUpTaskDto,
      { taskId: string; body: { completionNotes?: string } }
    >({
      query: ({ taskId, body }) => ({
        url: `/student-enrollment/admissions-crm/tasks/${taskId}/complete`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.task,
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    getAdmissionCrmSchoolDefaultCycleConfiguration: builder.query<
      AdmissionCrmCycleConfigurationDto,
      void
    >({
      query: buildAdmissionCrmSchoolDefaultCycleConfigurationRequest,
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    updateAdmissionCrmSchoolDefaultCycleConfiguration: builder.mutation<
      AdmissionCrmCycleConfigurationDto,
      { body: Partial<AdmissionCrmCycleConfigurationDto> }
    >({
      query: buildUpdateAdmissionCrmSchoolDefaultCycleConfigurationRequest,
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmCycleConfiguration: builder.query<
      AdmissionCrmCycleConfigurationDto,
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/cycle`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmSetupStatus: builder.query<
      AdmissionCrmSetupStatusDto,
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/setup/${academicYearId}/status`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    updateAdmissionCrmCycleConfiguration: builder.mutation<
      AdmissionCrmCycleConfigurationDto,
      { academicYearId: string; body: Partial<AdmissionCrmCycleConfigurationDto> }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/cycle`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration, studentAdmissionsCrmType.analytics],
    }),
    getAdmissionCrmPipelineStages: builder.query<
      AdmissionCrmPipelineStageDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/pipeline-stages`,
        method: 'GET',
      }),
      transformResponse: (response: PagedResult<AdmissionCrmPipelineStageDto>) => response.items,
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    updateAdmissionCrmPipelineStage: builder.mutation<
      AdmissionCrmPipelineStageDto,
      { stageId: string; body: Partial<AdmissionCrmPipelineStageDto> }
    >({
      query: ({ stageId, body }) => ({
        url: `/student-enrollment/admissions-crm/configuration/pipeline-stages/${stageId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration, studentAdmissionsCrmType.analytics],
    }),
    getAdmissionCrmPlaybooks: builder.query<
      PagedResult<AdmissionCrmPlaybookDto>,
      { academicYearId: string } & AdmissionCrmPlaybookListParams
    >({
      query: buildAdmissionCrmPlaybookListRequest,
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmPlaybook: builder.query<AdmissionCrmPlaybookDto, { playbookId: string }>({
      query: ({ playbookId }) => ({
        url: `/student-enrollment/admissions-crm/configuration/playbooks/${playbookId}`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmPlaybook: builder.mutation<
      AdmissionCrmPlaybookDto,
      { academicYearId: string; body: AdmissionCrmPlaybookUpsertDto }
    >({
      query: buildCreateAdmissionCrmPlaybookRequest,
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    updateAdmissionCrmPlaybook: builder.mutation<
      AdmissionCrmPlaybookDto,
      { playbookId: string; body: AdmissionCrmPlaybookUpsertDto }
    >({
      query: ({ playbookId, body }) => ({
        url: `/student-enrollment/admissions-crm/configuration/playbooks/${playbookId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    publishAdmissionCrmPlaybook: builder.mutation<AdmissionCrmPlaybookDto, { playbookId: string }>({
      query: ({ playbookId }) => ({
        url: `/student-enrollment/admissions-crm/configuration/playbooks/${playbookId}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmPlaybookVersion: builder.mutation<
      AdmissionCrmPlaybookDto,
      { playbookId: string }
    >({
      query: ({ playbookId }) => ({
        url: `/student-enrollment/admissions-crm/configuration/playbooks/${playbookId}/new-version`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    retireAdmissionCrmPlaybook: builder.mutation<AdmissionCrmPlaybookDto, { playbookId: string }>({
      query: ({ playbookId }) => ({
        url: `/student-enrollment/admissions-crm/configuration/playbooks/${playbookId}/retire`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    resolveAdmissionCrmPlaybook: builder.mutation<
      AdmissionCrmPlaybookResolutionDto,
      { academicYearId: string; body: ResolveAdmissionCrmPlaybookDto }
    >({
      query: buildResolveAdmissionCrmPlaybookRequest,
    }),
    generateAdmissionCrmPlaybookSlots: builder.mutation<
      AdmissionCrmSlotGenerationResultDto,
      { playbookId: string; body: GenerateAdmissionCrmPlaybookSlotsDto }
    >({
      query: buildGenerateAdmissionCrmPlaybookSlotsRequest,
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    recommendAdmissionCrmPlaybookSlot: builder.mutation<
      AdmissionCrmSlotRecommendationDto,
      { playbookId: string; body: RecommendAdmissionCrmPlaybookSlotDto }
    >({
      query: buildRecommendAdmissionCrmPlaybookSlotRequest,
    }),
    previewAdmissionCrmExamResult: builder.mutation<
      AdmissionCrmExamResultPreviewDto,
      { playbookId: string; body: PreviewAdmissionCrmExamResultDto }
    >({
      query: buildPreviewAdmissionCrmExamResultRequest,
    }),
    getAdmissionCrmRegistrationTemplates: builder.query<
      PagedResult<AdmissionCrmRegistrationTemplateDto>,
      { academicYearId: string } & AdmissionCrmRegistrationTemplateListParams
    >({
      query: buildAdmissionCrmRegistrationTemplateListRequest,
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmRegistrationTemplate: builder.mutation<
      AdmissionCrmRegistrationTemplateDto,
      { academicYearId: string; body: AdmissionCrmRegistrationTemplateUpsertDto }
    >({
      query: buildCreateAdmissionCrmRegistrationTemplateRequest,
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    updateAdmissionCrmRegistrationTemplate: builder.mutation<
      AdmissionCrmRegistrationTemplateDto,
      { templateId: string; body: AdmissionCrmRegistrationTemplateUpsertDto }
    >({
      query: ({ templateId, body }) => ({
        url: `/student-enrollment/admissions-crm/configuration/registration-templates/${templateId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    publishAdmissionCrmRegistrationTemplate: builder.mutation<
      AdmissionCrmRegistrationTemplateDto,
      { templateId: string }
    >({
      query: ({ templateId }) => ({
        url: `/student-enrollment/admissions-crm/configuration/registration-templates/${templateId}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmRegistrationTemplateVersion: builder.mutation<
      AdmissionCrmRegistrationTemplateDto,
      { templateId: string }
    >({
      query: ({ templateId }) => ({
        url: `/student-enrollment/admissions-crm/configuration/registration-templates/${templateId}/new-version`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    retireAdmissionCrmRegistrationTemplate: builder.mutation<
      AdmissionCrmRegistrationTemplateDto,
      { templateId: string }
    >({
      query: ({ templateId }) => ({
        url: `/student-enrollment/admissions-crm/configuration/registration-templates/${templateId}/retire`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmFormNumberSeries: builder.query<
      PagedResult<AdmissionCrmFormNumberSeriesDto>,
      { academicYearId: string }
    >({
      query: buildAdmissionCrmFormNumberSeriesListRequest,
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmFormNumberSeries: builder.mutation<
      AdmissionCrmFormNumberSeriesDto,
      { academicYearId: string; body: AdmissionCrmFormNumberSeriesUpsertDto }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/form-number-series`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    updateAdmissionCrmFormNumberSeries: builder.mutation<
      AdmissionCrmFormNumberSeriesDto,
      { seriesId: string; body: AdmissionCrmFormNumberSeriesUpsertDto }
    >({
      query: ({ seriesId, body }) => ({
        url: `/student-enrollment/admissions-crm/configuration/form-number-series/${seriesId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    issueAdmissionCrmRegistrationApplication: builder.mutation<
      AdmissionCrmRegistrationApplicationDto,
      { leadId: string; body: IssueAdmissionCrmRegistrationApplicationDto }
    >({
      query: buildIssueAdmissionCrmRegistrationApplicationRequest,
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    getAdmissionCrmRegistrationApplication: builder.query<
      AdmissionCrmRegistrationApplicationDto,
      { applicationId: string }
    >({
      query: ({ applicationId }) => ({
        url: `/student-enrollment/admissions-crm/registrations/${applicationId}`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    getCurrentAdmissionCrmRegistrationByLead: builder.query<
      AdmissionCrmRegistrationApplicationDto,
      { leadId: string }
    >({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/registrations/current`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    returnAdmissionCrmRegistrationForCorrection: builder.mutation<
      AdmissionCrmRegistrationApplicationDto,
      { applicationId: string; fieldKeys: string[]; reason: string }
    >({
      query: ({ applicationId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/registrations/${applicationId}/return-for-correction`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    verifyAdmissionCrmRegistration: builder.mutation<
      AdmissionCrmRegistrationApplicationDto,
      { applicationId: string }
    >({
      query: ({ applicationId }) => ({
        url: `/student-enrollment/admissions-crm/registrations/${applicationId}/verify`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    extendAdmissionCrmRegistration: builder.mutation<
      AdmissionCrmRegistrationApplicationDto,
      { applicationId: string; newExpiry: string; reason: string }
    >({
      query: ({ applicationId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/registrations/${applicationId}/extend`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    revokeAdmissionCrmRegistration: builder.mutation<
      AdmissionCrmRegistrationApplicationDto,
      { applicationId: string; reason: string }
    >({
      query: ({ applicationId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/registrations/${applicationId}/revoke`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    reissueAdmissionCrmRegistration: builder.mutation<
      AdmissionCrmRegistrationApplicationDto,
      { applicationId: string; linkExpiryDays: number; reason: string }
    >({
      query: ({ applicationId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/registrations/${applicationId}/reissue`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    recordAdmissionCrmRegistrationPaymentReference: builder.mutation<
      AdmissionCrmRegistrationApplicationDto,
      { applicationId: string; paymentReference: string }
    >({
      query: ({ applicationId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/registrations/${applicationId}/payment-reference`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    waiveAdmissionCrmRegistrationFee: builder.mutation<
      AdmissionCrmRegistrationApplicationDto,
      { applicationId: string; reason: string }
    >({
      query: ({ applicationId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/registrations/${applicationId}/fee-waiver`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    getAdmissionCrmDocumentChecklistTemplates: builder.query<
      PagedResult<AdmissionCrmDocumentChecklistTemplateDto>,
      {
        academicYearId: string;
        filter?: string;
        status?: AdmissionCrmDocumentChecklistTemplateStatus;
        skipCount?: number;
        maxResultCount?: number;
      }
    >({
      query: buildAdmissionCrmDocumentChecklistTemplateListRequest,
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmDocumentChecklistTemplate: builder.mutation<
      AdmissionCrmDocumentChecklistTemplateDto,
      { academicYearId: string; body: AdmissionCrmDocumentChecklistTemplateUpsertDto }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/document-checklists`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    updateAdmissionCrmDocumentChecklistTemplate: builder.mutation<
      AdmissionCrmDocumentChecklistTemplateDto,
      { templateId: string; body: AdmissionCrmDocumentChecklistTemplateUpsertDto }
    >({
      query: ({ templateId, body }) => ({
        url: `/student-enrollment/admissions-crm/configuration/document-checklists/${templateId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    publishAdmissionCrmDocumentChecklistTemplate: builder.mutation<
      AdmissionCrmDocumentChecklistTemplateDto,
      { templateId: string }
    >({
      query: ({ templateId }) => ({
        url: `/student-enrollment/admissions-crm/configuration/document-checklists/${templateId}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmDocumentChecklistTemplateVersion: builder.mutation<
      AdmissionCrmDocumentChecklistTemplateDto,
      { templateId: string }
    >({
      query: ({ templateId }) => ({
        url: `/student-enrollment/admissions-crm/configuration/document-checklists/${templateId}/new-version`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    retireAdmissionCrmDocumentChecklistTemplate: builder.mutation<
      AdmissionCrmDocumentChecklistTemplateDto,
      { templateId: string }
    >({
      query: ({ templateId }) => ({
        url: `/student-enrollment/admissions-crm/configuration/document-checklists/${templateId}/retire`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    assignAdmissionCrmDocumentChecklist: builder.mutation<
      AdmissionCrmApplicantDocumentChecklistDto,
      { registrationApplicationId: string; checklistTemplateId: string }
    >({
      query: buildAssignAdmissionCrmDocumentChecklistRequest,
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    getAdmissionCrmApplicantDocumentChecklist: builder.query<
      AdmissionCrmApplicantDocumentChecklistDto,
      { registrationApplicationId: string }
    >({
      query: ({ registrationApplicationId }) => ({
        url: `/student-enrollment/admissions-crm/registrations/${registrationApplicationId}/document-checklist`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    uploadAdmissionCrmRegistrationDocument: builder.mutation<
      AdmissionCrmApplicantDocumentChecklistDto,
      {
        registrationApplicationId: string;
        requirementKey: string;
        file: File;
        validUntil?: string | null;
      }
    >({
      query: ({ registrationApplicationId, requirementKey, file, validUntil }) => {
        const body = new FormData();
        body.append('requirementKey', requirementKey);
        body.append('file', file);
        if (validUntil) body.append('validUntil', validUntil);
        return {
          url: `/student-enrollment/admissions-crm/registrations/${registrationApplicationId}/documents`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    reviewAdmissionCrmApplicantDocument: builder.mutation<
      AdmissionCrmApplicantDocumentDto,
      { documentId: string; approve: boolean; reason?: string | null }
    >({
      query: ({ documentId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/documents/${documentId}/review`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    confirmAdmissionCrmDocumentOriginalSeen: builder.mutation<
      AdmissionCrmApplicantDocumentDto,
      { documentId: string }
    >({
      query: ({ documentId }) => ({
        url: `/student-enrollment/admissions-crm/documents/${documentId}/original-seen`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    waiveAdmissionCrmApplicantDocument: builder.mutation<
      AdmissionCrmApplicantDocumentDto,
      { assignmentId: string; requirementKey: string; reason: string }
    >({
      query: ({ assignmentId, requirementKey, reason }) => ({
        url: `/student-enrollment/admissions-crm/document-checklists/${assignmentId}/requirements/${encodeURIComponent(requirementKey)}/waive`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    confirmAdmissionCrmDocumentReadiness: builder.mutation<
      AdmissionCrmApplicantDocumentChecklistDto,
      { assignmentId: string; overrideBlockingRequirements: boolean; reason?: string | null }
    >({
      query: ({ assignmentId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/document-checklists/${assignmentId}/confirm-readiness`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    getAdmissionCrmFormTemplates: builder.query<
      PagedResult<AdmissionCrmFormTemplateDto>,
      { academicYearId: string } & AdmissionCrmFormTemplateListParams
    >({
      query: ({ academicYearId, ...params }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/form-templates`,
        method: 'GET',
        params,
      }),
      providesTags: [studentAdmissionsCrmType.configuration, studentAdmissionsCrmType.publicForm],
    }),
    getAdmissionCrmFormTemplate: builder.query<AdmissionCrmFormTemplateDto, { templateId: string }>(
      {
        query: ({ templateId }) => ({
          url: `/student-enrollment/admissions-crm/configuration/form-templates/${templateId}`,
          method: 'GET',
        }),
        providesTags: [studentAdmissionsCrmType.configuration, studentAdmissionsCrmType.publicForm],
      }
    ),
    createAdmissionCrmFormTemplate: builder.mutation<
      AdmissionCrmFormTemplateDto,
      { academicYearId: string; body: Omit<AdmissionCrmFormTemplateDto, 'id' | 'academicYearId'> }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/form-templates`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.configuration,
        studentAdmissionsCrmType.publicForm,
      ],
    }),
    updateAdmissionCrmFormTemplate: builder.mutation<
      AdmissionCrmFormTemplateDto,
      { templateId: string; body: Omit<AdmissionCrmFormTemplateDto, 'id' | 'academicYearId'> }
    >({
      query: ({ templateId, body }) => ({
        url: `/student-enrollment/admissions-crm/configuration/form-templates/${templateId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.configuration,
        studentAdmissionsCrmType.publicForm,
      ],
    }),
    updateAdmissionCrmFormTemplateStatus: builder.mutation<
      AdmissionCrmFormTemplateDto,
      { templateId: string; body: { isActive: boolean } }
    >({
      query: ({ templateId, body }) => ({
        url: `/student-enrollment/admissions-crm/configuration/form-templates/${templateId}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.configuration,
        studentAdmissionsCrmType.publicForm,
      ],
    }),
    getAdmissionCrmMessageTemplates: builder.query<
      PagedResult<AdmissionCrmMessageTemplateDto>,
      { academicYearId: string } & AdmissionCrmMessageTemplateListParams
    >({
      query: buildAdmissionCrmMessageTemplateListRequest,
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmMessageTemplate: builder.query<
      AdmissionCrmMessageTemplateDto,
      { templateId: string }
    >({
      query: ({ templateId }) => ({
        url: `/student-enrollment/admissions-crm/configuration/message-templates/${templateId}`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmMessageTemplate: builder.mutation<
      AdmissionCrmMessageTemplateDto,
      {
        academicYearId: string;
        body: Omit<AdmissionCrmMessageTemplateDto, 'id' | 'academicYearId' | 'status' | 'isActive'>;
      }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/message-templates`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    updateAdmissionCrmMessageTemplate: builder.mutation<
      AdmissionCrmMessageTemplateDto,
      {
        templateId: string;
        body: Omit<AdmissionCrmMessageTemplateDto, 'id' | 'academicYearId' | 'status' | 'isActive'>;
      }
    >({
      query: ({ templateId, body }) => ({
        url: `/student-enrollment/admissions-crm/configuration/message-templates/${templateId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    updateAdmissionCrmMessageTemplateStatus: builder.mutation<
      AdmissionCrmMessageTemplateDto,
      {
        templateId: string;
        body: { status: AdmissionCrmMessageTemplateStatus; isActive: boolean };
      }
    >({
      query: ({ templateId, body }) => ({
        url: `/student-enrollment/admissions-crm/configuration/message-templates/${templateId}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmCommunicationProviders: builder.query<
      PagedResult<AdmissionCrmCommunicationProviderDto>,
      { academicYearId: string }
    >({
      query: buildAdmissionCrmCommunicationProvidersRequest,
      providesTags: [studentAdmissionsCrmType.communication],
    }),
    updateAdmissionCrmCommunicationProvider: builder.mutation<
      AdmissionCrmCommunicationProviderDto,
      {
        academicYearId: string;
        channel: AdmissionCrmMessageChannel;
        body: UpdateAdmissionCrmCommunicationProviderDto;
      }
    >({
      query: buildUpdateAdmissionCrmCommunicationProviderRequest,
      invalidatesTags: [studentAdmissionsCrmType.communication],
    }),
    getAdmissionCrmCommunicationOptOuts: builder.query<
      PagedResult<AdmissionCrmCommunicationOptOutDto>,
      { academicYearId: string } & AdmissionCrmCommunicationOptOutListParams
    >({
      query: buildAdmissionCrmCommunicationOptOutListRequest,
      providesTags: [studentAdmissionsCrmType.communication],
    }),
    createAdmissionCrmCommunicationOptOut: builder.mutation<
      AdmissionCrmCommunicationOptOutDto,
      {
        academicYearId: string;
        body: {
          leadId?: string;
          channel: AdmissionCrmMessageChannel;
          contactValue: string;
          reason: string;
        };
      }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/communication/opt-outs`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.communication],
    }),
    clearAdmissionCrmCommunicationOptOut: builder.mutation<
      AdmissionCrmCommunicationOptOutDto,
      {
        academicYearId: string;
        body: {
          leadId?: string;
          channel: AdmissionCrmMessageChannel;
          contactValue: string;
          reason: string;
        };
      }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/communication/opt-outs/clear`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.communication],
    }),
    sendAdmissionCrmTemplateMessage: builder.mutation<
      AdmissionCrmMessageDeliveryLogDto,
      { leadId: string; body: SendAdmissionCrmMessageTemplateDto }
    >({
      query: buildSendAdmissionCrmTemplateMessageRequest,
      invalidatesTags: [studentAdmissionsCrmType.communication, studentAdmissionsCrmType.timeline],
    }),
    previewAdmissionCrmMessageTemplate: builder.mutation<
      AdmissionCrmMessageTemplatePreviewDto,
      { academicYearId: string; body: PreviewAdmissionCrmMessageTemplateDto }
    >({
      query: buildPreviewAdmissionCrmMessageTemplateRequest,
    }),
    getAdmissionCrmMessageDeliveryLogs: builder.query<
      PagedResult<AdmissionCrmMessageDeliveryLogDto>,
      { academicYearId: string } & AdmissionCrmMessageDeliveryLogListParams
    >({
      query: buildAdmissionCrmMessageDeliveryLogListRequest,
      providesTags: [studentAdmissionsCrmType.communication],
    }),
    retryAdmissionCrmMessageDelivery: builder.mutation<
      AdmissionCrmMessageDeliveryLogDto,
      { deliveryLogId: string; body?: { reason?: string } }
    >({
      query: ({ deliveryLogId, body }) => ({
        url: `/student-enrollment/admissions-crm/communication/delivery-logs/${deliveryLogId}/retry`,
        method: 'POST',
        body: body || {},
      }),
      invalidatesTags: [studentAdmissionsCrmType.communication, studentAdmissionsCrmType.timeline],
    }),
    applyPublicAdmissionCrmDeliveryCallback: builder.mutation<
      AdmissionCrmMessageDeliveryLogDto,
      {
        tenantId: string;
        deliveryLogId: string;
        body: ApplyAdmissionCrmDeliveryCallbackDto;
      }
    >({
      query: buildPublicAdmissionCrmDeliveryCallbackRequest,
      invalidatesTags: [studentAdmissionsCrmType.communication, studentAdmissionsCrmType.timeline],
    }),
    getAdmissionCrmEntranceExams: builder.query<
      PagedResult<AdmissionCrmEntranceExamDto>,
      { academicYearId: string } & AdmissionCrmEntranceExamListParams
    >({
      query: buildAdmissionCrmExamListRequest,
      providesTags: [studentAdmissionsCrmType.exam],
    }),
    getAdmissionCrmAnalyticsSummary: builder.query<
      AdmissionCrmAnalyticsSummaryDto,
      { academicYearId: string } & AdmissionCrmAnalyticsSummaryParams
    >({
      query: buildAdmissionCrmAnalyticsSummaryRequest,
      providesTags: [
        studentAdmissionsCrmType.analytics,
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.exam,
        studentAdmissionsCrmType.task,
      ],
    }),
    getAdmissionCrmOperationsQueueSummary: builder.query<
      AdmissionCrmOperationsQueueSummaryDto,
      { academicYearId: string }
    >({
      query: buildAdmissionCrmOperationsQueueSummaryRequest,
      providesTags: [studentAdmissionsCrmType.analytics],
    }),
    getAdmissionCrmEnrollmentOverview: builder.query<
      AdmissionCrmEnrollmentOverviewDto,
      { academicYearId: string }
    >({
      query: buildAdmissionCrmEnrollmentOverviewRequest,
      providesTags: [
        studentAdmissionsCrmType.analytics,
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.exam,
      ],
    }),
    getAdmissionCrmOperationsQueue: builder.query<
      AdmissionCrmOperationsQueueDto,
      {
        academicYearId: string;
        queueType: AdmissionCrmOperationsQueueType;
      } & AdmissionCrmOperationsQueueFilters
    >({
      query: buildAdmissionCrmOperationsQueueRequest,
      providesTags: [studentAdmissionsCrmType.analytics],
    }),
    getAdmissionCrmOperationsSavedViews: builder.query<
      AdmissionCrmOperationsSavedViewDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/operations/saved-views`,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmOperationsSavedView: builder.mutation<
      AdmissionCrmOperationsSavedViewDto,
      {
        academicYearId: string;
        name: string;
        queueType: AdmissionCrmOperationsQueueType;
        filters: AdmissionCrmOperationsQueueFilters;
        isShared: boolean;
      }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/operations/saved-views`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    deleteAdmissionCrmOperationsSavedView: builder.mutation<void, { viewId: string }>({
      query: ({ viewId }) => ({
        url: `/student-enrollment/admissions-crm/operations/saved-views/${viewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmEntranceExamByLead: builder.query<
      AdmissionCrmEntranceExamDto,
      { leadId: string }
    >({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/exam`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.exam],
    }),
    getAdmissionCrmEligibilityHandoff: builder.query<
      AdmissionCrmEligibilityHandoffDto,
      { examRecordId: string }
    >({
      query: ({ examRecordId }) => ({
        url: `/student-enrollment/admissions-crm/exams/${examRecordId}/eligibility-handoff`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.exam],
    }),
    scheduleAdmissionCrmEntranceExam: builder.mutation<
      AdmissionCrmEntranceExamDto,
      {
        leadId: string;
        body: {
          entranceExamSlotId: string;
          overrideCapacity?: boolean;
          capacityOverrideReason?: string;
        };
      }
    >({
      query: buildScheduleAdmissionCrmExamRequest,
      invalidatesTags: [
        studentAdmissionsCrmType.exam,
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    markAdmissionCrmExamAttendance: builder.mutation<
      AdmissionCrmEntranceExamDto,
      { examRecordId: string; body: { attendanceStatus: AdmissionCrmExamAttendanceStatus } }
    >({
      query: ({ examRecordId, body }) => ({
        url: `/student-enrollment/admissions-crm/exams/${examRecordId}/attendance`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.exam,
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    uploadAdmissionCrmExamResult: builder.mutation<
      AdmissionCrmEntranceExamDto,
      {
        examRecordId: string;
        body: {
          totalMarks: number;
          passingMarks: number;
          obtainedMarks: number;
          meritRank?: number;
        };
      }
    >({
      query: ({ examRecordId, body }) => ({
        url: `/student-enrollment/admissions-crm/exams/${examRecordId}/result`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.exam,
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    decideAdmissionCrmEligibility: builder.mutation<
      AdmissionCrmEntranceExamDto,
      {
        examRecordId: string;
        body: {
          decision: AdmissionCrmEligibilityDecision;
          reason: string;
          meritRank?: number;
          overrideDecision?: boolean;
          overrideReason?: string;
        };
      }
    >({
      query: ({ examRecordId, body }) => ({
        url: `/student-enrollment/admissions-crm/exams/${examRecordId}/eligibility`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.exam,
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    getAdmissionCrmSeatPools: builder.query<
      PagedResult<AdmissionCrmSeatPoolDto>,
      {
        academicYearId: string;
        filter?: string;
        status?: AdmissionCrmSeatPoolStatus;
        skipCount?: number;
        maxResultCount?: number;
      }
    >({
      query: buildAdmissionCrmSeatPoolListRequest,
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmSeatPool: builder.mutation<
      AdmissionCrmSeatPoolDto,
      { academicYearId: string; body: AdmissionCrmSeatPoolUpsertDto }
    >({
      query: buildCreateAdmissionCrmSeatPoolRequest,
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    updateAdmissionCrmSeatPool: builder.mutation<
      AdmissionCrmSeatPoolDto,
      { seatPoolId: string; body: AdmissionCrmSeatPoolUpsertDto }
    >({
      query: ({ seatPoolId, body }) => ({
        url: `/student-enrollment/admissions-crm/final-admission/seat-pools/${seatPoolId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmSeatOffers: builder.query<
      PagedResult<AdmissionCrmSeatOfferDto>,
      {
        academicYearId: string;
        leadId?: string;
        seatPoolId?: string;
        status?: AdmissionCrmSeatOfferStatus;
        skipCount?: number;
        maxResultCount?: number;
      }
    >({
      query: buildAdmissionCrmOfferListRequest,
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    getAdmissionCrmSeatOffer: builder.query<AdmissionCrmSeatOfferDto, { offerId: string }>({
      query: ({ offerId }) => ({
        url: `/student-enrollment/admissions-crm/final-admission/offers/${offerId}`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    createAdmissionCrmSeatOffer: builder.mutation<
      AdmissionCrmSeatOfferDto,
      { leadId: string; body: CreateAdmissionCrmSeatOfferDto }
    >({
      query: buildCreateAdmissionCrmOfferRequest,
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    submitAdmissionCrmSeatOffer: builder.mutation<AdmissionCrmSeatOfferDto, { offerId: string }>({
      query: ({ offerId }) => ({
        url: `/student-enrollment/admissions-crm/final-admission/offers/${offerId}/submit`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    approveAdmissionCrmSeatOffer: builder.mutation<AdmissionCrmSeatOfferDto, { offerId: string }>({
      query: ({ offerId }) => ({
        url: `/student-enrollment/admissions-crm/final-admission/offers/${offerId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    issueAdmissionCrmSeatOffer: builder.mutation<
      AdmissionCrmSeatOfferDto,
      { offerId: string; body: { capacityOverride: boolean; capacityOverrideReason?: string } }
    >({
      query: ({ offerId, body }) => ({
        url: `/student-enrollment/admissions-crm/final-admission/offers/${offerId}/issue`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.configuration,
      ],
    }),
    respondAdmissionCrmSeatOffer: builder.mutation<
      AdmissionCrmSeatOfferDto,
      {
        offerId: string;
        action: 'accept' | 'decline';
        body: {
          responseSource: string;
          reason?: string;
          language?: string;
          declarations?: Record<string, boolean>;
          evidenceReference?: string;
        };
      }
    >({
      query: ({ offerId, action, body }) => ({
        url: `/student-enrollment/admissions-crm/final-admission/offers/${offerId}/${action}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.configuration,
      ],
    }),
    revokeAdmissionCrmSeatOffer: builder.mutation<
      AdmissionCrmSeatOfferDto,
      { offerId: string; reason: string }
    >({
      query: ({ offerId, reason }) => ({
        url: `/student-enrollment/admissions-crm/final-admission/offers/${offerId}/revoke`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.configuration,
      ],
    }),
    supersedeAdmissionCrmSeatOffer: builder.mutation<
      AdmissionCrmSeatOfferDto,
      { offerId: string; body: CreateAdmissionCrmSeatOfferDto & { reason: string } }
    >({
      query: ({ offerId, body }) => ({
        url: `/student-enrollment/admissions-crm/final-admission/offers/${offerId}/supersede`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.configuration,
      ],
    }),
    expireAdmissionCrmSeatOffer: builder.mutation<AdmissionCrmSeatOfferDto, { offerId: string }>({
      query: ({ offerId }) => ({
        url: `/student-enrollment/admissions-crm/final-admission/offers/${offerId}/expire`,
        method: 'POST',
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.configuration,
      ],
    }),
    runAdmissionCrmOfferExpiry: builder.mutation<
      AdmissionCrmOfferExpiryRunResultDto,
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/final-admission/offers/run-expiry`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    getAdmissionCrmWaitlist: builder.query<AdmissionCrmWaitlistEntryDto[], { seatPoolId: string }>({
      query: ({ seatPoolId }) => ({
        url: `/student-enrollment/admissions-crm/final-admission/seat-pools/${seatPoolId}/waitlist`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    addAdmissionCrmLeadToWaitlist: builder.mutation<
      AdmissionCrmWaitlistEntryDto,
      { leadId: string; body: { seatPoolId: string; priorityScore: number } }
    >({
      query: ({ leadId, body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/final-admission/waitlist`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.configuration,
      ],
    }),
    prepareAdmissionCrmWaitlistPromotion: builder.mutation<
      AdmissionCrmSeatOfferDto,
      {
        entryId: string;
        body: CreateAdmissionCrmSeatOfferDto & {
          overridePriority?: boolean;
          overrideReason?: string;
        };
      }
    >({
      query: ({ entryId, body }) => ({
        url: `/student-enrollment/admissions-crm/final-admission/waitlist/${entryId}/prepare-promotion`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    withdrawAdmissionCrmWaitlistEntry: builder.mutation<
      AdmissionCrmWaitlistEntryDto,
      { entryId: string; reason: string }
    >({
      query: ({ entryId, reason }) => ({
        url: `/student-enrollment/admissions-crm/final-admission/waitlist/${entryId}/withdraw`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.configuration,
      ],
    }),
    updateAdmissionCrmWaitlistGovernance: builder.mutation<
      AdmissionCrmWaitlistEntryDto,
      {
        entryId: string;
        priorityScore: number;
        isProtected: boolean;
        promotionPaused: boolean;
        reason: string;
      }
    >({
      query: ({ entryId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/final-admission/waitlist/${entryId}/governance`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.analytics],
    }),
    getAdmissionCrmWaitlistHistory: builder.query<
      AdmissionCrmWaitlistHistoryDto[],
      { entryId: string }
    >({
      query: ({ entryId }) => ({
        url: `/student-enrollment/admissions-crm/final-admission/waitlist/${entryId}/history`,
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    runAdmissionCrmWaitlistPromotion: builder.mutation<
      {
        seatPoolId: string;
        evaluatedCount: number;
        preparedCount: number;
        offerIds: string[];
        failedEntryIds: string[];
      },
      {
        academicYearId: string;
        seatPoolId: string;
        maximumOffers: number;
        offer: Record<string, unknown>;
      }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/final-admission/waitlist/run-promotion`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.analytics],
    }),
    getAdmissionCrmAdmissionDecision: builder.query<
      AdmissionCrmAdmissionDecisionDto | null,
      { leadId: string }
    >({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/final-admission/decision`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    getAdmissionCrmAdmissionDecisionHistory: builder.query<
      AdmissionCrmAdmissionDecisionDto[],
      { leadId: string }
    >({
      query: buildAdmissionCrmDecisionHistoryRequest,
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    recordAdmissionCrmAdmissionDecision: builder.mutation<
      AdmissionCrmAdmissionDecisionDto,
      {
        leadId: string;
        body: {
          status: AdmissionCrmAdmissionDecisionStatus;
          seatPoolId?: string;
          offerId?: string;
          reason: string;
          overrideUsed?: boolean;
          overrideReason?: string;
        };
      }
    >({
      query: ({ leadId, body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/final-admission/decision`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.configuration,
      ],
    }),
    getAdmissionCrmFeePolicies: builder.query<
      PagedResult<AdmissionCrmFeePolicyDto>,
      {
        academicYearId: string;
        status?: AdmissionCrmFeePolicyStatus;
        code?: string;
        skipCount?: number;
        maxResultCount?: number;
      }
    >({
      query: ({ academicYearId, ...params }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/financial/fee-policies`,
        method: 'GET',
        params,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmFeePolicy: builder.mutation<
      AdmissionCrmFeePolicyDto,
      { academicYearId: string; body: CreateAdmissionCrmFeePolicyDto }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/financial/fee-policies`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    submitAdmissionCrmFeePolicy: builder.mutation<AdmissionCrmFeePolicyDto, { policyId: string }>({
      query: ({ policyId }) => ({
        url: `/student-enrollment/admissions-crm/financial/fee-policies/${policyId}/submit`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    approveAdmissionCrmFeePolicy: builder.mutation<AdmissionCrmFeePolicyDto, { policyId: string }>({
      query: ({ policyId }) => ({
        url: `/student-enrollment/admissions-crm/financial/fee-policies/${policyId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    publishAdmissionCrmFeePolicy: builder.mutation<AdmissionCrmFeePolicyDto, { policyId: string }>({
      query: ({ policyId }) => ({
        url: `/student-enrollment/admissions-crm/financial/fee-policies/${policyId}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmFinancialReadiness: builder.query<
      AdmissionCrmFinancialReadinessDto,
      { leadId: string }
    >({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/financial/readiness`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    issueAdmissionCrmQuotation: builder.mutation<
      AdmissionCrmAdmissionQuotationDto,
      { leadId: string; body: { feePolicyId: string; validUntil: string } }
    >({
      query: ({ leadId, body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/financial/quotations`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    recordAdmissionCrmFinanceState: builder.mutation<
      AdmissionCrmAdmissionQuotationDto,
      {
        quotationId: string;
        body: {
          state: AdmissionCrmFinanceState;
          confirmedAmount: number;
          financeReference?: string;
          source: string;
          confirmedAt: string;
        };
      }
    >({
      query: ({ quotationId, body }) => ({
        url: `/student-enrollment/admissions-crm/financial/quotations/${quotationId}/finance-state`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    overrideAdmissionCrmPaymentGate: builder.mutation<
      AdmissionCrmAdmissionQuotationDto,
      { quotationId: string; body: { reason: string; until?: string | null } }
    >({
      query: ({ quotationId, body }) => ({
        url: `/student-enrollment/admissions-crm/financial/quotations/${quotationId}/override-gate`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    requestAdmissionCrmConcession: builder.mutation<
      AdmissionCrmConcessionRequestDto,
      {
        leadId: string;
        body: {
          quotationId?: string;
          type: AdmissionCrmConcessionType;
          requestedAmount: number;
          requestedPercentage: number;
          reason: string;
          evidenceReference?: string;
        };
      }
    >({
      query: ({ leadId, body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/financial/concessions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    decideAdmissionCrmConcession: builder.mutation<
      AdmissionCrmConcessionRequestDto,
      { concessionId: string; body: { approve: boolean; approvedAmount: number; reason: string } }
    >({
      query: ({ concessionId, body }) => ({
        url: `/student-enrollment/admissions-crm/financial/concessions/${concessionId}/decision`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    acknowledgeAdmissionCrmConcessionFinance: builder.mutation<
      AdmissionCrmConcessionRequestDto,
      { concessionId: string; financeReference: string }
    >({
      query: ({ concessionId, financeReference }) => ({
        url: `/student-enrollment/admissions-crm/financial/concessions/${concessionId}/finance-acknowledgement`,
        method: 'POST',
        body: { financeReference },
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    getAdmissionCrmHouseholdIdentityProfile: builder.query<
      AdmissionCrmApplicantIdentityProfileDto | null,
      { leadId: string }
    >({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/household-identity`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    createAdmissionCrmHouseholdIdentityProfile: builder.mutation<
      AdmissionCrmApplicantIdentityProfileDto,
      {
        leadId: string;
        body: {
          existingHouseholdId?: string;
          existingApplicantPersonId?: string;
          householdDisplayName: string;
          preferredLanguage: string;
          addresses: AdmissionCrmAddressDto[];
          communicationPreferences: Record<string, string | null>;
          applicant: AdmissionCrmPersonInputDto;
        };
      }
    >({
      query: ({ leadId, body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/household-identity`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    searchAdmissionCrmPersons: builder.query<
      PagedResult<AdmissionCrmPersonDto>,
      { name?: string; contact?: string; dateOfBirth?: string; maxResultCount?: number }
    >({
      query: (params) => ({
        url: '/student-enrollment/admissions-crm/household-identity/persons/search',
        method: 'GET',
        params,
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    searchAdmissionCrmHouseholds: builder.query<
      PagedResult<AdmissionCrmHouseholdSummaryDto>,
      { searchText?: string; maxResultCount?: number }
    >({
      query: (params) => ({
        url: '/student-enrollment/admissions-crm/household-identity/households/search',
        method: 'GET',
        params,
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    addAdmissionCrmGuardianRelationship: builder.mutation<
      AdmissionCrmApplicantIdentityProfileDto,
      {
        leadId: string;
        body: {
          existingGuardianPersonId?: string;
          guardian: AdmissionCrmPersonInputDto;
          relationshipType: AdmissionCrmGuardianRelationshipType;
          isPrimaryContact: boolean;
          isEmergencyContact: boolean;
          isAccountableContact: boolean;
          hasFeeResponsibility: boolean;
          hasPickupAuthorization: boolean;
          hasPortalAccess: boolean;
          communicationPriority: number;
        };
      }
    >({
      query: ({ leadId, body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/household-identity/guardians`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    updateAdmissionCrmPersonIdentity: builder.mutation<
      AdmissionCrmPersonDto,
      {
        personId: string;
        body: {
          aadhaarNo?: string;
          aadhaarStatus: AdmissionCrmIdentityVerificationStatus;
          penNumber?: string;
          penStatus: AdmissionCrmIdentityVerificationStatus;
          apaarId?: string;
          apaarConsentStatus: AdmissionCrmConsentStatus;
          apaarStatus: AdmissionCrmIdentityVerificationStatus;
          udiseStudentCode?: string;
          udiseStatus: AdmissionCrmUdiseSyncStatus;
        };
      }
    >({
      query: ({ personId, body }) => ({
        url: `/student-enrollment/admissions-crm/household-identity/persons/${personId}/identity`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    recordAdmissionCrmIdentityConsent: builder.mutation<
      unknown,
      {
        leadId: string;
        body: {
          personId: string;
          purpose: string;
          textVersion: string;
          language: string;
          actor: string;
          channel: string;
          isGranted: boolean;
        };
      }
    >({
      query: ({ leadId, body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/household-identity/consents`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    verifyAdmissionCrmGuardianAuthority: builder.mutation<
      AdmissionCrmApplicantIdentityProfileDto,
      { relationshipId: string; evidenceReference: string }
    >({
      query: ({ relationshipId, evidenceReference }) => ({
        url: `/student-enrollment/admissions-crm/household-identity/guardians/${relationshipId}/verify-authority`,
        method: 'POST',
        body: { evidenceReference },
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    setAdmissionCrmGuardianRestriction: builder.mutation<
      AdmissionCrmApplicantIdentityProfileDto,
      { relationshipId: string; restriction?: string | null }
    >({
      query: ({ relationshipId, restriction }) => ({
        url: `/student-enrollment/admissions-crm/household-identity/guardians/${relationshipId}/protected-restriction`,
        method: 'PUT',
        body: { restriction },
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    overrideAdmissionCrmIdentityReadiness: builder.mutation<
      AdmissionCrmApplicantIdentityProfileDto,
      { leadId: string; reason: string }
    >({
      query: ({ leadId, reason }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/household-identity/override-readiness`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    linkAdmissionCrmPersonAccount: builder.mutation<
      AdmissionCrmApplicantIdentityProfileDto,
      { leadId: string; personId: string; userId: string }
    >({
      query: ({ leadId, personId, userId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/household-identity/persons/${personId}/link-account`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    getAdmissionCrmPolicyPacks: builder.query<
      PagedResult<AdmissionCrmPolicyPackDto>,
      {
        status?: AdmissionCrmPolicyPackStatus;
        board?: string;
        jurisdiction?: string;
        skipCount?: number;
        maxResultCount?: number;
      }
    >({
      query: buildAdmissionCrmPolicyPackListRequest,
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmPolicyPack: builder.mutation<
      AdmissionCrmPolicyPackDto,
      {
        code: string;
        name: string;
        jurisdiction: string;
        board: string;
        sources: AdmissionCrmPolicySourceDto[];
        rules: AdmissionCrmPolicyRuleDto[];
        effectiveFrom: string;
        effectiveUntil?: string | null;
        reviewDueAt: string;
      }
    >({
      query: (body) => ({
        url: '/student-enrollment/admissions-crm/policy-packs',
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    installAdmissionCrmOfficialPolicyBaselines: builder.mutation<
      AdmissionCrmPolicyBaselineInstallResultDto,
      void
    >({
      query: () => ({
        url: '/student-enrollment/admissions-crm/policy-packs/install-official-baselines',
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    submitAdmissionCrmPolicyPack: builder.mutation<
      AdmissionCrmPolicyPackDto,
      { policyPackId: string }
    >({
      query: ({ policyPackId }) => ({
        url: `/student-enrollment/admissions-crm/policy-packs/${policyPackId}/submit`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    approveAdmissionCrmPolicyPack: builder.mutation<
      AdmissionCrmPolicyPackDto,
      { policyPackId: string }
    >({
      query: ({ policyPackId }) => ({
        url: `/student-enrollment/admissions-crm/policy-packs/${policyPackId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    publishAdmissionCrmPolicyPack: builder.mutation<
      AdmissionCrmPolicyPackDto,
      { policyPackId: string }
    >({
      query: ({ policyPackId }) => ({
        url: `/student-enrollment/admissions-crm/policy-packs/${policyPackId}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmPolicyAdoptions: builder.query<
      AdmissionCrmPolicyAdoptionDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/policy-adoptions`,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    adoptAdmissionCrmPolicyPack: builder.mutation<
      AdmissionCrmPolicyAdoptionDto,
      {
        academicYearId: string;
        policyPackId: string;
        body: {
          applicability: Record<string, string | null>;
          overrides: Array<Record<string, unknown>>;
          overrideReason?: string | null;
          effectiveFrom: string;
          effectiveUntil?: string | null;
        };
      }
    >({
      query: ({ academicYearId, policyPackId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/policy-adoptions/${policyPackId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration, studentAdmissionsCrmType.lead],
    }),
    getAdmissionCrmPolicyReadiness: builder.query<
      AdmissionCrmPolicyReadinessDto,
      { leadId: string }
    >({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/policy-readiness`,
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    evaluateAdmissionCrmPolicyRule: builder.mutation<
      AdmissionCrmPolicyEvaluationDto,
      {
        leadId: string;
        body: {
          policyAdoptionId: string;
          ruleCode: string;
          manualStatus?: AdmissionCrmPolicyEvaluationStatus | null;
          evidenceReferences: string[];
          explanation?: string | null;
        };
      }
    >({
      query: ({ leadId, body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/policy-evaluations`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    requestAdmissionCrmPolicyException: builder.mutation<
      AdmissionCrmPolicyExceptionDto,
      { evaluationId: string; reason: string; evidenceReference: string; expiresAt?: string | null }
    >({
      query: ({ evaluationId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/policy-evaluations/${evaluationId}/exceptions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    decideAdmissionCrmPolicyException: builder.mutation<
      AdmissionCrmPolicyExceptionDto,
      { exceptionId: string; approve: boolean; reason: string }
    >({
      query: ({ exceptionId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/policy-exceptions/${exceptionId}/decision`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    getAdmissionCrmNumberSeries: builder.query<
      AdmissionCrmNumberSeriesDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/activation/number-series`,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmNumberSeries: builder.mutation<
      AdmissionCrmNumberSeriesDto,
      {
        academicYearId: string;
        body: {
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
          maximumSequence?: number | null;
          effectiveFrom: string;
          effectiveUntil?: string | null;
        };
      }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/activation/number-series`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    submitAdmissionCrmNumberSeries: builder.mutation<
      AdmissionCrmNumberSeriesDto,
      { seriesId: string }
    >({
      query: ({ seriesId }) => ({
        url: `/student-enrollment/admissions-crm/activation/number-series/${seriesId}/submit`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    publishAdmissionCrmNumberSeries: builder.mutation<
      AdmissionCrmNumberSeriesDto,
      { seriesId: string }
    >({
      query: ({ seriesId }) => ({
        url: `/student-enrollment/admissions-crm/activation/number-series/${seriesId}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmIdentifierGovernance: builder.query<
      AdmissionCrmIdentifierGovernanceReportDto,
      { academicYearId: string; seriesId: string }
    >({
      query: ({ academicYearId, seriesId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/activation/number-series/${seriesId}/governance`,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmPlacementOptions: builder.query<
      AdmissionCrmPlacementOptionDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/activation/placement-options`,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmActivation: builder.query<AdmissionCrmActivationDto | null, { leadId: string }>({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/activation`,
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    previewAdmissionCrmActivation: builder.mutation<
      AdmissionCrmActivationPreviewDto,
      { leadId: string; body: Record<string, unknown> }
    >({
      query: buildAdmissionCrmActivationPreviewRequest,
    }),
    requestAdmissionCrmActivation: builder.mutation<
      AdmissionCrmActivationDto,
      { leadId: string; body: Record<string, unknown> }
    >({
      query: ({ leadId, body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/activation`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    approveAdmissionCrmActivation: builder.mutation<
      AdmissionCrmActivationDto,
      { activationId: string }
    >({
      query: ({ activationId }) => ({
        url: `/student-enrollment/admissions-crm/activation/${activationId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    executeAdmissionCrmActivation: builder.mutation<
      AdmissionCrmActivationDto,
      { activationId: string }
    >({
      query: ({ activationId }) => ({
        url: `/student-enrollment/admissions-crm/activation/${activationId}/execute`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    assignManualAdmissionCrmIdentifier: builder.mutation<
      AdmissionCrmActivationDto['identifiers'][number],
      {
        activationId: string;
        numberSeriesId: string;
        sequence: number;
        value: string;
        reason: string;
      }
    >({
      query: ({ activationId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/activation/${activationId}/manual-identifier`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmActivationCancellationPreview: builder.query<
      AdmissionCrmActivationCancellationPreviewDto,
      { activationId: string }
    >({
      query: ({ activationId }) => ({
        url: `/student-enrollment/admissions-crm/activation/${activationId}/cancellation-preview`,
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    requestAdmissionCrmActivationCancellation: builder.mutation<
      AdmissionCrmActivationDto,
      { activationId: string; reason: string }
    >({
      query: ({ activationId, reason }) => ({
        url: `/student-enrollment/admissions-crm/activation/${activationId}/request-cancellation`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    approveAdmissionCrmActivationCancellation: builder.mutation<
      AdmissionCrmActivationDto,
      { activationId: string }
    >({
      query: ({ activationId }) => ({
        url: `/student-enrollment/admissions-crm/activation/${activationId}/approve-cancellation`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    updateAdmissionCrmServiceHandoff: builder.mutation<
      AdmissionCrmServiceHandoffDto,
      {
        handoffId: string;
        status: AdmissionCrmServiceHandoffStatus;
        externalReference?: string;
        reason?: string;
      }
    >({
      query: ({ handoffId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/activation/service-handoffs/${handoffId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    getAdmissionCrmRouteDefinitions: builder.query<
      AdmissionCrmRouteDefinitionDto[],
      { academicYearId: string }
    >({
      query: buildAdmissionCrmRouteDefinitionListRequest,
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmRouteDefinition: builder.mutation<
      AdmissionCrmRouteDefinitionDto,
      { academicYearId: string; body: Record<string, unknown> }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/admission-routes`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    submitAdmissionCrmRouteDefinition: builder.mutation<
      AdmissionCrmRouteDefinitionDto,
      { definitionId: string }
    >({
      query: ({ definitionId }) => ({
        url: `/student-enrollment/admissions-crm/admission-routes/${definitionId}/submit`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    publishAdmissionCrmRouteDefinition: builder.mutation<
      AdmissionCrmRouteDefinitionDto,
      { definitionId: string }
    >({
      query: ({ definitionId }) => ({
        url: `/student-enrollment/admissions-crm/admission-routes/${definitionId}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmRouteHistory: builder.query<
      AdmissionCrmRouteAssignmentDto[],
      { leadId: string }
    >({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/admission-route`,
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    assignAdmissionCrmRoute: builder.mutation<
      AdmissionCrmRouteAssignmentDto,
      { leadId: string; body: Record<string, unknown> }
    >({
      query: buildAssignAdmissionCrmSpecialRouteRequest,
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    previewAdmissionCrmRouteAssignment: builder.mutation<
      AdmissionCrmRouteImpactPreviewDto,
      { leadId: string; body: Record<string, unknown> }
    >({
      query: ({ leadId, body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/admission-route/preview`,
        method: 'POST',
        body,
      }),
    }),
    evaluateAdmissionCrmRoute: builder.mutation<
      AdmissionCrmRouteAssignmentDto,
      { assignmentId: string; status: AdmissionCrmRouteEligibilityStatus; reason: string }
    >({
      query: ({ assignmentId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/admission-route-assignments/${assignmentId}/evaluate`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    getAdmissionCrmRouteAppeals: builder.query<AdmissionCrmRouteAppealDto[], { leadId: string }>({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/admission-route-appeals`,
      }),
      providesTags: [studentAdmissionsCrmType.lead],
    }),
    requestAdmissionCrmRouteAppeal: builder.mutation<
      AdmissionCrmRouteAppealDto,
      {
        assignmentId: string;
        requestedStatus: AdmissionCrmRouteEligibilityStatus;
        reason: string;
        evidenceReferences: string[];
      }
    >({
      query: ({ assignmentId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/admission-route-assignments/${assignmentId}/appeals`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    decideAdmissionCrmRouteAppeal: builder.mutation<
      AdmissionCrmRouteAppealDto,
      { appealId: string; approved: boolean; reason: string }
    >({
      query: ({ appealId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/admission-route-appeals/${appealId}/decision`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    importAdmissionCrmRteAllotments: builder.mutation<
      AdmissionCrmRteAllotmentImportResultDto,
      { academicYearId: string; rows: AdmissionCrmRteAllotmentImportRowDto[] }
    >({
      query: ({ academicYearId, rows }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/rte-allotments/import`,
        method: 'POST',
        body: { rows },
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead],
    }),
    previewAdmissionCrmRteAllotments: builder.mutation<
      AdmissionCrmRteAllotmentImportResultDto,
      { academicYearId: string; rows: AdmissionCrmRteAllotmentImportRowDto[] }
    >({
      query: ({ academicYearId, rows }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/rte-allotments/preview`,
        method: 'POST',
        body: { rows },
      }),
    }),
    getAdmissionCrmDataQualityIssues: builder.query<
      PagedResult<AdmissionCrmDataQualityIssueDto>,
      {
        academicYearId: string;
        status?: AdmissionCrmDataQualityIssueStatus;
        minimumSeverity?: AdmissionCrmDataQualityIssueSeverity;
        maxResultCount?: number;
      }
    >({
      query: buildAdmissionCrmDataQualityListRequest,
      providesTags: [studentAdmissionsCrmType.analytics],
    }),
    runAdmissionCrmReconciliation: builder.mutation<
      AdmissionCrmReconciliationResultDto,
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/reconciliation/run`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics],
    }),
    acknowledgeAdmissionCrmDataQualityIssue: builder.mutation<
      AdmissionCrmDataQualityIssueDto,
      { issueId: string; ownerUserId?: string | null }
    >({
      query: ({ issueId, ownerUserId }) => ({
        url: `/student-enrollment/admissions-crm/governance/data-quality/${issueId}/acknowledge`,
        method: 'POST',
        body: { ownerUserId },
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics],
    }),
    resolveAdmissionCrmDataQualityIssue: builder.mutation<
      AdmissionCrmDataQualityIssueDto,
      { issueId: string; ignore: boolean; reason: string }
    >({
      query: ({ issueId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/governance/data-quality/${issueId}/resolve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics],
    }),
    getAdmissionCrmRetentionPolicies: builder.query<
      AdmissionCrmRetentionPolicyDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/retention-policies`,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmRetentionPolicy: builder.mutation<
      AdmissionCrmRetentionPolicyDto,
      {
        academicYearId: string;
        code: string;
        name: string;
        category: AdmissionCrmRetentionCategory;
        action: AdmissionCrmRetentionAction;
        retainDays: number;
        scope?: Record<string, string | null>;
        authorityNote: string;
      }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/retention-policies`,
        method: 'POST',
        body: { ...body, scope: body.scope || {} },
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    submitAdmissionCrmRetentionPolicy: builder.mutation<
      AdmissionCrmRetentionPolicyDto,
      { policyId: string }
    >({
      query: ({ policyId }) => ({
        url: `/student-enrollment/admissions-crm/governance/retention-policies/${policyId}/submit`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    publishAdmissionCrmRetentionPolicy: builder.mutation<
      AdmissionCrmRetentionPolicyDto,
      { policyId: string }
    >({
      query: ({ policyId }) => ({
        url: `/student-enrollment/admissions-crm/governance/retention-policies/${policyId}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmPrivacyRequests: builder.query<
      AdmissionCrmPrivacyRequestDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/privacy-requests`,
      }),
      providesTags: [studentAdmissionsCrmType.analytics],
    }),
    createAdmissionCrmPrivacyRequest: builder.mutation<
      AdmissionCrmPrivacyRequestDto,
      { leadId: string; type: AdmissionCrmPrivacyRequestType; reason: string }
    >({
      query: ({ leadId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/governance/privacy-requests`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics, studentAdmissionsCrmType.timeline],
    }),
    decideAdmissionCrmPrivacyRequest: builder.mutation<
      AdmissionCrmPrivacyRequestDto,
      { requestId: string; approve: boolean; reason: string }
    >({
      query: ({ requestId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/governance/privacy-requests/${requestId}/decision`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics, studentAdmissionsCrmType.timeline],
    }),
    completeAdmissionCrmPrivacyRequest: builder.mutation<
      AdmissionCrmPrivacyRequestDto,
      { requestId: string; executionReference: string }
    >({
      query: ({ requestId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/governance/privacy-requests/${requestId}/complete`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics, studentAdmissionsCrmType.timeline],
    }),
    getAdmissionCrmExports: builder.query<
      AdmissionCrmExportRequestDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/exports`,
      }),
      providesTags: [studentAdmissionsCrmType.analytics],
    }),
    requestAdmissionCrmExport: builder.mutation<
      AdmissionCrmExportRequestDto,
      {
        academicYearId: string;
        reportType: AdmissionCrmExportReportType;
        filters?: Record<string, string | null>;
        expiresInHours?: number;
      }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/exports`,
        method: 'POST',
        body: { ...body, filters: body.filters || {} },
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics],
    }),
    downloadAdmissionCrmExport: builder.mutation<
      AdmissionCrmExportDownloadDto,
      { exportId: string }
    >({
      query: ({ exportId }) => ({
        url: `/student-enrollment/admissions-crm/governance/exports/${exportId}/download`,
        method: 'GET',
      }),
      invalidatesTags: [studentAdmissionsCrmType.analytics],
    }),
    getAdmissionCrmReportSchedules: builder.query<
      AdmissionCrmReportScheduleDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/report-schedules`,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmReportSchedule: builder.mutation<
      AdmissionCrmReportScheduleDto,
      {
        academicYearId: string;
        name: string;
        reportType: AdmissionCrmExportReportType;
        frequency: AdmissionCrmReportFrequency;
        destination: string;
        filters?: Record<string, string | null>;
        nextRunAt: string;
      }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/report-schedules`,
        method: 'POST',
        body: { ...body, filters: body.filters || {} },
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    setAdmissionCrmReportScheduleActive: builder.mutation<
      AdmissionCrmReportScheduleDto,
      { scheduleId: string; active: boolean }
    >({
      query: ({ scheduleId, active }) => ({
        url: `/student-enrollment/admissions-crm/governance/report-schedules/${scheduleId}/active`,
        method: 'PUT',
        params: { active },
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    runDueAdmissionCrmReportSchedules: builder.mutation<
      AdmissionCrmReportScheduleRunResultDto,
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/governance/report-schedules/run-due`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration, studentAdmissionsCrmType.analytics],
    }),
    getAdmissionCrmDelegations: builder.query<
      AdmissionCrmWorkDelegationDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/operations/delegations`,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmDelegation: builder.mutation<
      AdmissionCrmWorkDelegationDto,
      {
        academicYearId: string;
        delegatorUserId: string;
        delegateUserId: string;
        queueTypes: AdmissionCrmOperationsQueueType[];
        startsAt: string;
        endsAt: string;
        reason: string;
      }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/operations/delegations`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    cancelAdmissionCrmDelegation: builder.mutation<
      AdmissionCrmWorkDelegationDto,
      { delegationId: string }
    >({
      query: ({ delegationId }) => ({
        url: `/student-enrollment/admissions-crm/operations/delegations/${delegationId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    searchAdmissionCrmAudit: builder.query<
      PagedResult<AdmissionCrmTimelineEventDto>,
      {
        academicYearId: string;
        leadId?: string;
        actorUserId?: string;
        eventType?: AdmissionCrmTimelineEventType;
        from?: string;
        to?: string;
        skipCount?: number;
        maxResultCount?: number;
      }
    >({
      query: (params) => ({ url: '/student-enrollment/admissions-crm/governance/audit', params }),
      providesTags: [studentAdmissionsCrmType.timeline],
    }),
    getAdmissionCrmAdvisoryForecast: builder.query<
      AdmissionCrmForecastDto,
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/analytics/advisory-forecast`,
      }),
      providesTags: [studentAdmissionsCrmType.analytics],
    }),
    bulkAssignAdmissionCrmLeadOwners: builder.mutation<
      AdmissionCrmBulkOperationResultDto,
      { academicYearId: string; items: Array<{ leadId: string; ownerUserId?: string | null }> }
    >({
      query: ({ academicYearId, items }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/bulk/lead-owners`,
        method: 'POST',
        body: { items },
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    bulkCreateAdmissionCrmTasks: builder.mutation<
      AdmissionCrmBulkOperationResultDto,
      {
        academicYearId: string;
        leadIds: string[];
        title: string;
        dueAt: string;
        assignedUserId?: string;
        notes?: string;
      }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/bulk/tasks`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    bulkChangeAdmissionCrmStages: builder.mutation<
      AdmissionCrmBulkOperationResultDto,
      { academicYearId: string; leadIds: string[]; stage: AdmissionInquiryStage; reason: string }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/bulk/stages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    bulkArchiveAdmissionCrmLeads: builder.mutation<
      AdmissionCrmBulkOperationResultDto,
      { academicYearId: string; leadIds: string[]; reason: string }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/bulk/archive`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    bulkSendAdmissionCrmMessages: builder.mutation<
      AdmissionCrmBulkOperationResultDto,
      {
        academicYearId: string;
        leadIds: string[];
        templateId: string;
        variables: Record<string, string>;
      }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/bulk/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    bulkPreviewAdmissionCrmOffers: builder.mutation<
      AdmissionCrmBulkOperationResultDto,
      { academicYearId: string; leadIds: string[]; offer: Record<string, unknown> }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/bulk/offers/preview`,
        method: 'POST',
        body,
      }),
    }),
    bulkCreateAdmissionCrmOffers: builder.mutation<
      AdmissionCrmBulkOperationResultDto,
      { academicYearId: string; leadIds: string[]; offer: Record<string, unknown> }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/bulk/offers`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.analytics],
    }),
    bulkPreviewAdmissionCrmActivations: builder.mutation<
      AdmissionCrmBulkOperationResultDto,
      { academicYearId: string; leadIds: string[]; activation: Record<string, unknown> }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/bulk/activations/preview`,
        method: 'POST',
        body,
      }),
    }),
    bulkExecuteAdmissionCrmActivations: builder.mutation<
      AdmissionCrmBulkOperationResultDto,
      { academicYearId: string; activationIds: string[] }
    >({
      query: ({ academicYearId, activationIds }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/bulk/activations/execute`,
        method: 'POST',
        body: { activationIds },
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.analytics],
    }),
    getPublicAdmissionCrmForm: builder.query<
      AdmissionCrmFormTemplateDto,
      { tenantId: string; templateId: string; language?: 'en' | 'gu' | 'hi' }
    >({
      query: buildPublicAdmissionCrmFormRequest,
      providesTags: [studentAdmissionsCrmType.publicForm],
    }),
  }),
});

export const {
  useGetAdmissionCrmInquirySourcesQuery,
  useGetAdmissionCrmExamSlotsQuery,
  useGetAdmissionCrmStaffQuery,
  useGetAdmissionCrmIntegrationCapabilitiesQuery,
  useGetAdmissionCrmLeadsQuery,
  useGetAdmissionCrmLeadQuery,
  usePreviewAdmissionCrmGeneratedDocumentMutation,
  useIssueAdmissionCrmGeneratedDocumentMutation,
  useGetAdmissionCrmGeneratedDocumentHistoryQuery,
  useGetAdmissionCrmGeneratedDocumentAvailabilityQuery,
  useCreateAdmissionCrmLeadMutation,
  usePreviewAdmissionCrmLeadDuplicatesMutation,
  useAssignAdmissionCrmLeadOwnerMutation,
  useChangeAdmissionCrmLeadPriorityMutation,
  useChangeAdmissionCrmLeadStageMutation,
  useIssueAdmissionCrmRegistrationFormMutation,
  useRecalculateAdmissionCrmLeadScoreMutation,
  useMergeAdmissionCrmDuplicateLeadMutation,
  useArchiveAdmissionCrmLeadMutation,
  useReopenAdmissionCrmLeadMutation,
  useRunAdmissionCrmStaleRulesMutation,
  useRunAdmissionCrmSlaRemindersMutation,
  useGetAdmissionCrmSlaHoldsQuery,
  useCreateAdmissionCrmSlaHoldMutation,
  useResumeAdmissionCrmSlaHoldMutation,
  useRunAdmissionCrmJourneyRulesMutation,
  useGetAdmissionCrmTasksQuery,
  useGetAdmissionCrmTimelineQuery,
  useGetAdmissionCrmLeadApplicantChecklistQuery,
  useUpdateAdmissionCrmLeadApplicantChecklistMutation,
  useAddAdmissionCrmLeadNoteMutation,
  useCreateAdmissionCrmTaskMutation,
  useCompleteAdmissionCrmTaskMutation,
  useGetAdmissionCrmSchoolDefaultCycleConfigurationQuery,
  useUpdateAdmissionCrmSchoolDefaultCycleConfigurationMutation,
  useGetAdmissionCrmCycleConfigurationQuery,
  useGetAdmissionCrmSetupStatusQuery,
  useUpdateAdmissionCrmCycleConfigurationMutation,
  useGetAdmissionCrmPipelineStagesQuery,
  useUpdateAdmissionCrmPipelineStageMutation,
  useGetAdmissionCrmPlaybooksQuery,
  useGetAdmissionCrmPlaybookQuery,
  useCreateAdmissionCrmPlaybookMutation,
  useUpdateAdmissionCrmPlaybookMutation,
  usePublishAdmissionCrmPlaybookMutation,
  useCreateAdmissionCrmPlaybookVersionMutation,
  useRetireAdmissionCrmPlaybookMutation,
  useResolveAdmissionCrmPlaybookMutation,
  useGenerateAdmissionCrmPlaybookSlotsMutation,
  useRecommendAdmissionCrmPlaybookSlotMutation,
  usePreviewAdmissionCrmExamResultMutation,
  useGetAdmissionCrmRegistrationTemplatesQuery,
  useCreateAdmissionCrmRegistrationTemplateMutation,
  useUpdateAdmissionCrmRegistrationTemplateMutation,
  usePublishAdmissionCrmRegistrationTemplateMutation,
  useCreateAdmissionCrmRegistrationTemplateVersionMutation,
  useRetireAdmissionCrmRegistrationTemplateMutation,
  useGetAdmissionCrmFormNumberSeriesQuery,
  useCreateAdmissionCrmFormNumberSeriesMutation,
  useUpdateAdmissionCrmFormNumberSeriesMutation,
  useIssueAdmissionCrmRegistrationApplicationMutation,
  useGetAdmissionCrmRegistrationApplicationQuery,
  useGetCurrentAdmissionCrmRegistrationByLeadQuery,
  useReturnAdmissionCrmRegistrationForCorrectionMutation,
  useVerifyAdmissionCrmRegistrationMutation,
  useExtendAdmissionCrmRegistrationMutation,
  useRevokeAdmissionCrmRegistrationMutation,
  useReissueAdmissionCrmRegistrationMutation,
  useRecordAdmissionCrmRegistrationPaymentReferenceMutation,
  useWaiveAdmissionCrmRegistrationFeeMutation,
  useGetAdmissionCrmDocumentChecklistTemplatesQuery,
  useCreateAdmissionCrmDocumentChecklistTemplateMutation,
  useUpdateAdmissionCrmDocumentChecklistTemplateMutation,
  usePublishAdmissionCrmDocumentChecklistTemplateMutation,
  useCreateAdmissionCrmDocumentChecklistTemplateVersionMutation,
  useRetireAdmissionCrmDocumentChecklistTemplateMutation,
  useAssignAdmissionCrmDocumentChecklistMutation,
  useGetAdmissionCrmApplicantDocumentChecklistQuery,
  useUploadAdmissionCrmRegistrationDocumentMutation,
  useReviewAdmissionCrmApplicantDocumentMutation,
  useConfirmAdmissionCrmDocumentOriginalSeenMutation,
  useWaiveAdmissionCrmApplicantDocumentMutation,
  useConfirmAdmissionCrmDocumentReadinessMutation,
  useGetAdmissionCrmFormTemplatesQuery,
  useGetAdmissionCrmFormTemplateQuery,
  useCreateAdmissionCrmFormTemplateMutation,
  useUpdateAdmissionCrmFormTemplateMutation,
  useUpdateAdmissionCrmFormTemplateStatusMutation,
  useGetAdmissionCrmMessageTemplatesQuery,
  useGetAdmissionCrmMessageTemplateQuery,
  useCreateAdmissionCrmMessageTemplateMutation,
  useUpdateAdmissionCrmMessageTemplateMutation,
  useUpdateAdmissionCrmMessageTemplateStatusMutation,
  useGetAdmissionCrmCommunicationProvidersQuery,
  useUpdateAdmissionCrmCommunicationProviderMutation,
  useGetAdmissionCrmCommunicationOptOutsQuery,
  useCreateAdmissionCrmCommunicationOptOutMutation,
  useClearAdmissionCrmCommunicationOptOutMutation,
  useSendAdmissionCrmTemplateMessageMutation,
  usePreviewAdmissionCrmMessageTemplateMutation,
  useGetAdmissionCrmMessageDeliveryLogsQuery,
  useRetryAdmissionCrmMessageDeliveryMutation,
  useApplyPublicAdmissionCrmDeliveryCallbackMutation,
  useGetAdmissionCrmEntranceExamsQuery,
  useGetAdmissionCrmAnalyticsSummaryQuery,
  useGetAdmissionCrmOperationsQueueSummaryQuery,
  useGetAdmissionCrmEnrollmentOverviewQuery,
  useGetAdmissionCrmOperationsQueueQuery,
  useGetAdmissionCrmOperationsSavedViewsQuery,
  useCreateAdmissionCrmOperationsSavedViewMutation,
  useDeleteAdmissionCrmOperationsSavedViewMutation,
  useGetAdmissionCrmEntranceExamByLeadQuery,
  useGetAdmissionCrmEligibilityHandoffQuery,
  useScheduleAdmissionCrmEntranceExamMutation,
  useMarkAdmissionCrmExamAttendanceMutation,
  useUploadAdmissionCrmExamResultMutation,
  useDecideAdmissionCrmEligibilityMutation,
  useGetAdmissionCrmSeatPoolsQuery,
  useCreateAdmissionCrmSeatPoolMutation,
  useUpdateAdmissionCrmSeatPoolMutation,
  useGetAdmissionCrmSeatOffersQuery,
  useGetAdmissionCrmSeatOfferQuery,
  useCreateAdmissionCrmSeatOfferMutation,
  useSubmitAdmissionCrmSeatOfferMutation,
  useApproveAdmissionCrmSeatOfferMutation,
  useIssueAdmissionCrmSeatOfferMutation,
  useRespondAdmissionCrmSeatOfferMutation,
  useRevokeAdmissionCrmSeatOfferMutation,
  useSupersedeAdmissionCrmSeatOfferMutation,
  useExpireAdmissionCrmSeatOfferMutation,
  useRunAdmissionCrmOfferExpiryMutation,
  useGetAdmissionCrmWaitlistQuery,
  useAddAdmissionCrmLeadToWaitlistMutation,
  usePrepareAdmissionCrmWaitlistPromotionMutation,
  useWithdrawAdmissionCrmWaitlistEntryMutation,
  useUpdateAdmissionCrmWaitlistGovernanceMutation,
  useGetAdmissionCrmWaitlistHistoryQuery,
  useRunAdmissionCrmWaitlistPromotionMutation,
  useGetAdmissionCrmAdmissionDecisionQuery,
  useGetAdmissionCrmAdmissionDecisionHistoryQuery,
  useRecordAdmissionCrmAdmissionDecisionMutation,
  useGetAdmissionCrmFeePoliciesQuery,
  useCreateAdmissionCrmFeePolicyMutation,
  useSubmitAdmissionCrmFeePolicyMutation,
  useApproveAdmissionCrmFeePolicyMutation,
  usePublishAdmissionCrmFeePolicyMutation,
  useGetAdmissionCrmFinancialReadinessQuery,
  useIssueAdmissionCrmQuotationMutation,
  useRecordAdmissionCrmFinanceStateMutation,
  useOverrideAdmissionCrmPaymentGateMutation,
  useRequestAdmissionCrmConcessionMutation,
  useDecideAdmissionCrmConcessionMutation,
  useAcknowledgeAdmissionCrmConcessionFinanceMutation,
  useGetAdmissionCrmHouseholdIdentityProfileQuery,
  useCreateAdmissionCrmHouseholdIdentityProfileMutation,
  useSearchAdmissionCrmPersonsQuery,
  useSearchAdmissionCrmHouseholdsQuery,
  useAddAdmissionCrmGuardianRelationshipMutation,
  useUpdateAdmissionCrmPersonIdentityMutation,
  useRecordAdmissionCrmIdentityConsentMutation,
  useVerifyAdmissionCrmGuardianAuthorityMutation,
  useSetAdmissionCrmGuardianRestrictionMutation,
  useOverrideAdmissionCrmIdentityReadinessMutation,
  useLinkAdmissionCrmPersonAccountMutation,
  useGetAdmissionCrmPolicyPacksQuery,
  useCreateAdmissionCrmPolicyPackMutation,
  useInstallAdmissionCrmOfficialPolicyBaselinesMutation,
  useSubmitAdmissionCrmPolicyPackMutation,
  useApproveAdmissionCrmPolicyPackMutation,
  usePublishAdmissionCrmPolicyPackMutation,
  useGetAdmissionCrmPolicyAdoptionsQuery,
  useAdoptAdmissionCrmPolicyPackMutation,
  useGetAdmissionCrmPolicyReadinessQuery,
  useEvaluateAdmissionCrmPolicyRuleMutation,
  useRequestAdmissionCrmPolicyExceptionMutation,
  useDecideAdmissionCrmPolicyExceptionMutation,
  useGetAdmissionCrmNumberSeriesQuery,
  useCreateAdmissionCrmNumberSeriesMutation,
  useSubmitAdmissionCrmNumberSeriesMutation,
  usePublishAdmissionCrmNumberSeriesMutation,
  useGetAdmissionCrmIdentifierGovernanceQuery,
  useGetAdmissionCrmPlacementOptionsQuery,
  useGetAdmissionCrmActivationQuery,
  usePreviewAdmissionCrmActivationMutation,
  useRequestAdmissionCrmActivationMutation,
  useApproveAdmissionCrmActivationMutation,
  useExecuteAdmissionCrmActivationMutation,
  useAssignManualAdmissionCrmIdentifierMutation,
  useGetAdmissionCrmActivationCancellationPreviewQuery,
  useRequestAdmissionCrmActivationCancellationMutation,
  useApproveAdmissionCrmActivationCancellationMutation,
  useUpdateAdmissionCrmServiceHandoffMutation,
  useGetAdmissionCrmRouteDefinitionsQuery,
  useCreateAdmissionCrmRouteDefinitionMutation,
  useSubmitAdmissionCrmRouteDefinitionMutation,
  usePublishAdmissionCrmRouteDefinitionMutation,
  useGetAdmissionCrmRouteHistoryQuery,
  useAssignAdmissionCrmRouteMutation,
  usePreviewAdmissionCrmRouteAssignmentMutation,
  useEvaluateAdmissionCrmRouteMutation,
  useGetAdmissionCrmRouteAppealsQuery,
  useRequestAdmissionCrmRouteAppealMutation,
  useDecideAdmissionCrmRouteAppealMutation,
  useImportAdmissionCrmRteAllotmentsMutation,
  usePreviewAdmissionCrmRteAllotmentsMutation,
  useGetAdmissionCrmDataQualityIssuesQuery,
  useRunAdmissionCrmReconciliationMutation,
  useAcknowledgeAdmissionCrmDataQualityIssueMutation,
  useResolveAdmissionCrmDataQualityIssueMutation,
  useGetAdmissionCrmRetentionPoliciesQuery,
  useCreateAdmissionCrmRetentionPolicyMutation,
  useSubmitAdmissionCrmRetentionPolicyMutation,
  usePublishAdmissionCrmRetentionPolicyMutation,
  useGetAdmissionCrmPrivacyRequestsQuery,
  useCreateAdmissionCrmPrivacyRequestMutation,
  useDecideAdmissionCrmPrivacyRequestMutation,
  useCompleteAdmissionCrmPrivacyRequestMutation,
  useGetAdmissionCrmExportsQuery,
  useRequestAdmissionCrmExportMutation,
  useDownloadAdmissionCrmExportMutation,
  useGetAdmissionCrmReportSchedulesQuery,
  useCreateAdmissionCrmReportScheduleMutation,
  useSetAdmissionCrmReportScheduleActiveMutation,
  useRunDueAdmissionCrmReportSchedulesMutation,
  useGetAdmissionCrmDelegationsQuery,
  useCreateAdmissionCrmDelegationMutation,
  useCancelAdmissionCrmDelegationMutation,
  useSearchAdmissionCrmAuditQuery,
  useGetAdmissionCrmAdvisoryForecastQuery,
  useBulkAssignAdmissionCrmLeadOwnersMutation,
  useBulkCreateAdmissionCrmTasksMutation,
  useBulkChangeAdmissionCrmStagesMutation,
  useBulkArchiveAdmissionCrmLeadsMutation,
  useBulkSendAdmissionCrmMessagesMutation,
  useBulkPreviewAdmissionCrmOffersMutation,
  useBulkCreateAdmissionCrmOffersMutation,
  useBulkPreviewAdmissionCrmActivationsMutation,
  useBulkExecuteAdmissionCrmActivationsMutation,
  useGetPublicAdmissionCrmFormQuery,
} = StudentAdmissionsCrmApi;

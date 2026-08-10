import type { FetchArgs } from '@reduxjs/toolkit/query';

import {
  AdmissionCrmApplicantStepKey,
  AdmissionCrmAutomationFailureDto,
  AdmissionCrmCampaignPerformanceDto,
  AdmissionCrmChannelPerformanceDto,
  AdmissionCrmClosedOutcome,
  AdmissionCrmDailyTrendDto,
  AdmissionCrmJourneyTrigger,
  AdmissionCrmLeadPriority,
  AdmissionCrmOperationQueueContextDto,
  AdmissionCrmPipelineColumnKey,
  AdmissionCrmReportFrequency,
  AdmissionCrmServiceHandoffStatus,
  AdmissionCrmSourcePerformanceDto,
  AdmissionCrmStaffWorkloadDto,
  AdmissionCrmStageFunnelDto,
  AdmissionInquiryChannel,
  AdmissionInquiryStage,
} from './core-leads-contracts';

import { AdmissionCrmExamAnalyticsDto } from './communication-exams-events-contracts';

import {
  AdmissionCrmActivationAnalyticsDto,
  AdmissionCrmActivationQueueContextDto,
  AdmissionCrmActivationStatus,
  AdmissionCrmFinancialAnalyticsDto,
  AdmissionCrmHouseholdIdentityAnalyticsDto,
  AdmissionCrmOfferQueueContextDto,
  AdmissionCrmPolicyAnalyticsDto,
  AdmissionCrmRouteAnalyticsDto,
  AdmissionCrmRouteType,
  AdmissionCrmSeatOfferStatus,
} from './final-admission-contracts';

import {
  AdmissionCrmApplicantDocumentStatus,
  AdmissionCrmRegistrationAnalyticsDto,
  AdmissionCrmRegistrationQueueContextDto,
  AdmissionCrmRegistrationStatus,
} from './registration-documents-contracts';

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
  PendingPaperEntry = 22,
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

export type AdmissionCrmAdmissionReportParams = {
  fromDate?: string;
  toDate?: string;
  targetStandardId?: string;
};

export type AdmissionCrmAdmissionYearStandardOptionDto = {
  standardId: string;
  standardName: string;
  mediumStageId: string;
  mediumStageName: string;
  mediumId: string;
  mediumName: string;
  boardId: string;
  boardName: string;
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

export type AdmissionCrmAdmissionReportDto = {
  academicYearId: string;
  generatedAt: string;
  fromDate?: string | null;
  toDate?: string | null;
  targetStandardId?: string | null;
  isScopeRestricted: boolean;
  totalApplicantCount: number;
  openApplicantCount: number;
  activatedApplicantCount: number;
  rejectedApplicantCount: number;
  withdrawnApplicantCount: number;
  unassignedStandardApplicantCount: number;
  lifecycle: AdmissionCrmAdmissionReportLifecycleDto[];
  sources: AdmissionCrmAdmissionReportSourceDto[];
  standards: AdmissionCrmAdmissionReportStandardDto[];
  outcomes: AdmissionCrmAdmissionReportOutcomeDto[];
};

export type AdmissionCrmAdmissionReportLifecycleDto = {
  column: AdmissionCrmPipelineColumnKey;
  columnName: string;
  applicantCount: number;
  shareOfApplicants: number;
};

export type AdmissionCrmAdmissionReportSourceDto = {
  sourceName: string;
  inquiryCount: number;
  examScheduledCount: number;
  activatedCount: number;
  activationRate: number;
};

export type AdmissionCrmAdmissionReportStandardDto = {
  targetStandardId?: string | null;
  standardName: string;
  inquiryCount: number;
  examScheduledCount: number;
  examCompletedCount: number;
  eligibleCount: number;
  registrationPendingCount: number;
  registrationVerifiedCount: number;
  financePendingCount: number;
  activationPendingCount: number;
  activatedCount: number;
  rejectedCount: number;
  withdrawnCount: number;
};

export type AdmissionCrmAdmissionReportOutcomeDto = {
  outcome: AdmissionCrmClosedOutcome;
  outcomeName: string;
  applicantCount: number;
  shareOfApplicants: number;
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
  applicantNumber: number;
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
  examNoShowCount: number;
  pendingPaperEntryCount: number;
  expiringRegistrationCount: number;
  documentFollowUpCount: number;
  feeFollowUpCount: number;
  pendingApprovalCount: number;
  expiringOfferCount: number;
  classPlacementRiskCount: number;
  activationFailureCount: number;
  handoffBlockerCount: number;
  urgentCount: number;
  queues: AdmissionCrmOperationsQueueCountDto[];
  urgentItems: AdmissionCrmEnrollmentOverviewItemDto[];
};

export enum AdmissionCrmMyWorkType {
  Task = 0,
  OperationalBlocker = 1,
}

export enum AdmissionCrmWorkUrgency {
  Normal = 0,
  DueSoon = 1,
  DueToday = 2,
  Overdue = 3,
}

export enum AdmissionCrmRecommendedAction {
  OpenApplicant = 0,
  CompleteTask = 1,
  ScheduleExam = 2,
  RecordAttendance = 3,
  RescheduleExam = 4,
  RecordResult = 5,
  DecideEligibility = 6,
  ReviewRegistration = 7,
  ReviewDocuments = 8,
  ReviewOffer = 9,
  RepairActivation = 10,
}

export enum AdmissionCrmWorkspaceSection {
  Overview = 0,
  EntranceExam = 1,
  Registration = 2,
  Offer = 3,
  Activation = 4,
  Governance = 5,
}

export type AdmissionCrmMyWorkItemDto = {
  key: string;
  workType: AdmissionCrmMyWorkType;
  taskId?: string | null;
  queueType?: AdmissionCrmOperationsQueueType | null;
  leadId: string;
  applicantNumber: number;
  examRecordId?: string | null;
  applicantName: string;
  contact?: string | null;
  targetStandardId?: string | null;
  targetClassName?: string | null;
  stage: AdmissionInquiryStage;
  pipelineColumn: AdmissionCrmPipelineColumnKey;
  currentStep: AdmissionCrmApplicantStepKey;
  priority: AdmissionCrmLeadPriority;
  title: string;
  details?: string | null;
  nextAction: string;
  nextActionCode?: string | null;
  dueAt?: string | null;
  urgency: AdmissionCrmWorkUrgency;
  isUrgent: boolean;
  ownerUserId?: string | null;
  ownerDisplayName?: string | null;
  assignedUserId?: string | null;
  assignedDisplayName?: string | null;
  recommendedAction: AdmissionCrmRecommendedAction;
  recommendedSection: AdmissionCrmWorkspaceSection;
  allowedActions: AdmissionCrmRecommendedAction[];
};

export type AdmissionCrmMyWorkDto = {
  academicYearId: string;
  generatedAt: string;
  assignedTotal: number;
  overdueCount: number;
  dueTodayCount: number;
  urgentBlockerCount: number;
  totalCount: number;
  items: AdmissionCrmMyWorkItemDto[];
};

export type AdmissionCrmMyWorkFilters = {
  search?: string;
  applicantSearch?: string;
  targetClassSearch?: string;
  assignedSearch?: string;
  workType?: AdmissionCrmMyWorkType;
  queueType?: AdmissionCrmOperationsQueueType;
  stage?: AdmissionInquiryStage;
  targetStandardId?: string;
  priority?: AdmissionCrmLeadPriority;
  academicMediumId?: string;
  urgency?: AdmissionCrmWorkUrgency;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
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
  applicantSearch?: string;
  actionSearch?: string;
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
  registrationLinkExpiresFrom?: string;
  registrationLinkExpiresUntil?: string;
  offerExpiresFrom?: string;
  offerExpiresUntil?: string;
  paymentGateSatisfied?: boolean;
  placementConfigured?: boolean;
  accountProvisioningPending?: boolean;
  repairSearch?: string;
  sorting?: string;
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

export type AdmissionCrmStandardOptionDto = {
  id: string;
  name: string;
  educationMediumStageId: string;
};

export const buildAdmissionCrmOperationalStandardOptionsRequest = ({
  academicYearId,
}: {
  academicYearId: string;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/operational-standard-options`,
  method: 'GET',
});

export const buildAdmissionCrmAnalyticsSummaryRequest = ({
  academicYearId,
  ...params
}: { academicYearId: string } & AdmissionCrmAnalyticsSummaryParams): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/analytics/summary`,
  method: 'GET',
  params,
});

export const buildAdmissionCrmAdmissionReportRequest = ({
  academicYearId,
  ...params
}: { academicYearId: string } & AdmissionCrmAdmissionReportParams): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/reports/admissions`,
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

export const buildAdmissionCrmMyWorkRequest = ({
  academicYearId,
  ...params
}: { academicYearId: string } & AdmissionCrmMyWorkFilters): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/operations/my-work`,
  method: 'GET',
  params,
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

export enum AdmissionCrmDelegationStatus {
  Scheduled = 0,
  Active = 1,
  Expired = 2,
  Cancelled = 3,
}

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
  approvedSeatCapacity: number;
  remainingSeatCapacity: number;
  projectedSeatSurplus: number;
  capacityIsScopeComplete: boolean;
  firstResponseAtRiskCount: number;
  firstResponseAlreadyBreachedCount: number;
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

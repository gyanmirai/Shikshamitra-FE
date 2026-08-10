import type { FetchArgs } from '@reduxjs/toolkit/query';

import {
  AdmissionCrmAddressDto,
  AdmissionCrmPaymentGateMilestone,
  AdmissionCrmPaymentGateType,
  AdmissionCrmServiceHandoffDto,
  AdmissionInquiryStage,
} from './core-leads-contracts';

import { AdmissionCrmRouteEligibilityStatus } from './communication-exams-events-contracts';

import {
  AdmissionCrmRetentionAction,
  AdmissionCrmRetentionCategory,
} from './operations-governance-contracts';

import {
  AdmissionCrmApplicationStageKey,
  AdmissionCrmGovernedConfigurationStatus,
  AdmissionCrmMeritRankingMode,
} from './setup-playbooks-contracts';

export enum AdmissionCrmGeneratedDocumentType {
  HallTicket = 0,
  RegistrationAcknowledgement = 1,
  OfferLetter = 2,
  AdmissionLetter = 3,
  CorrectionNotice = 4,
  CancellationLetter = 5,
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

export type AdmissionCrmQuickInquiryRouteOptionDto = {
  routeDefinitionId?: string | null;
  name: string;
  routeType: AdmissionCrmRouteType;
  version?: number | null;
  isDefault: boolean;
};

export enum AdmissionCrmPlacementTiming {
  StandardBeforeActivation = 0,
  DivisionBeforeActivation = 1,
}

export type AdmissionCrmCyclePolicySummaryDto = {
  isActive: boolean;
  registrationFormRequiredBeforeExam: boolean;
  entranceExamRequired: boolean;
  journeyLocked: boolean;
  defaultLeadSlaHours: number;
  staleAfterDays: number;
  archiveAfterDays: number;
  defaultExamPassingPercentage: number;
  meritRankingMode: AdmissionCrmMeritRankingMode;
};

export type AdmissionCrmApplicationStagePolicyItemDto = {
  stageKey: AdmissionCrmApplicationStageKey;
  displayName: string;
  displayOrder: number;
  isEnabled: boolean;
  isRequired: boolean;
  isSystemLocked: boolean;
  isExamStage: boolean;
  isOperationallyBacked: boolean;
  supportedOperationalStages: AdmissionInquiryStage[];
  readinessNote: string;
};

export type AdmissionCrmApplicationStagePolicyDto = {
  version: number;
  entranceExamRequired: boolean;
  journeyLocked: boolean;
  applicantCount: number;
  impactFingerprint: string;
  stages: AdmissionCrmApplicationStagePolicyItemDto[];
};

export type UpdateAdmissionCrmApplicationStagePolicyItemDto = {
  stageKey: AdmissionCrmApplicationStageKey;
  displayOrder: number;
  isEnabled: boolean;
};

export type UpdateAdmissionCrmApplicationStagePolicyDto = {
  stages: UpdateAdmissionCrmApplicationStagePolicyItemDto[];
  expectedImpactFingerprint?: string | null;
};

export type AdmissionCrmApplicationStagePolicyImpactDto = {
  applicantCount: number;
  impactFingerprint: string;
  requiresConfirmation: boolean;
  warnings: string[];
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
  capacityConfigured: boolean;
  activeStudentCount: number;
  pendingActivationCount: number;
  remainingCapacity?: number | null;
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

import { api } from 'src/redux/service';

import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

import {
  AdmissionCrmAddressDto,
  PagedResult,
  buildAdmissionCrmDecisionHistoryRequest,
} from './core-leads-contracts';

import { AdmissionCrmRouteEligibilityStatus } from './communication-exams-events-contracts';

import {
  AdmissionCrmActivationCancellationPreviewDto,
  AdmissionCrmActivationDto,
  AdmissionCrmActivationPreviewDto,
  AdmissionCrmAdmissionDecisionDto,
  AdmissionCrmAdmissionDecisionStatus,
  AdmissionCrmAdmissionQuotationDto,
  AdmissionCrmApplicantIdentityProfileDto,
  AdmissionCrmApplicationStagePolicyDto,
  AdmissionCrmApplicationStagePolicyImpactDto,
  AdmissionCrmConcessionRequestDto,
  AdmissionCrmConcessionType,
  AdmissionCrmConsentStatus,
  AdmissionCrmFeePolicyDto,
  AdmissionCrmFeePolicyStatus,
  AdmissionCrmFinanceState,
  AdmissionCrmFinancialReadinessDto,
  AdmissionCrmGeneratedDocumentAvailabilityDto,
  AdmissionCrmGeneratedDocumentDto,
  AdmissionCrmGeneratedDocumentHistoryDto,
  AdmissionCrmGeneratedDocumentType,
  AdmissionCrmGuardianRelationshipType,
  AdmissionCrmHouseholdSummaryDto,
  AdmissionCrmIdentifierGovernanceReportDto,
  AdmissionCrmIdentityVerificationStatus,
  AdmissionCrmOfferExpiryRunResultDto,
  AdmissionCrmPersonDto,
  AdmissionCrmPersonInputDto,
  AdmissionCrmPlacementOptionDto,
  AdmissionCrmPolicyAdoptionDto,
  AdmissionCrmPolicyBaselineInstallResultDto,
  AdmissionCrmPolicyEvaluationDto,
  AdmissionCrmPolicyEvaluationStatus,
  AdmissionCrmPolicyExceptionDto,
  AdmissionCrmPolicyPackDto,
  AdmissionCrmPolicyPackStatus,
  AdmissionCrmPolicyReadinessDto,
  AdmissionCrmPolicyRuleDto,
  AdmissionCrmPolicySourceDto,
  AdmissionCrmRetentionPolicyDto,
  AdmissionCrmRouteAppealDto,
  AdmissionCrmRouteAssignmentDto,
  AdmissionCrmRouteDefinitionDto,
  AdmissionCrmRouteImpactPreviewDto,
  AdmissionCrmRteAllotmentImportResultDto,
  AdmissionCrmRteAllotmentImportRowDto,
  AdmissionCrmSeatOfferDto,
  AdmissionCrmSeatOfferStatus,
  AdmissionCrmSeatPoolDto,
  AdmissionCrmSeatPoolStatus,
  AdmissionCrmSeatPoolUpsertDto,
  AdmissionCrmUdiseSyncStatus,
  AdmissionCrmWaitlistEntryDto,
  AdmissionCrmWaitlistHistoryDto,
  CreateAdmissionCrmFeePolicyDto,
  CreateAdmissionCrmSeatOfferDto,
  UpdateAdmissionCrmApplicationStagePolicyDto,
  buildAdmissionCrmActivationPreviewRequest,
  buildAdmissionCrmOfferListRequest,
  buildAdmissionCrmPolicyPackListRequest,
  buildAdmissionCrmRouteDefinitionListRequest,
  buildAdmissionCrmSeatPoolListRequest,
  buildAssignAdmissionCrmSpecialRouteRequest,
  buildCreateAdmissionCrmOfferRequest,
  buildCreateAdmissionCrmSeatPoolRequest,
} from './final-admission-contracts';

import {
  AdmissionCrmBulkOperationResultDto,
  AdmissionCrmRetentionAction,
  AdmissionCrmRetentionCategory,
} from './operations-governance-contracts';

export const AdmissionCrmFinalAdmissionApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
    getAdmissionCrmApplicationStagePolicy: builder.query<
      AdmissionCrmApplicationStagePolicyDto,
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/setup/cycles/${academicYearId}/stage-policy`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    previewAdmissionCrmApplicationStagePolicy: builder.mutation<
      AdmissionCrmApplicationStagePolicyImpactDto,
      { academicYearId: string; body: UpdateAdmissionCrmApplicationStagePolicyDto }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/setup/cycles/${academicYearId}/stage-policy/preview`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
    updateAdmissionCrmApplicationStagePolicy: builder.mutation<
      AdmissionCrmApplicationStagePolicyDto,
      { academicYearId: string; body: UpdateAdmissionCrmApplicationStagePolicyDto }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/setup/cycles/${academicYearId}/stage-policy`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
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
          guardian?: AdmissionCrmPersonInputDto;
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
  }),
});

export const {
  usePreviewAdmissionCrmGeneratedDocumentMutation,
  useIssueAdmissionCrmGeneratedDocumentMutation,
  useGetAdmissionCrmGeneratedDocumentHistoryQuery,
  useGetAdmissionCrmGeneratedDocumentAvailabilityQuery,
  useGetAdmissionCrmApplicationStagePolicyQuery,
  usePreviewAdmissionCrmApplicationStagePolicyMutation,
  useUpdateAdmissionCrmApplicationStagePolicyMutation,
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
  useCreateAdmissionCrmRetentionPolicyMutation,
  useSubmitAdmissionCrmRetentionPolicyMutation,
  usePublishAdmissionCrmRetentionPolicyMutation,
  useBulkPreviewAdmissionCrmOffersMutation,
  useBulkCreateAdmissionCrmOffersMutation,
  useBulkPreviewAdmissionCrmActivationsMutation,
  useBulkExecuteAdmissionCrmActivationsMutation,
} = AdmissionCrmFinalAdmissionApi;

import { api } from 'src/redux/service';

import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

import {
  AdmissionCrmApplicantChecklistProgressDto,
  AdmissionCrmApplicantProgressDto,
  AdmissionCrmCatalogStatusDto,
  AdmissionCrmFollowUpTaskDto,
  AdmissionCrmInquirySourceDto,
  AdmissionCrmInquirySourceUpsertDto,
  AdmissionCrmInquiryTypeDto,
  AdmissionCrmInquiryTypeUpsertDto,
  AdmissionCrmIntegrationCapabilityDto,
  AdmissionCrmLeadDto,
  AdmissionCrmLeadDuplicateDto,
  AdmissionCrmLeadDuplicatePreviewInput,
  AdmissionCrmLeadListParams,
  AdmissionCrmListParams,
  AdmissionCrmNumberSeriesDto,
  AdmissionCrmQuickInquiryOptionsDto,
  AdmissionCrmServiceHandoffDto,
  AdmissionCrmServiceHandoffStatus,
  AdmissionCrmSlaHoldDto,
  AdmissionCrmSlaHoldReason,
  AdmissionCrmSlaReminderRunResultDto,
  AdmissionCrmStaffLookupDto,
  AdmissionInquiryStage,
  ChangeAdmissionCrmLeadPriorityDto,
  ChangeAdmissionCrmLeadStageDto,
  CreateAdmissionCrmLeadDto,
  CreateAdmissionCrmLeadNoteDto,
  PagedResult,
  UpdateAdmissionCrmApplicantChecklistProgressDto,
  buildAddAdmissionCrmLeadNoteRequest,
  buildAdmissionCrmLeadApplicantChecklistRequest,
  buildAdmissionCrmLeadListRequest,
  buildAdmissionCrmQuickInquiryOptionsRequest,
  buildAdmissionCrmSlaReminderRunRequest,
  buildAdmissionCrmTimelineRequest,
  buildChangeAdmissionCrmLeadPriorityRequest,
  buildChangeAdmissionCrmLeadStageRequest,
  buildCreateAdmissionCrmLeadRequest,
  buildMergeAdmissionCrmDuplicateLeadRequest,
  buildPreviewAdmissionCrmLeadDuplicatesRequest,
  buildUpdateAdmissionCrmLeadApplicantChecklistRequest,
} from './core-leads-contracts';

import {
  AdmissionCrmReviewAssignmentDto,
  AdmissionCrmStructuredReviewDto,
  AdmissionCrmTimelineEventDto,
} from './communication-exams-events-contracts';

import {
  AdmissionCrmAdmissionQuotationDto,
  AdmissionCrmIdentifierType,
} from './final-admission-contracts';

import { AdmissionCrmBulkOperationResultDto } from './operations-governance-contracts';

import {
  AdmissionCrmApplicantDocumentChecklistDto,
  AdmissionCrmApplicantDocumentDto,
} from './registration-documents-contracts';

import {
  AdmissionCrmCycleConfigurationDto,
  AdmissionCrmJourneyLockDto,
} from './setup-playbooks-contracts';

export const AdmissionCrmCoreLeadsApi = api.injectEndpoints({
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
    createAdmissionCrmInquirySource: builder.mutation<
      AdmissionCrmInquirySourceDto,
      { academicYearId: string; body: AdmissionCrmInquirySourceUpsertDto }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/catalog/inquiry-sources`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    updateAdmissionCrmInquirySource: builder.mutation<
      AdmissionCrmInquirySourceDto,
      { sourceId: string; body: AdmissionCrmInquirySourceUpsertDto }
    >({
      query: ({ sourceId, body }) => ({
        url: `/student-enrollment/admissions-crm/catalog/inquiry-sources/${sourceId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    setAdmissionCrmInquirySourceStatus: builder.mutation<
      AdmissionCrmInquirySourceDto,
      { sourceId: string; body: AdmissionCrmCatalogStatusDto }
    >({
      query: ({ sourceId, body }) => ({
        url: `/student-enrollment/admissions-crm/catalog/inquiry-sources/${sourceId}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmInquiryTypes: builder.query<
      PagedResult<AdmissionCrmInquiryTypeDto>,
      { academicYearId: string; includeInactive?: boolean }
    >({
      query: ({ academicYearId, ...params }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/catalog/inquiry-types`,
        method: 'GET',
        params,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmInquiryType: builder.mutation<
      AdmissionCrmInquiryTypeDto,
      { academicYearId: string; body: AdmissionCrmInquiryTypeUpsertDto }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/catalog/inquiry-types`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    updateAdmissionCrmInquiryType: builder.mutation<
      AdmissionCrmInquiryTypeDto,
      { inquiryTypeId: string; body: AdmissionCrmInquiryTypeUpsertDto }
    >({
      query: ({ inquiryTypeId, body }) => ({
        url: `/student-enrollment/admissions-crm/catalog/inquiry-types/${inquiryTypeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    setAdmissionCrmInquiryTypeStatus: builder.mutation<
      AdmissionCrmInquiryTypeDto,
      { inquiryTypeId: string; body: AdmissionCrmCatalogStatusDto }
    >({
      query: ({ inquiryTypeId, body }) => ({
        url: `/student-enrollment/admissions-crm/catalog/inquiry-types/${inquiryTypeId}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmStaff: builder.query<
      AdmissionCrmStaffLookupDto[],
      {
        filter?: string;
        ids?: string;
        maxResultCount?: number;
        academicYearId?: string;
        ownerOnly?: boolean;
        reviewerOnly?: boolean;
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
    getAdmissionCrmApplicantProgress: builder.query<
      AdmissionCrmApplicantProgressDto,
      { leadId: string }
    >({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/workspace/applicants/${leadId}/progress`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.lead],
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
    getAdmissionCrmQuickInquiryOptions: builder.query<
      AdmissionCrmQuickInquiryOptionsDto,
      { academicYearId: string }
    >({
      query: buildAdmissionCrmQuickInquiryOptionsRequest,
      providesTags: [studentAdmissionsCrmType.configuration],
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
    lockAdmissionCrmJourney: builder.mutation<
      AdmissionCrmCycleConfigurationDto,
      { academicYearId: string; body: AdmissionCrmJourneyLockDto }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/journey/lock`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration, studentAdmissionsCrmType.analytics],
    }),
    unlockAdmissionCrmJourney: builder.mutation<
      AdmissionCrmCycleConfigurationDto,
      { academicYearId: string; body: AdmissionCrmJourneyLockDto }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/journey/unlock`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration, studentAdmissionsCrmType.analytics],
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
    assignAdmissionCrmReviewer: builder.mutation<
      AdmissionCrmStructuredReviewDto,
      { reviewId: string; reviewerUserId: string; dueAt: string }
    >({
      query: ({ reviewId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/structured-reviews/${reviewId}/assignments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.structuredReview,
        studentAdmissionsCrmType.timeline,
      ],
    }),
    declareAdmissionCrmReviewConflict: builder.mutation<
      AdmissionCrmReviewAssignmentDto,
      { assignmentId: string; hasConflict: boolean; reason?: string }
    >({
      query: ({ assignmentId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/structured-review-assignments/${assignmentId}/conflict`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.structuredReview,
        studentAdmissionsCrmType.timeline,
      ],
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
      {
        academicYearId: string;
        leadIds: string[];
        stage: AdmissionInquiryStage;
        reason: string;
        overrideProtectedStages?: boolean;
      }
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
  }),
});

export const {
  useGetAdmissionCrmInquirySourcesQuery,
  useCreateAdmissionCrmInquirySourceMutation,
  useUpdateAdmissionCrmInquirySourceMutation,
  useSetAdmissionCrmInquirySourceStatusMutation,
  useGetAdmissionCrmInquiryTypesQuery,
  useCreateAdmissionCrmInquiryTypeMutation,
  useUpdateAdmissionCrmInquiryTypeMutation,
  useSetAdmissionCrmInquiryTypeStatusMutation,
  useGetAdmissionCrmStaffQuery,
  useGetAdmissionCrmIntegrationCapabilitiesQuery,
  useGetAdmissionCrmApplicantProgressQuery,
  useGetAdmissionCrmLeadsQuery,
  useGetAdmissionCrmLeadQuery,
  useCreateAdmissionCrmLeadMutation,
  useGetAdmissionCrmQuickInquiryOptionsQuery,
  usePreviewAdmissionCrmLeadDuplicatesMutation,
  useAssignAdmissionCrmLeadOwnerMutation,
  useChangeAdmissionCrmLeadPriorityMutation,
  useChangeAdmissionCrmLeadStageMutation,
  useRecalculateAdmissionCrmLeadScoreMutation,
  useMergeAdmissionCrmDuplicateLeadMutation,
  useArchiveAdmissionCrmLeadMutation,
  useReopenAdmissionCrmLeadMutation,
  useRunAdmissionCrmStaleRulesMutation,
  useRunAdmissionCrmSlaRemindersMutation,
  useGetAdmissionCrmSlaHoldsQuery,
  useCreateAdmissionCrmSlaHoldMutation,
  useResumeAdmissionCrmSlaHoldMutation,
  useGetAdmissionCrmTasksQuery,
  useGetAdmissionCrmTimelineQuery,
  useGetAdmissionCrmLeadApplicantChecklistQuery,
  useUpdateAdmissionCrmLeadApplicantChecklistMutation,
  useAddAdmissionCrmLeadNoteMutation,
  useCreateAdmissionCrmTaskMutation,
  useCompleteAdmissionCrmTaskMutation,
  useLockAdmissionCrmJourneyMutation,
  useUnlockAdmissionCrmJourneyMutation,
  useConfirmAdmissionCrmDocumentOriginalSeenMutation,
  useConfirmAdmissionCrmDocumentReadinessMutation,
  useAssignAdmissionCrmReviewerMutation,
  useDeclareAdmissionCrmReviewConflictMutation,
  useOverrideAdmissionCrmPaymentGateMutation,
  useGetAdmissionCrmNumberSeriesQuery,
  useCreateAdmissionCrmNumberSeriesMutation,
  useSubmitAdmissionCrmNumberSeriesMutation,
  usePublishAdmissionCrmNumberSeriesMutation,
  useUpdateAdmissionCrmServiceHandoffMutation,
  useBulkAssignAdmissionCrmLeadOwnersMutation,
  useBulkCreateAdmissionCrmTasksMutation,
  useBulkChangeAdmissionCrmStagesMutation,
  useBulkArchiveAdmissionCrmLeadsMutation,
} = AdmissionCrmCoreLeadsApi;

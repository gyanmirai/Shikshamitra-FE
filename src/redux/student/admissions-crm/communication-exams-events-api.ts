import { api } from 'src/redux/service';

import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

import { AdmissionCrmReviewRecommendation, PagedResult } from './core-leads-contracts';

import {
  AdmissionCrmCommunicationOptOutDto,
  AdmissionCrmCommunicationOptOutListParams,
  AdmissionCrmCommunicationProviderDto,
  AdmissionCrmEligibilityDecision,
  AdmissionCrmEligibilityHandoffDto,
  AdmissionCrmEntranceExamDto,
  AdmissionCrmEntranceExamListParams,
  AdmissionCrmEventDto,
  AdmissionCrmEventStatus,
  AdmissionCrmEventType,
  AdmissionCrmEventUpsertDto,
  AdmissionCrmExamAttendanceStatus,
  AdmissionCrmExamResultPreviewDto,
  AdmissionCrmExamSlotDto,
  AdmissionCrmMessageChannel,
  AdmissionCrmMessageDeliveryLogDto,
  AdmissionCrmMessageDeliveryLogListParams,
  AdmissionCrmMessageTemplateDto,
  AdmissionCrmMessageTemplateListParams,
  AdmissionCrmMessageTemplatePreviewDto,
  AdmissionCrmMessageTemplateStatus,
  AdmissionCrmReviewAssignmentDto,
  AdmissionCrmReviewConfigurationDto,
  AdmissionCrmStructuredReviewDto,
  PreviewAdmissionCrmExamResultDto,
  PreviewAdmissionCrmMessageTemplateDto,
  SendAdmissionCrmMessageTemplateDto,
  UpdateAdmissionCrmCommunicationProviderDto,
  UpdateAdmissionCrmReviewConfigurationDto,
  buildAdmissionCrmCommunicationOptOutListRequest,
  buildAdmissionCrmCommunicationProvidersRequest,
  buildAdmissionCrmEventListRequest,
  buildAdmissionCrmExamListRequest,
  buildAdmissionCrmMessageDeliveryLogListRequest,
  buildAdmissionCrmMessageTemplateListRequest,
  buildBulkAdmissionCrmExamResultsRequest,
  buildCreateAdmissionCrmEventRequest,
  buildPreviewAdmissionCrmExamResultRequest,
  buildPreviewAdmissionCrmMessageTemplateRequest,
  buildReserveAdmissionCrmEventRequest,
  buildScheduleAdmissionCrmExamRequest,
  buildSendAdmissionCrmTemplateMessageRequest,
  buildUpdateAdmissionCrmCommunicationProviderRequest,
} from './communication-exams-events-contracts';

import { AdmissionCrmBulkOperationResultDto } from './operations-governance-contracts';

export const AdmissionCrmCommunicationExamsEventsApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
    previewAdmissionCrmExamResult: builder.mutation<
      AdmissionCrmExamResultPreviewDto,
      { playbookId: string; body: PreviewAdmissionCrmExamResultDto }
    >({
      query: buildPreviewAdmissionCrmExamResultRequest,
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
    getAdmissionCrmEntranceExams: builder.query<
      PagedResult<AdmissionCrmEntranceExamDto>,
      { academicYearId: string } & AdmissionCrmEntranceExamListParams
    >({
      query: buildAdmissionCrmExamListRequest,
      providesTags: [studentAdmissionsCrmType.exam],
    }),
    getAdmissionCrmEvents: builder.query<
      PagedResult<AdmissionCrmEventDto>,
      {
        academicYearId: string;
        skipCount?: number;
        maxResultCount?: number;
        sorting?: string;
        filterText?: string;
        eventType?: AdmissionCrmEventType;
        status?: AdmissionCrmEventStatus;
        startsFrom?: string;
        startsUntil?: string;
      }
    >({
      query: buildAdmissionCrmEventListRequest,
      providesTags: [studentAdmissionsCrmType.event],
    }),
    getAdmissionCrmEvent: builder.query<AdmissionCrmEventDto, { eventId: string }>({
      query: ({ eventId }) => `/student-enrollment/admissions-crm/events/${eventId}`,
      providesTags: [studentAdmissionsCrmType.event],
    }),
    createAdmissionCrmEvent: builder.mutation<
      AdmissionCrmEventDto,
      { academicYearId: string; body: AdmissionCrmEventUpsertDto }
    >({
      query: buildCreateAdmissionCrmEventRequest,
      invalidatesTags: [studentAdmissionsCrmType.event],
    }),
    updateAdmissionCrmEvent: builder.mutation<
      AdmissionCrmEventDto,
      { eventId: string; body: AdmissionCrmEventUpsertDto }
    >({
      query: ({ eventId, body }) => ({
        url: `/student-enrollment/admissions-crm/events/${eventId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.event],
    }),
    publishAdmissionCrmEvent: builder.mutation<AdmissionCrmEventDto, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/student-enrollment/admissions-crm/events/${eventId}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.event],
    }),
    cancelAdmissionCrmEvent: builder.mutation<
      AdmissionCrmEventDto,
      { eventId: string; reason: string }
    >({
      query: ({ eventId, reason }) => ({
        url: `/student-enrollment/admissions-crm/events/${eventId}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [studentAdmissionsCrmType.event],
    }),
    completeAdmissionCrmEvent: builder.mutation<AdmissionCrmEventDto, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `/student-enrollment/admissions-crm/events/${eventId}/complete`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.event],
    }),
    reserveAdmissionCrmEvent: builder.mutation<
      AdmissionCrmEventDto,
      { eventId: string; leadId: string; notes?: string }
    >({
      query: buildReserveAdmissionCrmEventRequest,
      invalidatesTags: [studentAdmissionsCrmType.event, studentAdmissionsCrmType.timeline],
    }),
    getAdmissionCrmReviewConfiguration: builder.query<
      AdmissionCrmReviewConfigurationDto,
      { academicYearId: string }
    >({
      query: ({ academicYearId }) =>
        `/student-enrollment/admissions-crm/${academicYearId}/structured-review/configuration`,
      providesTags: [studentAdmissionsCrmType.structuredReview],
    }),
    updateAdmissionCrmReviewConfiguration: builder.mutation<
      AdmissionCrmReviewConfigurationDto,
      { academicYearId: string; body: UpdateAdmissionCrmReviewConfigurationDto }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/structured-review/configuration`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.structuredReview],
    }),
    getAdmissionCrmStructuredReviewByLead: builder.query<
      AdmissionCrmStructuredReviewDto | null,
      { leadId: string }
    >({
      query: ({ leadId }) => `/student-enrollment/admissions-crm/leads/${leadId}/structured-review`,
      providesTags: [studentAdmissionsCrmType.structuredReview],
    }),
    getMyAdmissionCrmReviewAssignments: builder.query<
      AdmissionCrmReviewAssignmentDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) =>
        `/student-enrollment/admissions-crm/${academicYearId}/structured-review/my-assignments`,
      providesTags: [studentAdmissionsCrmType.structuredReview],
    }),
    startAdmissionCrmStructuredReview: builder.mutation<
      AdmissionCrmStructuredReviewDto,
      { leadId: string }
    >({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/structured-review/start`,
        method: 'POST',
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.structuredReview,
        studentAdmissionsCrmType.timeline,
      ],
    }),
    submitAdmissionCrmStructuredReview: builder.mutation<
      AdmissionCrmReviewAssignmentDto,
      {
        assignmentId: string;
        recommendation: AdmissionCrmReviewRecommendation;
        confidentialRecommendation: string;
        scores: Record<string, number | null>;
      }
    >({
      query: ({ assignmentId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/structured-review-assignments/${assignmentId}/submit`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.structuredReview,
        studentAdmissionsCrmType.timeline,
      ],
    }),
    closeAdmissionCrmStructuredReview: builder.mutation<
      AdmissionCrmStructuredReviewDto,
      { reviewId: string; reason: string }
    >({
      query: ({ reviewId, reason }) => ({
        url: `/student-enrollment/admissions-crm/structured-reviews/${reviewId}/close`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.structuredReview,
        studentAdmissionsCrmType.timeline,
      ],
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
          correctionReason?: string;
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
    bulkMarkAdmissionCrmExamAttendance: builder.mutation<
      AdmissionCrmBulkOperationResultDto,
      {
        academicYearId: string;
        examRecordIds: string[];
        attendanceStatus: AdmissionCrmExamAttendanceStatus;
      }
    >({
      query: ({ academicYearId, ...body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/bulk/exams/attendance`,
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
    bulkUploadAdmissionCrmExamResults: builder.mutation<
      AdmissionCrmBulkOperationResultDto,
      {
        academicYearId: string;
        items: Array<{
          examRecordId: string;
          totalMarks: number;
          passingMarks: number;
          obtainedMarks: number;
          meritRank?: number;
          correctionReason?: string;
        }>;
      }
    >({
      query: buildBulkAdmissionCrmExamResultsRequest,
      invalidatesTags: [
        studentAdmissionsCrmType.exam,
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
  }),
});

export const {
  useGetAdmissionCrmExamSlotsQuery,
  usePreviewAdmissionCrmExamResultMutation,
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
  useGetAdmissionCrmEntranceExamsQuery,
  useGetAdmissionCrmEventsQuery,
  useGetAdmissionCrmEventQuery,
  useCreateAdmissionCrmEventMutation,
  useUpdateAdmissionCrmEventMutation,
  usePublishAdmissionCrmEventMutation,
  useCancelAdmissionCrmEventMutation,
  useCompleteAdmissionCrmEventMutation,
  useReserveAdmissionCrmEventMutation,
  useGetAdmissionCrmReviewConfigurationQuery,
  useUpdateAdmissionCrmReviewConfigurationMutation,
  useGetAdmissionCrmStructuredReviewByLeadQuery,
  useGetMyAdmissionCrmReviewAssignmentsQuery,
  useStartAdmissionCrmStructuredReviewMutation,
  useSubmitAdmissionCrmStructuredReviewMutation,
  useCloseAdmissionCrmStructuredReviewMutation,
  useGetAdmissionCrmEntranceExamByLeadQuery,
  useGetAdmissionCrmEligibilityHandoffQuery,
  useScheduleAdmissionCrmEntranceExamMutation,
  useMarkAdmissionCrmExamAttendanceMutation,
  useUploadAdmissionCrmExamResultMutation,
  useDecideAdmissionCrmEligibilityMutation,
  useBulkMarkAdmissionCrmExamAttendanceMutation,
  useBulkUploadAdmissionCrmExamResultsMutation,
  useBulkSendAdmissionCrmMessagesMutation,
} = AdmissionCrmCommunicationExamsEventsApi;

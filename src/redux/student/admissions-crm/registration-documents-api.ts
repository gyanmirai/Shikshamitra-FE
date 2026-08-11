import { api } from 'src/redux/service';

import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

import { AdmissionCrmLeadDto, PagedResult } from './core-leads-contracts';

import { AdmissionCrmEventDto } from './communication-exams-events-contracts';

import {
  AdmissionCrmApplicantDocumentChecklistDto,
  AdmissionCrmApplicantDocumentDto,
  AdmissionCrmDirectRegistrationResultDto,
  AdmissionCrmDocumentChecklistTemplateDto,
  AdmissionCrmDocumentChecklistTemplateStatus,
  AdmissionCrmDocumentChecklistTemplateUpsertDto,
  AdmissionCrmFormNumberSeriesDto,
  AdmissionCrmFormNumberSeriesUpsertDto,
  AdmissionCrmRegistrationApplicationDto,
  AdmissionCrmRegistrationIssuanceResultDto,
  AdmissionCrmRegistrationReadinessDto,
  AdmissionCrmRegistrationTemplateDto,
  AdmissionCrmRegistrationTemplateListParams,
  AdmissionCrmRegistrationTemplateUpsertDto,
  CreateDirectAdmissionCrmRegistrationDto,
  CreatePaperAdmissionCrmRegistrationDto,
  IssueAdmissionCrmRegistrationApplicationDto,
  IssueAdmissionCrmRegistrationFormDto,
  SaveAdmissionCrmRegistrationResponsesDto,
  buildAdmissionCrmDocumentChecklistTemplateListRequest,
  buildAdmissionCrmFormNumberSeriesListRequest,
  buildAdmissionCrmRegistrationTemplateListRequest,
  buildAssignAdmissionCrmDocumentChecklistRequest,
  buildCreateAdmissionCrmRegistrationTemplateRequest,
  buildIssueAdmissionCrmRegistrationApplicationRequest,
  buildIssueAdmissionCrmRegistrationFormRequest,
} from './registration-documents-contracts';

export const AdmissionCrmRegistrationDocumentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
      AdmissionCrmRegistrationIssuanceResultDto,
      { leadId: string; body: IssueAdmissionCrmRegistrationApplicationDto }
    >({
      query: buildIssueAdmissionCrmRegistrationApplicationRequest,
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    sendAdmissionCrmRegistrationInvitation: builder.mutation<
      AdmissionCrmRegistrationIssuanceResultDto,
      { registrationId: string }
    >({
      query: ({ registrationId }) => ({
        url: `/student-enrollment/admissions-crm/registrations/${registrationId}/invitation/send`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    getAdmissionCrmRegistrationReadiness: builder.query<
      AdmissionCrmRegistrationReadinessDto,
      { leadId: string }
    >({
      query: ({ leadId }) => ({
        url: `/student-enrollment/admissions-crm/leads/${leadId}/registrations/readiness`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.configuration],
    }),
    createDirectAdmissionCrmRegistration: builder.mutation<
      AdmissionCrmDirectRegistrationResultDto,
      { academicYearId: string; body: CreateDirectAdmissionCrmRegistrationDto }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/registrations/direct`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
    }),
    createPaperAdmissionCrmRegistration: builder.mutation<
      AdmissionCrmDirectRegistrationResultDto,
      { academicYearId: string; body: CreatePaperAdmissionCrmRegistrationDto }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/registrations/from-paper`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        studentAdmissionsCrmType.lead,
        studentAdmissionsCrmType.timeline,
        studentAdmissionsCrmType.analytics,
      ],
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
    saveAdmissionCrmStaffRegistrationResponses: builder.mutation<
      AdmissionCrmRegistrationApplicationDto,
      { applicationId: string; body: SaveAdmissionCrmRegistrationResponsesDto }
    >({
      query: ({ applicationId, body }) => ({
        url: `/student-enrollment/admissions-crm/registrations/${applicationId}/staff-responses`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
    }),
    submitAdmissionCrmStaffRegistrationResponses: builder.mutation<
      AdmissionCrmRegistrationApplicationDto,
      { applicationId: string; body: SaveAdmissionCrmRegistrationResponsesDto }
    >({
      query: ({ applicationId, body }) => ({
        url: `/student-enrollment/admissions-crm/registrations/${applicationId}/staff-submit`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.lead, studentAdmissionsCrmType.timeline],
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
    cancelAdmissionCrmEventRegistration: builder.mutation<
      AdmissionCrmEventDto,
      { eventId: string; registrationId: string; reason?: string }
    >({
      query: ({ eventId, registrationId, reason }) => ({
        url: `/student-enrollment/admissions-crm/events/${eventId}/registrations/${registrationId}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [studentAdmissionsCrmType.event, studentAdmissionsCrmType.timeline],
    }),
    checkInAdmissionCrmEventRegistration: builder.mutation<
      AdmissionCrmEventDto,
      { eventId: string; registrationId: string }
    >({
      query: ({ eventId, registrationId }) => ({
        url: `/student-enrollment/admissions-crm/events/${eventId}/registrations/${registrationId}/check-in`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.event, studentAdmissionsCrmType.timeline],
    }),
    markNoShowAdmissionCrmEventRegistration: builder.mutation<
      AdmissionCrmEventDto,
      { eventId: string; registrationId: string }
    >({
      query: ({ eventId, registrationId }) => ({
        url: `/student-enrollment/admissions-crm/events/${eventId}/registrations/${registrationId}/no-show`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.event, studentAdmissionsCrmType.timeline],
    }),
  }),
});

export const {
  useIssueAdmissionCrmRegistrationFormMutation,
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
  useSendAdmissionCrmRegistrationInvitationMutation,
  useGetAdmissionCrmRegistrationReadinessQuery,
  useCreateDirectAdmissionCrmRegistrationMutation,
  useCreatePaperAdmissionCrmRegistrationMutation,
  useGetAdmissionCrmRegistrationApplicationQuery,
  useGetCurrentAdmissionCrmRegistrationByLeadQuery,
  useSaveAdmissionCrmStaffRegistrationResponsesMutation,
  useSubmitAdmissionCrmStaffRegistrationResponsesMutation,
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
  useWaiveAdmissionCrmApplicantDocumentMutation,
  useCancelAdmissionCrmEventRegistrationMutation,
  useCheckInAdmissionCrmEventRegistrationMutation,
  useMarkNoShowAdmissionCrmEventRegistrationMutation,
} = AdmissionCrmRegistrationDocumentsApi;

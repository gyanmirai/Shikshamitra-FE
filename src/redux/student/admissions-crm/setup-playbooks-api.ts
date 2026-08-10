import { api } from 'src/redux/service';

import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

import {
  AdmissionCrmJourneyRunResultDto,
  AdmissionCrmListParams,
  AdmissionCrmSlotGenerationResultDto,
  AdmissionCrmSlotRecommendationDto,
  PagedResult,
} from './core-leads-contracts';

import {
  AdmissionCrmAdmissionYearSetupDto,
  AdmissionCrmConfigurationClonePreviewDto,
  AdmissionCrmConfigurationCloneResultDto,
  AdmissionCrmConfigurationImpactPreviewDto,
  AdmissionCrmConfigurationReferenceKind,
  AdmissionCrmConfigurationReferenceResultDto,
  AdmissionCrmCycleConfigurationDto,
  AdmissionCrmCycleListItemDto,
  AdmissionCrmCycleSummaryDto,
  AdmissionCrmFormTemplateDto,
  AdmissionCrmFormTemplateListParams,
  AdmissionCrmPipelineStageDto,
  AdmissionCrmPlaybookDto,
  AdmissionCrmPlaybookListParams,
  AdmissionCrmPlaybookResolutionDto,
  AdmissionCrmPlaybookUpsertDto,
  AdmissionCrmSetupStatusDto,
  CreateAdmissionCrmPipelineStageDto,
  GenerateAdmissionCrmPlaybookSlotsDto,
  RecommendAdmissionCrmPlaybookSlotDto,
  ResolveAdmissionCrmPlaybookDto,
  RunAdmissionCrmJourneyRulesDto,
  UpdateAdmissionCrmAdmissionYearSetupDto,
  buildAdmissionCrmJourneyRulesRunRequest,
  buildAdmissionCrmPlaybookListRequest,
  buildAdmissionCrmSchoolDefaultCycleConfigurationRequest,
  buildCreateAdmissionCrmPlaybookRequest,
  buildGenerateAdmissionCrmPlaybookSlotsRequest,
  buildRecommendAdmissionCrmPlaybookSlotRequest,
  buildResolveAdmissionCrmPlaybookRequest,
  buildUpdateAdmissionCrmSchoolDefaultCycleConfigurationRequest,
} from './setup-playbooks-contracts';

export const AdmissionCrmSetupPlaybooksApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
    getAdmissionCrmCycles: builder.query<
      PagedResult<AdmissionCrmCycleListItemDto>,
      AdmissionCrmListParams | void
    >({
      query: (params) => ({
        url: '/student-enrollment/admissions-crm/setup/cycles',
        method: 'GET',
        params: params ?? undefined,
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmAdmissionYearVersions: builder.query<
      AdmissionCrmAdmissionYearSetupDto[],
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/setup/admission-years/${academicYearId}/versions`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    createAdmissionCrmAdmissionYearDraft: builder.mutation<
      AdmissionCrmAdmissionYearSetupDto,
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/setup/admission-years/${academicYearId}/draft`,
        method: 'POST',
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    updateAdmissionCrmAdmissionYearDraft: builder.mutation<
      AdmissionCrmAdmissionYearSetupDto,
      { id: string; body: UpdateAdmissionCrmAdmissionYearSetupDto }
    >({
      query: ({ id, body }) => ({
        url: `/student-enrollment/admissions-crm/setup/admission-years/drafts/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    publishAdmissionCrmAdmissionYear: builder.mutation<
      AdmissionCrmAdmissionYearSetupDto,
      { id: string; concurrencyStamp: string }
    >({
      query: ({ id, concurrencyStamp }) => ({
        url: `/student-enrollment/admissions-crm/setup/admission-years/${id}/publish`,
        method: 'POST',
        body: { concurrencyStamp },
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    closeAdmissionCrmAdmissionYear: builder.mutation<
      AdmissionCrmAdmissionYearSetupDto,
      { id: string; reason: string; concurrencyStamp: string }
    >({
      query: ({ id, reason, concurrencyStamp }) => ({
        url: `/student-enrollment/admissions-crm/setup/admission-years/${id}/close`,
        method: 'POST',
        body: { reason, concurrencyStamp },
      }),
      invalidatesTags: [studentAdmissionsCrmType.configuration],
    }),
    getAdmissionCrmCycleSummary: builder.query<
      AdmissionCrmCycleSummaryDto,
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/admissions-crm/setup/cycles/${academicYearId}/summary`,
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
    getAdmissionCrmConfigurationReferences: builder.query<
      AdmissionCrmConfigurationReferenceResultDto,
      {
        academicYearId: string;
        kind: AdmissionCrmConfigurationReferenceKind;
        code: string;
      }
    >({
      query: ({ academicYearId, kind, code }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/configuration-safety/references`,
        method: 'GET',
        params: { kind, code },
      }),
      providesTags: [studentAdmissionsCrmType.configuration],
    }),
    previewAdmissionCrmConfigurationImpact: builder.mutation<
      AdmissionCrmConfigurationImpactPreviewDto,
      {
        academicYearId: string;
        body: {
          kind?: AdmissionCrmConfigurationReferenceKind;
          code?: string;
          proposedCycleConfiguration?: Partial<AdmissionCrmCycleConfigurationDto>;
          pipelineStageId?: string;
          proposedPipelineStage?: Partial<AdmissionCrmPipelineStageDto>;
        };
      }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/configuration-safety/impact-preview`,
        method: 'POST',
        body,
      }),
    }),
    previewAdmissionCrmConfigurationClone: builder.mutation<
      AdmissionCrmConfigurationClonePreviewDto,
      { sourceAcademicYearId: string; targetAcademicYearId: string }
    >({
      query: (body) => ({
        url: '/student-enrollment/admissions-crm/configuration-safety/clone/preview',
        method: 'POST',
        body,
      }),
    }),
    confirmAdmissionCrmConfigurationClone: builder.mutation<
      AdmissionCrmConfigurationCloneResultDto,
      {
        sourceAcademicYearId: string;
        targetAcademicYearId: string;
        previewFingerprint: string;
      }
    >({
      query: (body) => ({
        url: '/student-enrollment/admissions-crm/configuration-safety/clone/confirm',
        method: 'POST',
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
    createAdmissionCrmPipelineStage: builder.mutation<
      AdmissionCrmPipelineStageDto,
      { academicYearId: string; body: CreateAdmissionCrmPipelineStageDto }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/pipeline-stages`,
        method: 'POST',
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
  }),
});

export const {
  useRunAdmissionCrmJourneyRulesMutation,
  useGetAdmissionCrmSchoolDefaultCycleConfigurationQuery,
  useUpdateAdmissionCrmSchoolDefaultCycleConfigurationMutation,
  useGetAdmissionCrmCycleConfigurationQuery,
  useGetAdmissionCrmSetupStatusQuery,
  useGetAdmissionCrmCyclesQuery,
  useGetAdmissionCrmAdmissionYearVersionsQuery,
  useCreateAdmissionCrmAdmissionYearDraftMutation,
  useUpdateAdmissionCrmAdmissionYearDraftMutation,
  usePublishAdmissionCrmAdmissionYearMutation,
  useCloseAdmissionCrmAdmissionYearMutation,
  useGetAdmissionCrmCycleSummaryQuery,
  useUpdateAdmissionCrmCycleConfigurationMutation,
  useLazyGetAdmissionCrmConfigurationReferencesQuery,
  usePreviewAdmissionCrmConfigurationImpactMutation,
  usePreviewAdmissionCrmConfigurationCloneMutation,
  useConfirmAdmissionCrmConfigurationCloneMutation,
  useGetAdmissionCrmPipelineStagesQuery,
  useUpdateAdmissionCrmPipelineStageMutation,
  useCreateAdmissionCrmPipelineStageMutation,
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
  useGetAdmissionCrmFormTemplatesQuery,
  useGetAdmissionCrmFormTemplateQuery,
  useCreateAdmissionCrmFormTemplateMutation,
  useUpdateAdmissionCrmFormTemplateMutation,
  useUpdateAdmissionCrmFormTemplateStatusMutation,
} = AdmissionCrmSetupPlaybooksApi;

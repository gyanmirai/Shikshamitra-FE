import { api } from 'src/redux/service';
import { employeeType } from 'src/redux/tagTypes';

const compactParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );

export enum PerformanceStaffCategory {
  Teacher = 0,
  ClassTeacher = 1,
  HodCoordinator = 2,
  PrincipalVicePrincipal = 3,
  Admin = 4,
  Accounts = 5,
  LibrarianLabAssistant = 6,
  Transport = 7,
  SecurityHousekeeping = 8,
  ItSupport = 9,
}

export enum PerformanceBoardType {
  GenericIndian = 0,
  CBSE = 1,
  GSEB = 2,
}

export enum PerformanceSqaaDomain {
  CurriculumPedagogyAssessment = 0,
  Infrastructure = 1,
  HumanResources = 2,
  LeadershipGovernance = 3,
  InclusivenessWellBeing = 4,
  BeneficiarySatisfaction = 5,
  ManagementSchoolProcesses = 6,
}

export enum PerformanceStageType {
  SelfAppraisal = 0,
  ReportingManager = 1,
  HodCoordinator = 2,
  PrincipalManagement = 3,
  HrVerification = 4,
}

export type PerformanceTemplateCriterion = {
  id?: string;
  templateId?: string;
  sectionId?: string;
  name: string;
  gujaratiName?: string | null;
  description?: string | null;
  sqaaDomain?: PerformanceSqaaDomain;
  weight: number;
  evidenceRequired: boolean;
  displayOrder: number;
};

export type PerformanceTemplateSection = {
  id?: string;
  templateId?: string;
  name: string;
  gujaratiName?: string | null;
  sqaaDomain?: PerformanceSqaaDomain;
  weight: number;
  displayOrder: number;
  criteria: PerformanceTemplateCriterion[];
};

export type PerformanceTemplate = {
  id: string;
  name: string;
  staffCategory: number;
  roleName?: string | null;
  ratingScaleMax: number;
  allowNotApplicable: boolean;
  status: number;
  description?: string | null;
  boardType?: PerformanceBoardType;
  gujaratiName?: string | null;
  sections: PerformanceTemplateSection[];
};

export type ProfessionalReviewCycle = {
  id: string;
  academicYearId?: string | null;
  name: string;
  cycleType: number;
  periodStart: string;
  periodEnd: string;
  selfReviewDueDate?: string | null;
  reviewerDueDate?: string | null;
  finalizationDueDate?: string | null;
  ratingScaleMax: number;
  allowNotApplicable: boolean;
  status: number;
  assignedCount: number;
  finalizedCount: number;
};

export type PerformanceReviewResponse = {
  id?: string;
  criterionId: string;
  rating?: number | null;
  isNotApplicable: boolean;
  comment?: string | null;
};

export type PerformanceReviewStage = {
  id: string;
  reviewAssignmentId: string;
  stageType: PerformanceStageType;
  reviewerEmployeeId?: string | null;
  status: number;
  summaryComment?: string | null;
  submittedAt?: string | null;
  responses: PerformanceReviewResponse[];
};

export type ProfessionalReview = {
  id: string;
  cycleId: string;
  cycleName: string;
  employeeId: string;
  employeeName: string;
  employeeIdentifier?: string | null;
  employeeRole?: string | null;
  templateId?: string | null;
  templateName?: string | null;
  finalScore?: number | null;
  finalRating?: string | null;
  communicationScore: number;
  problemSolvingScore: number;
  comments?: string | null;
  feedback?: string | null;
  status: number;
  submittedAt?: string | null;
  finalizedAt?: string | null;
  template?: PerformanceTemplate | null;
  stages?: PerformanceReviewStage[];
  outcome?: PerformanceOutcome | null;
};

export type PerformanceOutcome = {
  id: string;
  reviewAssignmentId: string;
  finalScore: number;
  finalRating: string;
  strengths?: string | null;
  improvementAreas?: string | null;
  recommendation: number;
  recommendationNotes?: string | null;
  incrementRecommended: boolean;
  promotionRecommended: boolean;
};

export type PerformanceDashboard = {
  activeCycles: number;
  pendingSelfReviews: number;
  pendingReviewerReviews: number;
  overdueReviews: number;
  finalizedReviews: number;
  trainingRecommendations: number;
  incrementRecommendations: number;
};

export type PerformanceSqaaEvidence = {
  domain: PerformanceSqaaDomain;
  templateCount: number;
  assignedReviewCount: number;
  mappedCriteria: number;
  evidenceRequiredCriteria: number;
  evidenceSubmitted: number;
  missingEvidence: number;
};

export const professionalManagementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPerformanceDashboard: builder.query<PerformanceDashboard, void>({
      query: () => '/hr/professional-management/dashboard',
      providesTags: [employeeType.professionalReview],
    }),
    getPerformanceTemplates: builder.query<any, any>({
      query: (params = {}) => ({
        url: '/hr/professional-management/templates',
        method: 'GET',
        params: compactParams({ page: 1, pageSize: 50, ...params }),
      }),
      providesTags: [employeeType.professionalReview],
    }),
    getDefaultPerformanceTemplates: builder.query<any, void>({
      query: () => '/hr/professional-management/templates/defaults',
      providesTags: [employeeType.professionalReview],
    }),
    createPerformanceTemplate: builder.mutation<PerformanceTemplate, any>({
      query: (body) => ({ url: '/hr/professional-management/templates', method: 'POST', body }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    updatePerformanceTemplate: builder.mutation<PerformanceTemplate, any>({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/templates/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    publishPerformanceTemplate: builder.mutation<PerformanceTemplate, string>({
      query: (id) => ({
        url: `/hr/professional-management/templates/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    clonePerformanceTemplate: builder.mutation<PerformanceTemplate, string>({
      query: (id) => ({ url: `/hr/professional-management/templates/${id}/clone`, method: 'POST' }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    archivePerformanceTemplate: builder.mutation<PerformanceTemplate, string>({
      query: (id) => ({
        url: `/hr/professional-management/templates/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    getProfessionalReviewCycles: builder.query<any, any>({
      query: (params = {}) => ({
        url: '/hr/professional-management/review-cycles',
        method: 'GET',
        params: compactParams({ page: 1, pageSize: 50, ...params }),
      }),
      providesTags: [employeeType.professionalReview],
    }),
    createProfessionalReviewCycle: builder.mutation<any, any>({
      query: (body) => ({ url: '/hr/professional-management/review-cycles', method: 'POST', body }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    updateProfessionalReviewCycle: builder.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/review-cycles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    publishProfessionalReviewCycle: builder.mutation<any, string>({
      query: (id) => ({
        url: `/hr/professional-management/review-cycles/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    assignProfessionalReviewEmployees: builder.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/review-cycles/${id}/assign-employees`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    moveProfessionalReviewCycleToCalibration: builder.mutation<any, string>({
      query: (id) => ({
        url: `/hr/professional-management/review-cycles/${id}/move-to-calibration`,
        method: 'POST',
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    finalizeProfessionalReviewCycle: builder.mutation<any, string>({
      query: (id) => ({
        url: `/hr/professional-management/review-cycles/${id}/finalize`,
        method: 'POST',
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    archiveProfessionalReviewCycle: builder.mutation<any, string>({
      query: (id) => ({
        url: `/hr/professional-management/review-cycles/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    getProfessionalCycleReviews: builder.query<any, any>({
      query: ({ id, search }) => ({
        url: `/hr/professional-management/review-cycles/${id}/reviews`,
        method: 'GET',
        params: compactParams({ search }),
      }),
      providesTags: [employeeType.professionalReview],
    }),
    getPerformanceReviews: builder.query<any, any>({
      query: (params = {}) => ({
        url: '/hr/professional-management/reviews',
        method: 'GET',
        params: compactParams(params),
      }),
      providesTags: [employeeType.professionalReview],
    }),
    getPerformanceReview: builder.query<ProfessionalReview, string>({
      query: (id) => `/hr/professional-management/reviews/${id}`,
      providesTags: [employeeType.professionalReview],
    }),
    savePerformanceSelfAppraisal: builder.mutation<ProfessionalReview, any>({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/reviews/${id}/self-appraisal`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    savePerformanceReviewerStage: builder.mutation<ProfessionalReview, any>({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/reviews/${id}/reviewer-stage`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    submitPerformanceStage: builder.mutation<ProfessionalReview, any>({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/reviews/${id}/submit-stage`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    savePerformanceOutcome: builder.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/reviews/${id}/final-outcome`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    reopenPerformanceReview: builder.mutation<ProfessionalReview, any>({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/reviews/${id}/reopen`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    getPerformanceObservations: builder.query<any, string>({
      query: (id) => `/hr/professional-management/reviews/${id}/observations`,
      providesTags: [employeeType.professionalReview],
    }),
    addPerformanceObservation: builder.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/reviews/${id}/observations`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    addPerformanceEvidence: builder.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/reviews/${id}/evidence`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    deletePerformanceEvidence: builder.mutation<void, string>({
      query: (id) => ({
        url: `/hr/professional-management/evidence/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    addPerformanceFeedback: builder.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/reviews/${id}/feedback`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    getPerformanceFeedback: builder.query<any, string>({
      query: (id) => `/hr/professional-management/reviews/${id}/feedback`,
      providesTags: [employeeType.professionalReview],
    }),
    addPerformanceDevelopmentPlan: builder.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/reviews/${id}/development-plan`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    updatePerformanceDevelopmentPlan: builder.mutation<any, any>({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/development-plans/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    getEmployeeProfessionalReviewHistory: builder.query<any, string>({
      query: (employeeId) => `/hr/professional-management/employees/${employeeId}/review-history`,
      providesTags: [employeeType.professionalReview],
    }),
    getPerformanceRatingDistribution: builder.query<any, any>({
      query: (params = {}) => ({
        url: '/hr/professional-management/reports/rating-distribution',
        params: compactParams(params),
      }),
      providesTags: [employeeType.professionalReview],
    }),
    getPerformancePendingActions: builder.query<any, any>({
      query: (params = {}) => ({
        url: '/hr/professional-management/reports/pending-actions',
        params: compactParams(params),
      }),
      providesTags: [employeeType.professionalReview],
    }),
    getPerformanceTrainingNeeds: builder.query<any, any>({
      query: (params = {}) => ({
        url: '/hr/professional-management/reports/training-needs',
        params: compactParams(params),
      }),
      providesTags: [employeeType.professionalReview],
    }),
    getPerformanceIncrementRecommendations: builder.query<any, any>({
      query: (params = {}) => ({
        url: '/hr/professional-management/reports/increment-recommendations',
        params: compactParams(params),
      }),
      providesTags: [employeeType.professionalReview],
    }),
    getPerformanceSqaaEvidence: builder.query<PerformanceSqaaEvidence[], any>({
      query: (params = {}) => ({
        url: '/hr/professional-management/reports/sqaaf-evidence',
        params: compactParams(params),
      }),
      providesTags: [employeeType.professionalReview],
    }),
    getPerformanceAuditTrail: builder.query<any, any>({
      query: (params = {}) => ({
        url: '/hr/professional-management/audit',
        params: compactParams(params),
      }),
      providesTags: [employeeType.professionalReview],
    }),
    saveProfessionalReviewDraft: builder.mutation({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/reviews/${id}/draft`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
    submitProfessionalReview: builder.mutation({
      query: ({ id, body }) => ({
        url: `/hr/professional-management/reviews/${id}/submit`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.professionalReview],
    }),
  }),
});

export const {
  useGetPerformanceDashboardQuery,
  useGetPerformanceTemplatesQuery,
  useGetDefaultPerformanceTemplatesQuery,
  useCreatePerformanceTemplateMutation,
  useUpdatePerformanceTemplateMutation,
  usePublishPerformanceTemplateMutation,
  useClonePerformanceTemplateMutation,
  useArchivePerformanceTemplateMutation,
  useGetProfessionalReviewCyclesQuery,
  useCreateProfessionalReviewCycleMutation,
  useUpdateProfessionalReviewCycleMutation,
  usePublishProfessionalReviewCycleMutation,
  useAssignProfessionalReviewEmployeesMutation,
  useMoveProfessionalReviewCycleToCalibrationMutation,
  useFinalizeProfessionalReviewCycleMutation,
  useArchiveProfessionalReviewCycleMutation,
  useGetProfessionalCycleReviewsQuery,
  useGetPerformanceReviewsQuery,
  useGetPerformanceReviewQuery,
  useSavePerformanceSelfAppraisalMutation,
  useSavePerformanceReviewerStageMutation,
  useSubmitPerformanceStageMutation,
  useSavePerformanceOutcomeMutation,
  useReopenPerformanceReviewMutation,
  useGetPerformanceObservationsQuery,
  useAddPerformanceObservationMutation,
  useAddPerformanceEvidenceMutation,
  useDeletePerformanceEvidenceMutation,
  useAddPerformanceFeedbackMutation,
  useGetPerformanceFeedbackQuery,
  useAddPerformanceDevelopmentPlanMutation,
  useUpdatePerformanceDevelopmentPlanMutation,
  useGetEmployeeProfessionalReviewHistoryQuery,
  useGetPerformanceRatingDistributionQuery,
  useGetPerformancePendingActionsQuery,
  useGetPerformanceTrainingNeedsQuery,
  useGetPerformanceIncrementRecommendationsQuery,
  useGetPerformanceSqaaEvidenceQuery,
  useGetPerformanceAuditTrailQuery,
  useSaveProfessionalReviewDraftMutation,
  useSubmitProfessionalReviewMutation,
} = professionalManagementApi;

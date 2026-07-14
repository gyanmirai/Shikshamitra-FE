import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export enum RubricStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
}

export enum RubricEvaluationStatus {
  Draft = 0,
  Submitted = 1,
  Approved = 2,
  Returned = 3,
}

export type RubricCriterionInputDto = {
  title: string;
  description?: string | null;
  maxMarks: number;
  displayOrder: number;
};

export type CreateUpdateRubricDto = {
  standardId: string;
  subjectId: string;
  homeworkId?: string | null;
  assignmentId?: string | null;
  title: string;
  description?: string | null;
  criteria: RubricCriterionInputDto[];
};

export type AssessmentRubricCriterionDto = {
  id: string;
  rubricId: string;
  title: string;
  description?: string | null;
  maxMarks: number;
  displayOrder: number;
};

export type AssessmentRubricDto = {
  id: string;
  standardId: string;
  subjectId: string;
  homeworkId?: string | null;
  assignmentId?: string | null;
  title: string;
  description?: string | null;
  totalMarks: number;
  version: number;
  status: RubricStatus;
  criteria: AssessmentRubricCriterionDto[];
};

export type GetRubricsParams = {
  standardId?: string;
  subjectId?: string;
  homeworkId?: string;
  assignmentId?: string;
  status?: RubricStatus;
  search?: string;
};

export type RubricEvaluationScoreInputDto = {
  criterionId: string;
  marks: number;
  comments?: string | null;
};

export type UpsertRubricEvaluationDto = {
  studentSubmissionId: string;
  studentId: string;
  remarks?: string | null;
  scores: RubricEvaluationScoreInputDto[];
};

export type RubricCriterionScoreDto = {
  id: string;
  evaluationId: string;
  criterionId: string;
  marks: number;
  comments?: string | null;
};

export type RubricEvaluationDto = {
  id: string;
  rubricId: string;
  studentSubmissionId: string;
  studentId: string;
  evaluatorId: string;
  totalMarks: number;
  remarks?: string | null;
  status: RubricEvaluationStatus;
  scores: RubricCriterionScoreDto[];
};

export const rubricAssessmentApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getRubrics: builder.query<AssessmentRubricDto[], GetRubricsParams | void>({
      query: (params) => ({
        url: '/academic/rubrics',
        method: 'GET',
        params: params ?? undefined,
      }),
      providesTags: [academicType.assessmentRubric],
    }),

    getRubricById: builder.query<AssessmentRubricDto, string>({
      query: (id) => ({
        url: `/academic/rubrics/${id}`,
        method: 'GET',
      }),
      providesTags: [academicType.assessmentRubric],
    }),

    addRubric: builder.mutation<AssessmentRubricDto, CreateUpdateRubricDto>({
      query: (body) => ({
        url: '/academic/rubrics',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.assessmentRubric],
    }),

    updateRubric: builder.mutation<
      AssessmentRubricDto,
      { id: string; body: CreateUpdateRubricDto }
    >({
      query: ({ id, body }) => ({
        url: `/academic/rubrics/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.assessmentRubric, academicType.rubricEvaluation],
    }),

    publishRubric: builder.mutation<void, string>({
      query: (id) => ({
        url: `/academic/rubrics/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.assessmentRubric],
    }),

    archiveRubric: builder.mutation<void, string>({
      query: (id) => ({
        url: `/academic/rubrics/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.assessmentRubric],
    }),

    upsertRubricEvaluation: builder.mutation<
      RubricEvaluationDto,
      { rubricId: string; body: UpsertRubricEvaluationDto }
    >({
      query: ({ rubricId, body }) => ({
        url: `/academic/rubrics/${rubricId}/evaluations`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        academicType.rubricEvaluation,
        academicType.homeworkSubmissions,
        academicType.assignmentSubmissions,
      ],
    }),

    getRubricEvaluations: builder.query<RubricEvaluationDto[], string>({
      query: (rubricId) => ({
        url: `/academic/rubrics/${rubricId}/evaluations`,
        method: 'GET',
      }),
      providesTags: [academicType.rubricEvaluation],
    }),

    submitRubricEvaluation: builder.mutation<void, string>({
      query: (evaluationId) => ({
        url: `/academic/rubrics/evaluations/${evaluationId}/submit`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.rubricEvaluation],
    }),

    approveRubricEvaluation: builder.mutation<void, string>({
      query: (evaluationId) => ({
        url: `/academic/rubrics/evaluations/${evaluationId}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [
        academicType.rubricEvaluation,
        academicType.homeworkSubmissions,
        academicType.assignmentSubmissions,
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRubricsQuery,
  useGetRubricByIdQuery,
  useAddRubricMutation,
  useUpdateRubricMutation,
  usePublishRubricMutation,
  useArchiveRubricMutation,
  useUpsertRubricEvaluationMutation,
  useGetRubricEvaluationsQuery,
  useSubmitRubricEvaluationMutation,
  useApproveRubricEvaluationMutation,
} = rubricAssessmentApi;

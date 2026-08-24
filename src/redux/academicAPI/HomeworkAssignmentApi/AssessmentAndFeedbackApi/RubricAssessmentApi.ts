import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export enum RubricStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
  Superseded = 3,
}

export enum RubricEvaluationStatus {
  Draft = 0,
  Submitted = 1,
  Approved = 2,
  Returned = 3,
}

export enum RubricWorkType {
  Homework = 0,
  Assignment = 1,
  Both = 2,
}

export enum RubricScoringModel {
  PointsBased = 0,
  WeightedPercentage = 1,
  PerformanceLevels = 2,
  Checklist = 3,
  RatingScale = 4,
}

export enum RubricVisibility {
  Private = 0,
  SelectedTeachers = 1,
  Department = 2,
  Institution = 3,
}

export type RubricCriterionInputDto = {
  title: string;
  description?: string | null;
  studentDescription?: string | null;
  teacherGuidance?: string | null;
  isRequired: boolean;
  maxMarks: number;
  displayOrder: number;
};

export type RubricPerformanceLevelDto = {
  level: number;
  label: string;
  score: number;
  description?: string | null;
  studentLabel?: string | null;
};

export type CreateUpdateRubricDto = {
  standardId?: string | null;
  subjectId?: string | null;
  academicMediumId?: string | null;
  homeworkId?: string | null;
  assignmentId?: string | null;
  homeworkTypeId?: string | null;
  assignmentTypeId?: string | null;
  sourceTemplateId?: string | null;
  isTemplate?: boolean;
  appliesToWorkType?: RubricWorkType | null;
  scoringModel?: RubricScoringModel;
  visibility?: RubricVisibility;
  title: string;
  description?: string | null;
  evaluationInstructions?: string | null;
  studentInstructions?: string | null;
  tags?: string[];
  performanceLevels?: RubricPerformanceLevelDto[];
  criteria: RubricCriterionInputDto[];
};

export type CreateRubricFromTemplateDto = {
  standardId: string;
  subjectId: string;
  homeworkId?: string | null;
  assignmentId?: string | null;
  title?: string | null;
  description?: string | null;
};

export type AssessmentRubricCriterionDto = {
  id: string;
  rubricId: string;
  title: string;
  description?: string | null;
  studentDescription?: string | null;
  teacherGuidance?: string | null;
  isRequired: boolean;
  maxMarks: number;
  displayOrder: number;
};

export type AssessmentRubricDto = {
  id: string;
  standardId?: string | null;
  subjectId?: string | null;
  academicMediumId?: string | null;
  homeworkId?: string | null;
  assignmentId?: string | null;
  homeworkTypeId?: string | null;
  assignmentTypeId?: string | null;
  sourceTemplateId?: string | null;
  isTemplate?: boolean;
  appliesToWorkType?: RubricWorkType | null;
  scoringModel: RubricScoringModel;
  visibility: RubricVisibility;
  title: string;
  description?: string | null;
  evaluationInstructions?: string | null;
  studentInstructions?: string | null;
  tags: string[];
  performanceLevels: RubricPerformanceLevelDto[];
  totalMarks: number;
  version: number;
  status: RubricStatus;
  creationTime?: string;
  lastModificationTime?: string | null;
  criteria: AssessmentRubricCriterionDto[];
};

export type GetRubricsParams = {
  standardId?: string;
  subjectId?: string;
  academicMediumId?: string;
  homeworkId?: string;
  assignmentId?: string;
  homeworkTypeId?: string;
  assignmentTypeId?: string;
  isTemplate?: boolean;
  appliesToWorkType?: RubricWorkType;
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

export type StudentAssignmentEvaluationParams = {
  studentId: string;
  assignmentId: string;
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
      invalidatesTags: [academicType.assessmentRubric, academicType.chapter],
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
      invalidatesTags: [
        academicType.assessmentRubric,
        academicType.rubricEvaluation,
        academicType.chapter,
      ],
    }),

    createRubricFromTemplate: builder.mutation<
      AssessmentRubricDto,
      { templateId: string; body: CreateRubricFromTemplateDto }
    >({
      query: ({ templateId, body }) => ({
        url: `/academic/rubrics/${templateId}/copy-to-task`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        academicType.assessmentRubric,
        academicType.homework,
        academicType.assignment,
        academicType.chapter,
      ],
    }),

    publishRubric: builder.mutation<void, string>({
      query: (id) => ({
        url: `/academic/rubrics/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.assessmentRubric, academicType.chapter],
    }),

    archiveRubric: builder.mutation<void, string>({
      query: (id) => ({
        url: `/academic/rubrics/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.assessmentRubric, academicType.chapter],
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

    getStudentAssignmentEvaluation: builder.query<
      RubricEvaluationDto,
      StudentAssignmentEvaluationParams
    >({
      query: ({ studentId, assignmentId }) => ({
        url: `/academic/rubrics/evaluations/student/${studentId}/assignment/${assignmentId}`,
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
  useCreateRubricFromTemplateMutation,
  usePublishRubricMutation,
  useArchiveRubricMutation,
  useUpsertRubricEvaluationMutation,
  useGetRubricEvaluationsQuery,
  useGetStudentAssignmentEvaluationQuery,
  useSubmitRubricEvaluationMutation,
  useApproveRubricEvaluationMutation,
} = rubricAssessmentApi;

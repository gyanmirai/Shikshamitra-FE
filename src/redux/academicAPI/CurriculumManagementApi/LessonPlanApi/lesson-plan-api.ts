import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const lessonPlanApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Lesson Plans ───────────────────────────────────────────────────────
    getLessonPlans: builder.query({
      query: (params) => ({ url: '/academic/curriculum/lesson-plans', method: 'GET', params }),
      providesTags: [academicType.lessonPlan],
    }),

    getLessonPlanTimeline: builder.query({
      query: (params) => ({
        url: '/academic/curriculum/lesson-plans/timeline',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.lessonPlan],
    }),

    bulkSubmitLessonPlans: builder.mutation({
      query: (body) => ({
        url: '/academic/curriculum/lesson-plans/bulk-submit',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.lessonPlan],
    }),

    requestPlanChanges: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academic/curriculum/lesson-plans/${id}/request-changes`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.lessonPlan, academicType.lessonPlanReview],
    }),

    createHomeworkFromLessonPlan: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academic/curriculum/lesson-plans/${id}/homework`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.homework],
    }),

    getLessonPlanById: builder.query({
      query: ({ id }) => ({ url: `/academic/curriculum/lesson-plans/${id}`, method: 'GET' }),
      providesTags: [academicType.lessonPlan],
    }),

    createLessonPlan: builder.mutation({
      query: (body) => ({ url: '/academic/curriculum/lesson-plans', method: 'POST', body }),
      invalidatesTags: [academicType.lessonPlan, academicType.coverageTracker],
    }),

    updateLessonPlan: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academic/curriculum/lesson-plans/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.lessonPlan],
    }),

    deleteLessonPlan: builder.mutation({
      query: ({ id }) => ({ url: `/academic/curriculum/lesson-plans/${id}`, method: 'DELETE' }),
      invalidatesTags: [academicType.lessonPlan, academicType.coverageTracker],
    }),

    submitLessonPlan: builder.mutation({
      query: ({ id }) => ({
        url: `/academic/curriculum/lesson-plans/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.lessonPlan, academicType.lessonPlanReview],
    }),

    approveLessonPlan: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academic/curriculum/lesson-plans/${id}/approve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.lessonPlan, academicType.lessonPlanReview],
    }),

    rejectLessonPlan: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academic/curriculum/lesson-plans/${id}/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.lessonPlan, academicType.lessonPlanReview],
    }),

    markLessonMissed: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academic/curriculum/lesson-plans/${id}/mark-missed`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.lessonPlan, academicType.missedLesson],
    }),

    // ─── Timetable-based plan generation ────────────────────────────────────
    generatePlansFromTimetable: builder.mutation({
      query: (body) => ({
        url: '/academic/curriculum/lesson-plans/generate-from-timetable',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.lessonPlan],
    }),

    getMissingPlansFromTimetable: builder.query({
      query: (params) => ({
        url: '/academic/curriculum/lesson-plans/missing-from-timetable',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.lessonPlan],
    }),

    copyPreviousWeekPlans: builder.mutation({
      query: (body) => ({
        url: '/academic/curriculum/lesson-plans/copy-previous-week',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.lessonPlan],
    }),

    // ─── Teacher Diary ───────────────────────────────────────────────────────
    getTeacherDiaries: builder.query({
      query: (params) => ({ url: '/academic/curriculum/teacher-diaries', method: 'GET', params }),
      providesTags: [academicType.teacherDiary],
    }),

    getTeacherDiaryById: builder.query({
      query: ({ id }) => ({ url: `/academic/curriculum/teacher-diaries/${id}`, method: 'GET' }),
      providesTags: [academicType.teacherDiary],
    }),

    createTeacherDiary: builder.mutation({
      query: (body) => ({ url: '/academic/curriculum/teacher-diaries', method: 'POST', body }),
      invalidatesTags: [academicType.teacherDiary, academicType.lessonPlan],
    }),

    updateTeacherDiary: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academic/curriculum/teacher-diaries/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.teacherDiary],
    }),

    submitTeacherDiary: builder.mutation({
      query: ({ id }) => ({
        url: `/academic/curriculum/teacher-diaries/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: [
        academicType.teacherDiary,
        academicType.lessonPlan,
        academicType.lessonPlanReview,
      ],
    }),

    updateDiaryProgress: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academic/curriculum/teacher-diaries/${id}/update-progress`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.teacherDiary, academicType.coverageTracker],
    }),

    // ─── Evidence ────────────────────────────────────────────────────────────
    uploadDiaryEvidence: builder.mutation({
      query: ({ diaryId, body }) => ({
        url: `/academic/curriculum/teacher-diaries/${diaryId}/evidence`,
        method: 'POST',
        body,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: [academicType.diaryEvidence, academicType.teacherDiary],
    }),

    getDiaryEvidence: builder.query({
      query: ({ diaryId }) => ({
        url: `/academic/curriculum/teacher-diaries/${diaryId}/evidence`,
        method: 'GET',
      }),
      providesTags: [academicType.diaryEvidence],
    }),

    deleteDiaryEvidence: builder.mutation({
      query: ({ diaryId, evidenceId }) => ({
        url: `/academic/curriculum/teacher-diaries/${diaryId}/evidence/${evidenceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicType.diaryEvidence],
    }),

    // ─── Missed Lessons ──────────────────────────────────────────────────────
    getMissedLessons: builder.query({
      query: (params) => ({ url: '/academic/curriculum/missed-lessons', method: 'GET', params }),
      providesTags: [academicType.missedLesson],
    }),

    suggestReschedule: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academic/curriculum/missed-lessons/${id}/suggest-reschedule`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.missedLesson],
    }),

    approveReschedule: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academic/curriculum/missed-lessons/${id}/approve-reschedule`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.missedLesson, academicType.lessonPlan],
    }),

    // ─── Progress & Coverage ─────────────────────────────────────────────────
    getPlannedVsActual: builder.query({
      query: (params) => ({
        url: '/academic/curriculum/lesson-plans/planned-vs-actual',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.coverageTracker],
    }),

    getExecutionSummary: builder.query({
      query: (params) => ({
        url: '/academic/curriculum/lesson-plans/execution-summary',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.teachingExecutionHealth],
    }),

    getExecutionHealth: builder.query({
      query: (params) => ({
        url: '/academic/curriculum/lesson-plans/execution-health',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.teachingExecutionHealth],
    }),

    // ─── Settings ────────────────────────────────────────────────────────────
    getLessonPlanSettings: builder.query({
      query: (params) => ({
        url: '/academic/curriculum/lesson-plan-settings',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.lessonPlanSettings],
    }),

    saveLessonPlanSettings: builder.mutation({
      query: (body) => ({
        url: '/academic/curriculum/lesson-plan-settings',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.lessonPlanSettings],
    }),

    // ─── Reports ─────────────────────────────────────────────────────────────
    getTeacherComplianceReport: builder.query({
      query: (params) => ({
        url: '/academic/curriculum/lesson-plans/reports/teacher-compliance',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.lessonPlanReport],
    }),

    getMissedLessonReport: builder.query({
      query: (params) => ({
        url: '/academic/curriculum/lesson-plans/reports/missed-lessons',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.lessonPlanReport],
    }),

    getSyllabusDelayReport: builder.query({
      query: (params) => ({
        url: '/academic/curriculum/lesson-plans/reports/syllabus-delay',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.lessonPlanReport],
    }),

    getPlannedVsActualReport: builder.query({
      query: (params) => ({
        url: '/academic/curriculum/lesson-plans/reports/planned-vs-actual',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.lessonPlanReport],
    }),

    exportLessonPlanReport: builder.mutation({
      query: (params) => ({
        url: '/academic/curriculum/lesson-plans/reports/export',
        method: 'GET',
        params,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    // ─── Review Queue ────────────────────────────────────────────────────────
    getReviewQueue: builder.query({
      query: (params) => ({
        url: '/academic/curriculum/lesson-plans/review-queue',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.lessonPlanReview],
    }),

    // ─── Audit Log ───────────────────────────────────────────────────────────
    getLessonPlanAuditLog: builder.query({
      query: ({ entityType, entityId }) => ({
        url: `/academic/curriculum/lesson-plans/audit-log`,
        method: 'GET',
        params: { entityType, entityId },
      }),
      providesTags: [academicType.lessonPlanAuditLog],
    }),

    // ─── AI Endpoints ────────────────────────────────────────────────────────
    aiGenerateLessonPlan: builder.mutation({
      query: (body) => ({
        url: '/academic/curriculum/lesson-plans/ai/generate-plan',
        method: 'POST',
        body,
      }),
    }),

    aiGenerateDiarySummary: builder.mutation({
      query: (body) => ({
        url: '/academic/curriculum/lesson-plans/ai/diary-summary',
        method: 'POST',
        body,
      }),
    }),

    aiPlannedVsActualAnalysis: builder.mutation({
      query: (body) => ({
        url: '/academic/curriculum/lesson-plans/ai/planned-vs-actual-analysis',
        method: 'POST',
        body,
      }),
    }),

    aiRescheduleMissedLesson: builder.mutation({
      query: (body) => ({
        url: '/academic/curriculum/lesson-plans/ai/reschedule',
        method: 'POST',
        body,
      }),
    }),

    aiTeachingMethodRecommendation: builder.mutation({
      query: (body) => ({
        url: '/academic/curriculum/lesson-plans/ai/teaching-method',
        method: 'POST',
        body,
      }),
    }),

    aiResourceRecommendation: builder.mutation({
      query: (body) => ({
        url: '/academic/curriculum/lesson-plans/ai/resources',
        method: 'POST',
        body,
      }),
    }),

    aiQualityScore: builder.mutation({
      query: (body) => ({
        url: '/academic/curriculum/lesson-plans/ai/quality-score',
        method: 'POST',
        body,
      }),
    }),

    aiDiaryQualityReview: builder.mutation({
      query: (body) => ({
        url: '/academic/curriculum/lesson-plans/ai/diary-quality-review',
        method: 'POST',
        body,
      }),
    }),

    aiHodReviewAssistant: builder.mutation({
      query: (body) => ({
        url: '/academic/curriculum/lesson-plans/ai/review-assistant',
        method: 'POST',
        body,
      }),
    }),

    aiParentUpdateGenerator: builder.mutation({
      query: (body) => ({
        url: '/academic/curriculum/lesson-plans/ai/parent-update',
        method: 'POST',
        body,
      }),
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetLessonPlansQuery,
  useGetLessonPlanTimelineQuery,
  useBulkSubmitLessonPlansMutation,
  useRequestPlanChangesMutation,
  useCreateHomeworkFromLessonPlanMutation,
  useGetLessonPlanByIdQuery,
  useCreateLessonPlanMutation,
  useUpdateLessonPlanMutation,
  useDeleteLessonPlanMutation,
  useSubmitLessonPlanMutation,
  useApproveLessonPlanMutation,
  useRejectLessonPlanMutation,
  useMarkLessonMissedMutation,
  useGeneratePlansFromTimetableMutation,
  useGetMissingPlansFromTimetableQuery,
  useCopyPreviousWeekPlansMutation,
  useGetTeacherDiariesQuery,
  useGetTeacherDiaryByIdQuery,
  useCreateTeacherDiaryMutation,
  useUpdateTeacherDiaryMutation,
  useSubmitTeacherDiaryMutation,
  useUpdateDiaryProgressMutation,
  useUploadDiaryEvidenceMutation,
  useGetDiaryEvidenceQuery,
  useDeleteDiaryEvidenceMutation,
  useGetMissedLessonsQuery,
  useSuggestRescheduleMutation,
  useApproveRescheduleMutation,
  useGetPlannedVsActualQuery,
  useGetExecutionSummaryQuery,
  useGetExecutionHealthQuery,
  useGetLessonPlanSettingsQuery,
  useSaveLessonPlanSettingsMutation,
  useGetTeacherComplianceReportQuery,
  useGetMissedLessonReportQuery,
  useGetSyllabusDelayReportQuery,
  useGetPlannedVsActualReportQuery,
  useExportLessonPlanReportMutation,
  useGetReviewQueueQuery,
  useGetLessonPlanAuditLogQuery,
  useAiGenerateLessonPlanMutation,
  useAiGenerateDiarySummaryMutation,
  useAiPlannedVsActualAnalysisMutation,
  useAiRescheduleMissedLessonMutation,
  useAiTeachingMethodRecommendationMutation,
  useAiResourceRecommendationMutation,
  useAiQualityScoreMutation,
  useAiDiaryQualityReviewMutation,
  useAiHodReviewAssistantMutation,
  useAiParentUpdateGeneratorMutation,
} = lessonPlanApi;

import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const questionPaperApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuestionPaperDashboard: builder.query({
      query: (params) => ({ url: '/academics/question-papers/dashboard', method: 'GET', params }),
      providesTags: [academicType.questionPaper],
    }),
    getQuestionPaperSettings: builder.query({
      query: (params) => ({ url: '/academics/question-papers/settings', method: 'GET', params }),
      providesTags: [academicType.questionPaper],
    }),
    saveQuestionPaperSettings: builder.mutation({
      query: (body) => ({ url: '/academics/question-papers/settings', method: 'POST', body }),
      invalidatesTags: [academicType.questionPaper],
    }),
    getQuestionPapers: builder.query({
      query: (params) => ({ url: '/academics/question-papers', method: 'GET', params }),
      providesTags: [academicType.questionPaper],
    }),
    getQuestionPaperById: builder.query({
      query: ({ id }) => ({ url: `/academics/question-papers/${id}`, method: 'GET' }),
      providesTags: [academicType.questionPaper],
    }),
    createQuestionPaper: builder.mutation({
      query: (body) => ({ url: '/academics/question-papers', method: 'POST', body }),
      invalidatesTags: [academicType.questionPaper],
    }),
    updateQuestionPaper: builder.mutation({
      query: ({ id, body }) => ({ url: `/academics/question-papers/${id}`, method: 'PUT', body }),
      invalidatesTags: [academicType.questionPaper],
    }),
    deleteQuestionPaper: builder.mutation({
      query: ({ id }) => ({ url: `/academics/question-papers/${id}`, method: 'DELETE' }),
      invalidatesTags: [academicType.questionPaper],
    }),
    submitQuestionPaper: builder.mutation({
      query: ({ id }) => ({ url: `/academics/question-papers/${id}/submit`, method: 'POST' }),
      invalidatesTags: [academicType.questionPaper],
    }),
    approveQuestionPaper: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academics/question-papers/${id}/approve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.questionPaper],
    }),
    rejectQuestionPaper: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academics/question-papers/${id}/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.questionPaper],
    }),
    publishQuestionPaper: builder.mutation({
      query: ({ id }) => ({ url: `/academics/question-papers/${id}/publish`, method: 'POST' }),
      invalidatesTags: [academicType.questionPaper, academicType.questionBank],
    }),
    lockQuestionPaper: builder.mutation({
      query: ({ id }) => ({ url: `/academics/question-papers/${id}/lock`, method: 'POST' }),
      invalidatesTags: [academicType.questionPaper],
    }),
    archiveQuestionPaper: builder.mutation({
      query: ({ id }) => ({ url: `/academics/question-papers/${id}/archive`, method: 'POST' }),
      invalidatesTags: [academicType.questionPaper],
    }),
    getBlueprint: builder.query({
      query: ({ paperId }) => ({
        url: `/academics/question-papers/${paperId}/blueprint`,
        method: 'GET',
      }),
      providesTags: [academicType.questionPaper],
    }),
    saveBlueprint: builder.mutation({
      query: ({ paperId, body }) => ({
        url: `/academics/question-papers/${paperId}/blueprint`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.questionPaper],
    }),
    validateBlueprint: builder.mutation({
      query: ({ paperId }) => ({
        url: `/academics/question-papers/${paperId}/blueprint/validate`,
        method: 'POST',
      }),
    }),
    generatePaper: builder.mutation({
      query: ({ paperId }) => ({
        url: `/academics/question-papers/${paperId}/generate`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.questionPaper],
    }),
    addQuestionToPaper: builder.mutation({
      query: ({ paperId, body }) => ({
        url: `/academics/question-papers/${paperId}/add-question`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.questionPaper],
    }),
    removeQuestionFromPaper: builder.mutation({
      query: ({ paperId, paperQuestionId }) => ({
        url: `/academics/question-papers/${paperId}/remove-question`,
        method: 'POST',
        body: paperQuestionId,
      }),
      invalidatesTags: [academicType.questionPaper],
    }),
    reorderPaperQuestions: builder.mutation({
      query: ({ paperId, body }) => ({
        url: `/academics/question-papers/${paperId}/reorder-questions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.questionPaper],
    }),
    getPaperPreview: builder.query({
      query: ({ paperId }) => ({
        url: `/academics/question-papers/${paperId}/preview`,
        method: 'GET',
      }),
      providesTags: [academicType.questionPaper],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuestionPaperDashboardQuery,
  useGetQuestionPaperSettingsQuery,
  useSaveQuestionPaperSettingsMutation,
  useGetQuestionPapersQuery,
  useGetQuestionPaperByIdQuery,
  useCreateQuestionPaperMutation,
  useUpdateQuestionPaperMutation,
  useDeleteQuestionPaperMutation,
  useSubmitQuestionPaperMutation,
  useApproveQuestionPaperMutation,
  useRejectQuestionPaperMutation,
  usePublishQuestionPaperMutation,
  useLockQuestionPaperMutation,
  useArchiveQuestionPaperMutation,
  useGetBlueprintQuery,
  useSaveBlueprintMutation,
  useValidateBlueprintMutation,
  useGeneratePaperMutation,
  useAddQuestionToPaperMutation,
  useRemoveQuestionFromPaperMutation,
  useReorderPaperQuestionsMutation,
  useGetPaperPreviewQuery,
} = questionPaperApi;

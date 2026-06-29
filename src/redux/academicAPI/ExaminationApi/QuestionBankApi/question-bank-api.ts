import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const questionBankApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuestionBankDashboard: builder.query({
      query: (params) => ({ url: '/academics/question-bank/dashboard', method: 'GET', params }),
      providesTags: [academicType.questionBank],
    }),
    getQuestionBankSettings: builder.query({
      query: (params) => ({ url: '/academics/question-bank/settings', method: 'GET', params }),
      providesTags: [academicType.questionBank],
    }),
    saveQuestionBankSettings: builder.mutation({
      query: (body) => ({ url: '/academics/question-bank/settings', method: 'POST', body }),
      invalidatesTags: [academicType.questionBank],
    }),
    getQuestions: builder.query({
      query: (params) => ({ url: '/academics/question-bank/questions', method: 'GET', params }),
      providesTags: [academicType.questionBank],
    }),
    getQuestionById: builder.query({
      query: ({ id }) => ({ url: `/academics/question-bank/questions/${id}`, method: 'GET' }),
      providesTags: [academicType.questionBank],
    }),
    createQuestion: builder.mutation({
      query: (body) => ({ url: '/academics/question-bank/questions', method: 'POST', body }),
      invalidatesTags: [academicType.questionBank],
    }),
    updateQuestion: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academics/question-bank/questions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.questionBank],
    }),
    deleteQuestion: builder.mutation({
      query: ({ id }) => ({ url: `/academics/question-bank/questions/${id}`, method: 'DELETE' }),
      invalidatesTags: [academicType.questionBank],
    }),
    submitQuestion: builder.mutation({
      query: ({ id }) => ({
        url: `/academics/question-bank/questions/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.questionBank],
    }),
    approveQuestion: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academics/question-bank/questions/${id}/approve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.questionBank],
    }),
    rejectQuestion: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academics/question-bank/questions/${id}/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.questionBank],
    }),
    archiveQuestion: builder.mutation({
      query: ({ id }) => ({
        url: `/academics/question-bank/questions/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.questionBank],
    }),
    duplicateQuestion: builder.mutation({
      query: ({ id }) => ({
        url: `/academics/question-bank/questions/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.questionBank],
    }),
    checkDuplicateQuestion: builder.mutation({
      query: (body) => ({
        url: '/academics/question-bank/questions/check-duplicate',
        method: 'POST',
        body,
      }),
    }),
    bulkApproveQuestions: builder.mutation({
      query: (body) => ({
        url: '/academics/question-bank/questions/bulk-approve',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.questionBank],
    }),
    bulkRejectQuestions: builder.mutation({
      query: (body) => ({
        url: '/academics/question-bank/questions/bulk-reject',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.questionBank],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuestionBankDashboardQuery,
  useGetQuestionBankSettingsQuery,
  useSaveQuestionBankSettingsMutation,
  useGetQuestionsQuery,
  useGetQuestionByIdQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useSubmitQuestionMutation,
  useApproveQuestionMutation,
  useRejectQuestionMutation,
  useArchiveQuestionMutation,
  useDuplicateQuestionMutation,
  useCheckDuplicateQuestionMutation,
  useBulkApproveQuestionsMutation,
  useBulkRejectQuestionsMutation,
} = questionBankApi;

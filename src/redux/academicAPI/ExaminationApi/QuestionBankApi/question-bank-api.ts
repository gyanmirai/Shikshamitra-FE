import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

function omitEmptyQuestionParams(params: Record<string, unknown> = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
  );
}

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
    downloadQuestionBulkTemplate: builder.query<Blob, void>({
      query: () => ({
        url: '/academics/question-bank/questions/bulk-template',
        method: 'GET',
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
    saveQuestionBankSettings: builder.mutation({
      query: (body) => ({ url: '/academics/question-bank/settings', method: 'POST', body }),
      invalidatesTags: [academicType.questionBank],
    }),
    getQuestions: builder.query({
      query: (params) => ({
        url: '/academics/question-bank/questions',
        method: 'GET',
        params: omitEmptyQuestionParams(params),
      }),
      providesTags: [academicType.questionBank],
    }),
    getQuestionById: builder.query({
      query: ({ id }) => ({ url: `/academics/question-bank/questions/${id}`, method: 'GET' }),
      providesTags: [academicType.questionBank],
    }),
    createQuestion: builder.mutation({
      query: (body) => ({ url: '/academics/question-bank/questions', method: 'POST', body }),
      invalidatesTags: [academicType.questionBank, academicType.questionPaper, academicType.chapter],
    }),
    updateQuestion: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academics/question-bank/questions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.questionBank, academicType.questionPaper, academicType.chapter],
    }),
    deleteQuestion: builder.mutation({
      query: ({ id }) => ({ url: `/academics/question-bank/questions/${id}`, method: 'DELETE' }),
      invalidatesTags: [academicType.questionBank, academicType.questionPaper, academicType.chapter],
    }),
    submitQuestion: builder.mutation({
      query: ({ id }) => ({
        url: `/academics/question-bank/questions/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.questionBank, academicType.questionPaper, academicType.chapter],
    }),
    approveQuestion: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academics/question-bank/questions/${id}/approve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.questionBank, academicType.questionPaper, academicType.chapter],
    }),
    rejectQuestion: builder.mutation({
      query: ({ id, body }) => ({
        url: `/academics/question-bank/questions/${id}/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.questionBank, academicType.questionPaper, academicType.chapter],
    }),
    archiveQuestion: builder.mutation({
      query: ({ id }) => ({
        url: `/academics/question-bank/questions/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.questionBank, academicType.questionPaper, academicType.chapter],
    }),
    duplicateQuestion: builder.mutation({
      query: ({ id }) => ({
        url: `/academics/question-bank/questions/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.questionBank, academicType.questionPaper, academicType.chapter],
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
      invalidatesTags: [academicType.questionBank, academicType.questionPaper, academicType.chapter],
    }),
    bulkRejectQuestions: builder.mutation({
      query: (body) => ({
        url: '/academics/question-bank/questions/bulk-reject',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.questionBank, academicType.questionPaper, academicType.chapter],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuestionBankDashboardQuery,
  useGetQuestionBankSettingsQuery,
  useLazyDownloadQuestionBulkTemplateQuery,
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

import { academicApi } from '../../academicApi';

export const quizManagementApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Quizzes
    getQuizzes: builder.query({
      query: (params) => ({
        url: 'quizzes',
        method: 'GET',
        params,
      }),
      providesTags: ['Quiz'],
    }),

    // Create Quiz (Step 1)
    createQuiz: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: 'quizzes',
        method: 'POST',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: ['Quiz'],
    }),

    // Update Quiz (Step 1)
    updateQuiz: builder.mutation({
      query: ({ quizId, academicMediumId, body }) => ({
        url: `quizzes/${quizId}`,
        method: 'PUT',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: ['Quiz'],
    }),

    // Get Quiz (Step 1)
    getQuiz: builder.query({
      query: ({ quizId, academicMediumId }) => ({
        url: `quizzes/${quizId}`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: (result, error, { quizId }) => [{ type: 'Quiz', id: quizId }],
    }),

    // Update Quiz Questions (Step 2)
    updateQuizQuestions: builder.mutation({
      query: ({ quizId, body }) => ({
        url: `quizzes/${quizId}/questions`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: (result, error, { quizId }) => [{ type: 'Quiz', id: quizId }],
    }),

    // Get Quiz Questions (Step 2)
    getQuizQuestions: builder.query({
      query: (quizId) => ({
        url: `quizzes/${quizId}/questions`,
        method: 'GET',
      }),
      providesTags: (result, error, quizId) => [{ type: 'Quiz', id: quizId }],
    }),

    // Get Quiz Students Result
    getQuizStudentsResult: builder.query({
      query: (quizId) => ({
        url: `quizzes/${quizId}/students`,
        method: 'GET',
      }),
      providesTags: (result, error, quizId) => [{ type: 'Quiz', id: quizId }],
    }),

    // Get Student Quiz Submission
    getStudentQuizSubmission: builder.query({
      query: ({ quizId, studentId }) => ({
        url: `quizzes/${quizId}/submissions/${studentId}`,
        method: 'GET',
      }),
      providesTags: (result, error, { quizId, studentId }) => [
        { type: 'Quiz', id: `${quizId}-${studentId}` },
      ],
    }),

    // Submit Quiz Answers
    submitQuizAnswers: builder.mutation({
      query: ({ quizId, studentId, body }) => ({
        url: `quizzes/${quizId}/submit`,
        method: 'POST',
        params: { studentId },
        data: body,
      }),
      invalidatesTags: (result, error, { quizId, studentId }) => [
        { type: 'Quiz', id: quizId },
        { type: 'Quiz', id: `${quizId}-${studentId}` },
      ],
    }),

    // Submit Quiz Marks
    submitQuizMarks: builder.mutation({
      query: ({ quizId, studentId, body }) => ({
        url: `quizzes/${quizId}/submissions/${studentId}/marks`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: (result, error, { quizId, studentId }) => [
        { type: 'Quiz', id: quizId },
        { type: 'Quiz', id: `${quizId}-${studentId}` },
      ],
    }),

    // Delete Quiz
    deleteQuiz: builder.mutation({
      query: (quizId) => ({
        url: `quizzes/${quizId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quiz'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuizzesQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useGetQuizQuery,
  useUpdateQuizQuestionsMutation,
  useGetQuizQuestionsQuery,
  useGetQuizStudentsResultQuery,
  useGetStudentQuizSubmissionQuery,
  useSubmitQuizAnswersMutation,
  useSubmitQuizMarksMutation,
  useDeleteQuizMutation,
} = quizManagementApi;

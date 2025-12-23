import { academicApi } from '../../academicApi';

export const homeworkAssessmentAndFeedbackApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET homework submissions
    getHomeworkSubmissions: builder.query({
      query: ({ academicMediumId, ClassId, DivisionId, SubjectId, HomeworkId }) => ({
        url: `homework/submissions`,
        method: 'GET',
        params: {
          academicMediumId,
          ClassId,
          DivisionId,
          SubjectId,
          HomeworkId,
        },
      }),
      providesTags: ['HomeworkSubmissions'],
    }),

    // UPDATE homework submission feedback
    updateHomeworkSubmissionFeedback: builder.mutation({
      query: ({ homeworkId, studentId, academicMediumId, body }) => ({
        url: `homework/${homeworkId}/submissions/${studentId}/feedback`,
        method: 'PATCH',
        params: {
          academicMediumId,
        },
        data: body,
      }),
      invalidatesTags: ['HomeworkSubmissions'],
    }),

    // UPDATE homework submission status
    updateHomeworkSubmissionStatus: builder.mutation({
      query: ({ homeworkId, studentId, academicMediumId, body }) => ({
        url: `homework/${homeworkId}/submissions/${studentId}/status`,
        method: 'PATCH',
        params: {
          academicMediumId,
        },
        data: body,
      }),
      invalidatesTags: ['HomeworkSubmissions'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetHomeworkSubmissionsQuery,
  useUpdateHomeworkSubmissionFeedbackMutation,
  useUpdateHomeworkSubmissionStatusMutation,
} = homeworkAssessmentAndFeedbackApi;

import { academicApi } from '../../academicApi';

export const assessmentAndFeedbackApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET assignment submissions
    getAssignmentSubmissions: builder.query({
      query: ({ academicMediumId, ClassId, DivisionId, SubjectId, AssignmentId }) => ({
        url: `assignments/submissions`,
        method: 'GET',
        params: {
          academicMediumId,
          ClassId,
          DivisionId,
          SubjectId,
          AssignmentId,
        },
      }),
      providesTags: ['AssignmentSubmissions'],
    }),

    // UPDATE submission feedback
    updateSubmissionFeedback: builder.mutation({
      query: ({ assignmentId, studentId, academicMediumId, body }) => ({
        url: `assignments/${assignmentId}/submissions/${studentId}/feedback`,
        method: 'PATCH',
        params: {
          academicMediumId,
        },
        data: body,
      }),
      invalidatesTags: ['AssignmentSubmissions'],
    }),

    // UPDATE submission status
    updateSubmissionStatus: builder.mutation({
      query: ({ assignmentId, studentId, academicMediumId, body }) => ({
        url: `assignments/${assignmentId}/submissions/${studentId}/status`,
        method: 'PATCH',
        params: {
          academicMediumId,
        },
        data: body,
      }),
      invalidatesTags: ['AssignmentSubmissions'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAssignmentSubmissionsQuery,
  useUpdateSubmissionFeedbackMutation,
  useUpdateSubmissionStatusMutation,
} = assessmentAndFeedbackApi;

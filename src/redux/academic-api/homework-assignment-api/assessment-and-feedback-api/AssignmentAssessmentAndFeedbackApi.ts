import { academicApi } from '../../academicApi';

export const assessmentAndFeedbackApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET assignment submissions
    getAssignmentSubmissions: builder.query({
      query: ({ assignmentId, classId, divisionId, subjectId }) => ({
        url: `assignment/${assignmentId}/submissions`,
        method: 'GET',
        params: {
          classId,
          divisionId,
          subjectId,
        },
      }),
      providesTags: ['AssignmentSubmissions'],
    }),

    // Bulk update assessment status and feedback
    bulkUpdateAssessment: builder.mutation({
      query: ({ studentIds, feedback, assignmentId }) => ({
        url: `academics/assessments/bulk-update`,
        method: 'PUT',
        data: {
          studentIds,
          feedback,
          assignmentId,
        },
      }),
      invalidatesTags: ['AssignmentSubmissions'],
    }),

    // UPDATE assignment assessment (feedback and marks)
    updateAssignmentAssessment: builder.mutation({
      query: ({ assessmentId, obtainedMarks, feedback, remarks, status }) => ({
        url: `academics/assignments/assessments/${assessmentId}`,
        method: 'PUT',
        data: {
          obtainedMarks,
          feedback,
          remarks,
          status,
        },
      }),
      invalidatesTags: ['AssignmentSubmissions'],
    }),

    // UPDATE submission feedback
    updateSubmissionFeedback: builder.mutation({
      query: ({ assignmentId, studentId, body }) => ({
        url: `assignment/${assignmentId}/submissions/${studentId}/feedback`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: ['AssignmentSubmissions'],
    }),

    // UPDATE submission status
    updateSubmissionStatus: builder.mutation({
      query: ({ assignmentId, studentId, body }) => ({
        url: `assignment/${assignmentId}/submissions/${studentId}/status`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: ['AssignmentSubmissions'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAssignmentSubmissionsQuery,
  useBulkUpdateAssessmentMutation,
  useUpdateAssignmentAssessmentMutation,
  useUpdateSubmissionFeedbackMutation,
  useUpdateSubmissionStatusMutation,
} = assessmentAndFeedbackApi;

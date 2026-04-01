import { academicApi } from '../../academicApi';
import { academicType } from 'src/redux/tagTypes';


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
      providesTags: [academicType.assignmentSubmissions],
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
      invalidatesTags: [academicType.assignmentSubmissions],
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
      invalidatesTags: [academicType.assignmentSubmissions],
    }),

    // UPDATE submission feedback
    updateSubmissionFeedback: builder.mutation({
      query: ({ assignmentId, studentId, body }) => ({
        url: `assignment/${assignmentId}/submissions/${studentId}/feedback`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: [academicType.assignmentSubmissions],
    }),

    // UPDATE submission status
    updateSubmissionStatus: builder.mutation({
      query: ({ assignmentId, studentId, body }) => ({
        url: `assignment/${assignmentId}/submissions/${studentId}/status`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: [academicType.assignmentSubmissions],
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

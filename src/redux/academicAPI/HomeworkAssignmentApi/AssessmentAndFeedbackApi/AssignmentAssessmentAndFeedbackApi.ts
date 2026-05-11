import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const assessmentAndFeedbackApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET assignment submissions
    getAssignmentSubmissions: builder.query({
      query: ({ academicMediumId, ClassId, DivisionId, SubjectId, AssignmentId }) => ({
        url: `/assignments/submissions`,
        method: 'GET',
        params: {
          academicMediumId,
          ClassId,
          DivisionId,
          SubjectId,
          AssignmentId,
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
      query: ({ assignmentId, studentId, body, academicMediumId }) => ({
        url: `/assignments/${assignmentId}/submissions/${studentId}/feedback`,
        method: 'PATCH',
        params: {
          academicMediumId,
        },
        body,
      }),
      invalidatesTags: [academicType.assignmentSubmissions],
    }),

    // UPDATE submission status
    updateSubmissionStatus: builder.mutation({
      query: ({ assignmentId, studentId, body, academicMediumId }) => ({
        url: `/assignments/${assignmentId}/submissions/${studentId}/status`,
        method: 'PATCH',
        params: {
          academicMediumId,
        },
        body,
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

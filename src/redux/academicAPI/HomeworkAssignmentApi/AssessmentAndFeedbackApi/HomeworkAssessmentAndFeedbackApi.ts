import { academicApi } from '../../academicApi';
import { academicType } from 'src/redux/tagTypes';


export const homeworkAssessmentAndFeedbackApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET homework submissions
    getHomeworkSubmissions: builder.query({
      query: ({ homeworkId, classId, divisionId, subjectId }) => ({
        url: `homework/${homeworkId}/submissions`,
        method: 'GET',
        params: {
          classId,
          divisionId,
          subjectId,
        },
      }),
      providesTags: [academicType.homeworkSubmissions],
    }),

    // Bulk update assessment status and feedback
    bulkUpdateAssessment: builder.mutation({
      query: ({ studentIds, feedback, homeworkId }) => ({
        url: `academics/assessments/bulk-update`,
        method: 'PUT',
        data: {
          studentIds,
          feedback,
          homeworkId,
        },
      }),
      invalidatesTags: [academicType.homeworkSubmissions],
    }),

    // UPDATE homework submission feedback
    updateHomeworkSubmissionFeedback: builder.mutation({
      query: ({ homeworkId, studentId, body }) => ({
        url: `homework/${homeworkId}/submissions/${studentId}/feedback`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: [academicType.homeworkSubmissions],
    }),

    // UPDATE homework submission status
    updateHomeworkSubmissionStatus: builder.mutation({
      query: ({ homeworkId, studentId, body }) => ({
        url: `homework/${homeworkId}/submissions/${studentId}/status`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: [academicType.homeworkSubmissions],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetHomeworkSubmissionsQuery,
  useBulkUpdateAssessmentMutation,
  useUpdateHomeworkSubmissionFeedbackMutation,
  useUpdateHomeworkSubmissionStatusMutation,
} = homeworkAssessmentAndFeedbackApi;

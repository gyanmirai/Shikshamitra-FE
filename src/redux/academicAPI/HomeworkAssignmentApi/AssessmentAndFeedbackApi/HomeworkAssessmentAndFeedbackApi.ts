import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const homeworkAssessmentAndFeedbackApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET homework submissions
    getHomeworkSubmissions: builder.query({
      query: ({ academicMediumId, ClassId, DivisionId, SubjectId, HomeworkId }) => ({
        url: `/homework/submissions`,
        method: 'GET',
        params: {
          ...(academicMediumId && { academicMediumId }),
          ...(ClassId && { ClassId }),
          ...(DivisionId && { DivisionId }),
          ...(SubjectId && { SubjectId }),
          ...(HomeworkId && { HomeworkId }),
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
      query: ({ homeworkId, studentId, body, academicMediumId }) => ({
        url: `/homework/${homeworkId}/submissions/${studentId}/feedback`,
        method: 'PATCH',
        params: {
          academicMediumId,
        },
        body,
      }),
      invalidatesTags: [academicType.homeworkSubmissions],
    }),

    // UPDATE homework submission status
    updateHomeworkSubmissionStatus: builder.mutation({
      query: ({ homeworkId, studentId, body, academicMediumId }) => ({
        url: `/homework/${homeworkId}/submissions/${studentId}/status`,
        method: 'PATCH',
        params: {
          academicMediumId,
        },
        body,
      }),
      invalidatesTags: [academicType.homeworkSubmissions],
    }),

    uploadHomeworkSubmissionFile: builder.mutation({
      query: (body: FormData) => ({
        url: `/academic/homework-submissions`,
        method: 'POST',
        body,
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
  useUploadHomeworkSubmissionFileMutation,
} = homeworkAssessmentAndFeedbackApi;

import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const recordMarksApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Exam Students Marks
    getExamMarks: builder.query({
      query: (params) => ({
        url: `/academics/exams/marks`,
        method: 'GET',
        params,
      }),
      providesTags: [academicType.recordMarks],
    }),

    // Assign / Update Student Marks
    updateStudentMarks: builder.mutation({
      query: ({ examId, studentId, subjectId, body }) => ({
        url: `/academics/exams/${examId}/students/${studentId}/marks`,
        method: 'PATCH',
        params: { subjectId },
        body,
      }),
      invalidatesTags: [academicType.recordMarks],
    }),

    // Publish Exam Marks (Division-wise)
    publishExamMarks: builder.mutation({
      query: ({ examId, divisionId }) => ({
        url: `/academics/exams/${examId}/publish-marks`,
        method: 'PATCH',
        params: { divisionId },
      }),
      invalidatesTags: [academicType.recordMarks],
    }),

    // Save Draft – persist entered marks without submitting for review
    saveDraftMarks: builder.mutation({
      query: ({ examId, divisionId, subjectId }) => ({
        url: `/academics/exams/${examId}/marks/draft`,
        method: 'POST',
        params: { divisionId, subjectId },
      }),
      invalidatesTags: [academicType.recordMarks],
    }),

    // Submit marks for verification
    submitMarksForVerification: builder.mutation({
      query: ({ examId, divisionId, subjectId }) => ({
        url: `/academics/exams/${examId}/marks/submit`,
        method: 'POST',
        params: { divisionId, subjectId },
      }),
      invalidatesTags: [academicType.recordMarks],
    }),

    // Verify submitted marks
    verifyMarks: builder.mutation({
      query: ({ examId, divisionId, subjectId }) => ({
        url: `/academics/exams/${examId}/marks/verify`,
        method: 'POST',
        params: { divisionId, subjectId },
      }),
      invalidatesTags: [academicType.recordMarks],
    }),

    // Publish and lock verified marks (final workflow step)
    publishAndLockMarks: builder.mutation({
      query: ({ examId, divisionId, subjectId }) => ({
        url: `/academics/exams/${examId}/marks/publish`,
        method: 'POST',
        params: { divisionId, subjectId },
      }),
      invalidatesTags: [academicType.recordMarks],
    }),

    // Update student exam attendance status
    updateStudentAttendance: builder.mutation({
      query: ({ examId, studentId, subjectId, attendanceStatus }) => ({
        url: `/academics/exams/${examId}/students/${studentId}/attendance`,
        method: 'PATCH',
        params: { subjectId },
        body: { attendanceStatus },
      }),
      invalidatesTags: [academicType.recordMarks],
    }),

    // Get exam marks summary (for exam summary panel)
    getExamMarksSummary: builder.query({
      query: (params) => ({
        url: `/academics/exams/marks/summary`,
        method: 'GET',
        params,
      }),
      providesTags: [academicType.recordMarks],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetExamMarksQuery,
  useUpdateStudentMarksMutation,
  usePublishExamMarksMutation,
  useSaveDraftMarksMutation,
  useSubmitMarksForVerificationMutation,
  useVerifyMarksMutation,
  usePublishAndLockMarksMutation,
  useUpdateStudentAttendanceMutation,
  useGetExamMarksSummaryQuery,
} = recordMarksApi;

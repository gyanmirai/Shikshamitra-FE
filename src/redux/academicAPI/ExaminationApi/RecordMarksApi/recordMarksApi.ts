import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const recordMarksApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getExamGradeOptions: builder.query<string[], {
      ExamId: string; SubjectId?: string; DivisionId?: string; StandardId?: string;
    }>({
      query: (params) => ({
        url: '/academics/exams/marks/grade-options',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.recordMarks, academicType.gradeScaling, academicType.exam],
    }),
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

    // Bulk Save – save/update student marks in bulk
    bulkSaveMarks: builder.mutation({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/marks/bulk-save`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.recordMarks],
    }),

    // Validate Marks – returns blockers and warnings
    validateMarks: builder.mutation({
      query: ({ examId, divisionId, subjectId }) => ({
        url: `/academics/exams/${examId}/marks/validate`,
        method: 'POST',
        params: { divisionId, subjectId },
      }),
    }),

    // Request Changes – transition to ChangesRequested state with reviewer note
    requestChanges: builder.mutation({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/marks/request-changes`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.recordMarks],
    }),

    // Unlock Marks – unlock published marks back to Draft with reason
    unlockMarks: builder.mutation({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/marks/unlock`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.recordMarks],
    }),

    // Get Exam Marks Audit Logs – history of marks updates
    getExamMarksAuditLogs: builder.query({
      query: ({ examId, subjectId, divisionId }) => ({
        url: `/academics/exams/${examId}/marks/audit`,
        method: 'GET',
        params: { subjectId, divisionId },
      }),
      providesTags: [academicType.recordMarks],
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
  useGetExamGradeOptionsQuery,
  useGetExamMarksQuery,
  useUpdateStudentMarksMutation,
  usePublishExamMarksMutation,
  useSaveDraftMarksMutation,
  useSubmitMarksForVerificationMutation,
  useVerifyMarksMutation,
  usePublishAndLockMarksMutation,
  useUpdateStudentAttendanceMutation,
  useGetExamMarksSummaryQuery,
  useBulkSaveMarksMutation,
  useValidateMarksMutation,
  useRequestChangesMutation,
  useUnlockMarksMutation,
  useGetExamMarksAuditLogsQuery,
} = recordMarksApi;

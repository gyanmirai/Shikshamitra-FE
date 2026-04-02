import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const recordMarksApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Exam Students Marks
    getExamMarks: builder.query({
      query: (params) => ({
        url: `exams/marks`,
        method: 'GET',
        params,
      }),
      providesTags: [academicType.recordMarks],
    }),

    // Assign / Update Student Marks
    updateStudentMarks: builder.mutation({
      query: ({ examId, studentId, body }) => ({
        url: `exams/${examId}/students/${studentId}/marks`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [academicType.recordMarks],
    }),

    // Publish Exam Marks (Division-wise)
    publishExamMarks: builder.mutation({
      query: ({ examId, divisionId }) => ({
        url: `exams/${examId}/publish-marks`,
        method: 'PATCH',
        params: { divisionId },
      }),
      invalidatesTags: [academicType.recordMarks],
    }),
  }),
  overrideExisting: false,
});

export const { useGetExamMarksQuery, useUpdateStudentMarksMutation, usePublishExamMarksMutation } =
  recordMarksApi;

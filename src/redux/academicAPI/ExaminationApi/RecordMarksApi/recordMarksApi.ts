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
  }),
  overrideExisting: false,
});

export const { useGetExamMarksQuery, useUpdateStudentMarksMutation, usePublishExamMarksMutation } =
  recordMarksApi;

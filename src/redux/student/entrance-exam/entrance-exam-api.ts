import { api } from 'src/redux/service';
import { entranceExamType } from 'src/redux/tagTypes';

export const EntranceExamApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEntranceExam: builder.query({
      query: ({ startDate, endDate, educationMediumId }) => ({
        url: `/student-enrollment/entrance-exam?StartDate=${startDate}&EndDate=${endDate}&EducationMediumId=${educationMediumId}`,
        method: 'GET',
      }),
      providesTags: [entranceExamType.entranceExam],
    }),
    addEntranceExam: builder.mutation({
      query: ({ body, studentId }) => ({
        url: `/student-enrollment/entrance-exam/${studentId}/schedule`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [entranceExamType.entranceExam],
    }),
    updateEntranceExam: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student-enrollment/entrance-exam/${id}/result`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [entranceExamType.entranceExam],
    }),
    deleteEntranceExam: builder.mutation({
      query: (id) => ({
        url: `/app/entrance-exam/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [entranceExamType.entranceExam],
    }),
    getEntranceExamByStudentId: builder.query({
      query: (id) => ({
        url: `/app/entrance-exam/by-student-enrollment-id/${id}`,
        method: 'GET',
      }),
      providesTags: [entranceExamType.entranceExam],
    }),
    getStudentForSlotByDate: builder.query({
      query: ({ slotId, examDate }) => ({
        url: `/app/entrance-exam/student-count-for-slot-by-date/${slotId}?examDate=${examDate}`,
        method: 'GET',
      }),
      providesTags: [entranceExamType.entranceExam],
    }),
  }),
});

export const {
  useAddEntranceExamMutation,
  useUpdateEntranceExamMutation,
  useDeleteEntranceExamMutation,
  useGetEntranceExamQuery,
  useGetEntranceExamByStudentIdQuery,
  useGetStudentForSlotByDateQuery,
  useLazyGetStudentForSlotByDateQuery,
} = EntranceExamApi;

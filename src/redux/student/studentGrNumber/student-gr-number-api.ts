import { api } from 'src/redux/service';
import { studentGrNumberType } from 'src/redux/tagTypes';

export const studentGrNumberApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentForGrNumber: builder.query({
      query: (divisionId) => ({
        url: `/students/records/${divisionId}/gr-projections`,
        method: 'GET',
      }),

      providesTags: [studentGrNumberType.studentGrNumber],
    }),

    updateStudentGrNumber: builder.mutation({
      query: ({ body }) => ({
        url: '/students/records/gr-numbers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentGrNumberType.studentGrNumber],
    }),
  }),
});

export const { useLazyGetStudentForGrNumberQuery, useUpdateStudentGrNumberMutation } =
  studentGrNumberApi;

import { api } from 'src/redux/service';
import { studentGrNumberType } from 'src/redux/tagTypes';

export type UpdateStudentGrNumber = {
  studentId: string;
  grNo: number | null;
  reason?: string;
};

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
      query: ({ body }: { body: UpdateStudentGrNumber[] }) => ({
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

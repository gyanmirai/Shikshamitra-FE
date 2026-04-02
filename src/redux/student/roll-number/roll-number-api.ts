import { api } from 'src/redux/service';
import { studentRollNumberType } from 'src/redux/tagTypes';

export const studentRollNumberApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRollNumberProjections: builder.query({
      query: ({ divisionId, arrangementType, arrangementBy }) => ({
        url: `/students/records/${divisionId}/roll-number-projections`,
        method: 'GET',
        params: {
          arrangementType,
          arrangementBy,
        },
      }),
      providesTags: [studentRollNumberType.studentRollNumber],
    }),
    updateStudentRollNumber: builder.mutation({
      query: ({ divisionId, body }) => ({
        url: `/students/records/${divisionId}/roll-numbers`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentRollNumberType.studentRollNumber],
    }),
  }),
});

export const { useUpdateStudentRollNumberMutation, useLazyGetRollNumberProjectionsQuery } =
  studentRollNumberApi;

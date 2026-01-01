import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const studentRollNumberApi = createApi({
  reducerPath: 'studentRollNumberApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['studentRollNumber'],
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
      providesTags: ['studentRollNumber'],
    }),
    updateStudentRollNumber: builder.mutation({
      query: ({ divisionId, body }) => ({
        url: `/students/records/${divisionId}/roll-numbers`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['studentRollNumber'],
    }),
  }),
});

export const { useUpdateStudentRollNumberMutation, useLazyGetRollNumberProjectionsQuery } =
  studentRollNumberApi;

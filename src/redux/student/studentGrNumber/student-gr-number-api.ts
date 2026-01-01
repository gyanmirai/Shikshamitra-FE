import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const studentGrNumberApi = createApi({
  reducerPath: 'studentGrNumberApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['studentGrNumber'],
  endpoints: (builder) => ({
    getStudentForGrNumber: builder.query({
      query: (divisionId) => ({
        url: `/students/records/${divisionId}/gr-projections`,
        method: 'GET',
      }),

      providesTags: ['studentGrNumber'],
    }),

    updateStudentGrNumber: builder.mutation({
      query: ({ body }) => ({
        url: '/students/records/gr-numbers',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['studentGrNumber'],
    }),
  }),
});

export const { useLazyGetStudentForGrNumberQuery, useUpdateStudentGrNumberMutation } =
  studentGrNumberApi;

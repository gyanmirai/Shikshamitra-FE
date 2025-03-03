import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const studentRollNumberApi = createApi({
  reducerPath: 'studentRollNumberApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['studentRollNumber'],
  endpoints: (builder) => ({
    updateStudentRollNumber: builder.mutation({
      query: ({ body }) => ({
        url: '/app/student/roll-numbers',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['studentRollNumber'],
    }),
  }),
});

export const { useUpdateStudentRollNumberMutation } = studentRollNumberApi;

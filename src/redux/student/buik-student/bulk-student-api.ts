import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const BulkStudentApi = createApi({
  reducerPath: 'BulkStudentApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Student-Document-Type'],
  endpoints: (builder) => ({
    addBulkStudent: builder.mutation({
      query: (data) => ({
        url: '/students/bulk-upload',
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data,
      }),
      invalidatesTags: ['Student-Document-Type'],
    }),
  }),
});

export const { useAddBulkStudentMutation } = BulkStudentApi;

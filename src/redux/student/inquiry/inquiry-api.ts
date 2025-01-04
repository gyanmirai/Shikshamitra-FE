import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const StudentInquiryApi = createApi({
  reducerPath: 'StudentInquiryApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Student-Document-Type'],
  endpoints: (builder) => ({
    getStudentInquiry: builder.query({
      query: (params) => ({
        url: '/app/student-inquiry',
        method: 'GET',
        params,
      }),
    }),
    addStudentInquiry: builder.mutation({
      query: (body) => ({
        url: '/app/student-inquiry',
        method: 'POST',
        data: body,
      }),
    }),
    updateStudentInquiry: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-inquiry/${id}`,
        method: 'PUT',
        data: body,
      }),
    }),
    deleteStudentInquiry: builder.mutation({
      query: (id) => ({
        url: `/app/student-inquiry/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useAddStudentInquiryMutation,
  useDeleteStudentInquiryMutation,
  useGetStudentInquiryQuery,
  useUpdateStudentInquiryMutation,
} = StudentInquiryApi;

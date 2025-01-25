import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const StudentInquiryApi = createApi({
  reducerPath: 'StudentInquiryApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Student-Inquiry'],
  endpoints: (builder) => ({
    getStudentInquiry: builder.query({
      query: (params) => ({
        url: '/app/student-enrollment/student-inquiry',
        method: 'GET',
        params,
      }),
      providesTags: ['Student-Inquiry'],
    }),
    addStudentInquiry: builder.mutation({
      query: (body) => ({
        url: '/app/student-enrollment/student-inquiry',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Student-Inquiry'],
    }),
    updateStudentInquiry: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-enrollment/student-inquiry/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Inquiry'],
    }),

    deleteStudentInquiry: builder.mutation({
      query: (id) => ({
        url: `/app/student-enrollment/student-inquiry/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student-Inquiry'],
    }),
  }),
});

export const {
  useAddStudentInquiryMutation,
  useDeleteStudentInquiryMutation,
  useGetStudentInquiryQuery,
  useUpdateStudentInquiryMutation,
} = StudentInquiryApi;

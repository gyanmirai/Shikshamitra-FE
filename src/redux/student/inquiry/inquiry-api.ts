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
      query: ({ academicMediumId }) => ({
        url: `/academic-mediums/${academicMediumId}/inquiries`,
        method: 'GET',
      }),
      providesTags: ['Student-Inquiry'],
    }),
    addStudentInquiry: builder.mutation({
      query: (body) => ({
        url: '/inquiries',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Student-Inquiry'],
    }),
    getStudentInquiryById: builder.query({
      query: ({ studentId }) => ({
        url: `/inquiries/${studentId}`,
        method: 'GET',
      }),
      providesTags: ['Student-Inquiry'],
    }),
    updateStudentInquiry: builder.mutation({
      query: ({ id, body }) => ({
        url: `/inquiries/${id}`,
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

    registrationFormDetails: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/student-enrollment/registration/${studentId}/forms`,
        method: 'POST',
        data: body,
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
  useRegistrationFormDetailsMutation,
  useGetStudentInquiryByIdQuery,
} = StudentInquiryApi;

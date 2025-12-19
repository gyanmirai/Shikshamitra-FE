import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const inquiryPreferenceApi = createApi({
  reducerPath: 'inquiryPreferenceApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Student-Document-Type'],
  endpoints: (builder) => ({
    getInquiryPreference: builder.query({
      query: ({ academicYearId }) => ({
        url: `/student-enrollment/${academicYearId}/settings/inquiry-preferences`,
        method: 'GET',
      }),
      providesTags: ['Student-Document-Type'],
    }),
    addInquiryPreference: builder.mutation({
      query: ({ academicYearId, data }) => ({
        url: `/student-enrollment/${academicYearId}/settings/inquiry-preferences`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Student-Document-Type'],
    }),
    updateInquiryPreference: builder.mutation({
      query: ({ id, body }) => ({
        url: `/student-enrollment/settings/inquiry-preferences/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Document-Type'],
    }),
    deleteInquiryPreference: builder.mutation({
      query: (id) => ({
        url: `/student-enrollment/settings/inquiry-preferences/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student-Document-Type'],
    }),
  }),
});

export const {
  useAddInquiryPreferenceMutation,
  useUpdateInquiryPreferenceMutation,
  useDeleteInquiryPreferenceMutation,
  useGetInquiryPreferenceQuery,
} = inquiryPreferenceApi;

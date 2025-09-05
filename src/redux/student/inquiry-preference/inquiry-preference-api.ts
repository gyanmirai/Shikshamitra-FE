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
      query: () => ({
        url: '/app/inquiry-preference',
        method: 'GET',
      }),
      providesTags: ['Student-Document-Type'],
    }),
    addInquiryPreference: builder.mutation({
      query: (data) => ({
        url: '/app/inquiry-preference',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Student-Document-Type'],
    }),
    updateInquiryPreference: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/inquiry-preference/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Document-Type'],
    }),
    deleteInquiryPreference: builder.mutation({
      query: (id) => ({
        url: `/app/inquiry-preference/${id}`,
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

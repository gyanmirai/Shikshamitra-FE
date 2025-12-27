import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const FollowUpApi = createApi({
  reducerPath: 'FollowUpApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Follow-Up'],
  endpoints: (builder) => ({
    getFollowUp: builder.query({
      query: (studentId) => ({
        url: `/student/enrollment/${studentId}/notes`,
        method: 'GET',
      }),
      providesTags: ['Follow-Up'],
    }),
    getAllFollowUp: builder.query({
      query: () => ({
        url: `/student-enrollment/follow-ups`,
        method: 'GET',
      }),
      providesTags: ['Follow-Up'],
    }),
    addFollowUp: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/student/enrollment/${studentId}/notes`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Follow-Up'],
    }),
  }),
});

export const { useGetFollowUpQuery, useAddFollowUpMutation, useGetAllFollowUpQuery } = FollowUpApi;

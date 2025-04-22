import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const StudentLeaveApi = createApi({
  reducerPath: 'StudentLeaveApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Student-Leave'],
  endpoints: (builder) => ({
    getStudentLeave: builder.query({
      query: () => ({
        url: `/app/student-leave`,
        method: 'GET',
      }),
      providesTags: ['Student-Leave'],
    }),
    addStudentLeave: builder.mutation({
      query: (data) => ({
        url: `/app/student-leave`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Student-Leave'],
    }),
    changeLeaveStatus: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-leave/${id}/leave-request-status`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Leave'],
    }),
  }),
});

export const { useGetStudentLeaveQuery, useAddStudentLeaveMutation } = StudentLeaveApi;

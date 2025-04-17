import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const studentGroupApi = createApi({
  reducerPath: 'studentGroupApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['studentGroup'],
  endpoints: (builder) => ({
    getStudentGroup: builder.query({
      query: ({ SkipCount, MaxResultCount }) => {
        let query = '';
        query += `?SkipCount=${SkipCount || 0}`;
        if (+MaxResultCount > 0) query += `${query ? '&' : '?'}MaxResultCount=${MaxResultCount}`;

        return {
          url: `/app/student-group${query}`,
          method: 'GET',
        };
      },
      providesTags: ['studentGroup'],
    }),
    addStudentGroup: builder.mutation({
      query: (body) => ({
        url: `/app/student-group`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['studentGroup'],
    }),
    updateStudentGroup: builder.mutation({
      query: ({ body, id }) => ({
        url: `/app/student-group/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['studentGroup'],
    }),
    deleteStudentGroup: builder.mutation({
      query: (id) => ({
        url: `/app/student-group/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['studentGroup'],
    }),
  }),
});

export const {
  useAddStudentGroupMutation,
  useDeleteStudentGroupMutation,
  useGetStudentGroupQuery,
  useUpdateStudentGroupMutation,
} = studentGroupApi;

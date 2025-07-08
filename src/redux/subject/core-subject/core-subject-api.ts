import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const CoreSubjectApi = createApi({
  reducerPath: 'coreSubjectApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Subject'],
  endpoints: (builder) => ({
    getSubjects: builder.query({
      query: () => ({ url: '/academic-mediums/{academicMediumId}/subjects' }),
      providesTags: ['Subject'],
    }),
    addSubject: builder.mutation({
      query: (body) => ({
        url: '/subject/',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Subject'],
    }),
    updateSubject: builder.mutation({
      query: ({ id, body }) => ({
        url: `/subject/${id}`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Subject'],
    }),
    deleteSubject: builder.mutation({
      query: ({ id }) => ({
        url: `/subject/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subject'],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useAddSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = CoreSubjectApi;

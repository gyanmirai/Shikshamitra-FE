import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const StudentDocumentTypeApi = createApi({
  reducerPath: 'StudentDocumentTypeApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Student-Document-Type'],
  endpoints: (builder) => ({
    getStudentDocumentType: builder.query({
      query: () => ({
        url: '/app/student-document-setting',
        method: 'GET',
      }),
      providesTags: ['Student-Document-Type'],
    }),
    addStudentDocumentType: builder.mutation({
      query: (data) => ({
        url: '/app/student-document-setting',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Student-Document-Type'],
    }),
    updateStudentDocumentType: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/student-document-setting/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Document-Type'],
    }),
    deleteStudentDocumentType: builder.mutation({
      query: (id) => ({
        url: `/app/student-document-setting/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student-Document-Type'],
    }),
  }),
});

export const {
  useAddStudentDocumentTypeMutation,
  useUpdateStudentDocumentTypeMutation,
  useDeleteStudentDocumentTypeMutation,
  useGetStudentDocumentTypeQuery,
} = StudentDocumentTypeApi;

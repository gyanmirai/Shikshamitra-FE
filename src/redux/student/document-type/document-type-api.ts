import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const StudentDocumentTypeApi = createApi({
  reducerPath: 'StudentDocumentTypeApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/tenant-settings`,
  }),
  tagTypes: ['Student-Document-Type'],
  endpoints: (builder) => ({
    getStudentDocumentType: builder.query({
      query: ({ sorting, skipCount, maxResultCount }) => {
        let query = '?';
        if (sorting) {
          query += `&Sorting=${sorting}`;
        }
        if (skipCount) {
          query += `&SkipCount=${skipCount}`;
        }
        if (maxResultCount) {
          query += `&MaxResultCount=${maxResultCount}`;
        }
        query = query.replace('?&', '?');

        return {
          url: `/document-types${query}`,
          method: 'GET',
        };
      },
      providesTags: ['Student-Document-Type'],
    }),
    addStudentDocumentType: builder.mutation({
      query: (data) => ({
        url: '/document-types',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Student-Document-Type'],
    }),
    updateStudentDocumentType: builder.mutation({
      query: ({ id, body }) => ({
        url: `/document-types/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Student-Document-Type'],
    }),
    deleteStudentDocumentType: builder.mutation({
      query: (id) => ({
        url: `/document-types/${id}`,
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

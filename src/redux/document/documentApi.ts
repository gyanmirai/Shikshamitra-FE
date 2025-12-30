import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const documentApi = createApi({
  reducerPath: 'documentApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Document'],
  endpoints: (builder) => ({
    getDocuments: builder.query({
      query: () => ({ url: '/employees/documents' }),
      providesTags: ['Document'],
    }),
    addDocument: builder.mutation({
      query: (body) => ({
        url: '/employees/documents',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Document'],
    }),
    updateDocument: builder.mutation({
      query: ({ id, body }) => ({
        url: `/employees/documents/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Document'],
    }),
    deleteDocument: builder.mutation({
      query: (id) => ({
        url: `/employees/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Document'],
    }),
  }),
});

export const {
  useAddDocumentMutation,
  useDeleteDocumentMutation,
  useGetDocumentsQuery,
  useUpdateDocumentMutation,
} = documentApi;

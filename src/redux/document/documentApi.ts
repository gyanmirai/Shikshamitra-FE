import { api } from 'src/redux/service';
import { documentType } from 'src/redux/tagTypes';

export const documentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query({
      query: () => ({ url: '/employees/documents' }),
      providesTags: [documentType.document],
    }),
    addDocument: builder.mutation({
      query: (body) => ({
        url: '/employees/documents',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [documentType.document],
    }),
    updateDocument: builder.mutation({
      query: ({ id, body }) => ({
        url: `/employees/documents/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [documentType.document],
    }),
    deleteDocument: builder.mutation({
      query: (id) => ({
        url: `/employees/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [documentType.document],
    }),
  }),
});

export const {
  useAddDocumentMutation,
  useDeleteDocumentMutation,
  useGetDocumentsQuery,
  useUpdateDocumentMutation,
} = documentApi;

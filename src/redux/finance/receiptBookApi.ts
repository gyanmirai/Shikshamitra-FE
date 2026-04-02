import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';

export const receiptBookApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getReceiptBooks: builder.query({
      query: (params) => ({
        url: `/receipt-books`,
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.receiptBook],
    }),
    addReceiptBook: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: `/receipt-books`,
        method: 'POST',
        body,
        params: {
          academicYearId,
        },
      }),
      invalidatesTags: [financeModuleType.receiptBook],
    }),
    updateReceiptBook: builder.mutation({
      query: ({ id, body }) => ({
        url: `/receipt-books/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.receiptBook],
    }),
    deleteReceiptBook: builder.mutation({
      query: ({ id }) => ({
        url: `/receipt-books/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.receiptBook],
    }),
    patchReceiptBook: builder.mutation({
      query: ({ receiptBookId, body }) => ({
        url: `/receipt-books/${receiptBookId}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [financeModuleType.receiptBook],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetReceiptBooksQuery,
  useAddReceiptBookMutation,
  useUpdateReceiptBookMutation,
  useDeleteReceiptBookMutation,
  usePatchReceiptBookMutation,
} = receiptBookApi;

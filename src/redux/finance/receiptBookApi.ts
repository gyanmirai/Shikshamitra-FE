import { financeModuleApi } from './financeModuleApi';

export const receiptBookApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getReceiptBooks: builder.query({
      query: (academicYearId: string) => ({
        url: `/v1/finance/receipt-books?academicYearId=${academicYearId}`,
        method: 'GET',
      }),
      providesTags: ['ReceiptBook'],
    }),
    addReceiptBook: builder.mutation({
      query: (body) => ({
        url: `/v1/finance/receipt-books`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ReceiptBook'],
    }),
    updateReceiptBook: builder.mutation({
      query: ({ receiptBookId, body }) => ({
        url: `/v1/finance/receipt-books/${receiptBookId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ReceiptBook'],
    }),
    deleteReceiptBook: builder.mutation({
      query: (receiptBookId: string) => ({
        url: `/v1/finance/receipt-books/${receiptBookId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ReceiptBook'],
    }),
    patchReceiptBook: builder.mutation({
      query: ({ receiptBookId, body }) => ({
        url: `/v1/finance/receipt-books/${receiptBookId}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['ReceiptBook'],
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

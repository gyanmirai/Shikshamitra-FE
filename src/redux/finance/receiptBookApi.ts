import { financeModuleApi } from './financeModuleApi';

export const receiptBookApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getReceiptBooks: builder.query({
      query: (params) => ({
        url: `/receipt-books`,
        method: 'GET',
        params,
      }),
      providesTags: ['ReceiptBook'],
    }),
    addReceiptBook: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: `/receipt-books`,
        method: 'POST',
        data: body,
        params: {
          academicYearId,
        },
      }),
      invalidatesTags: ['ReceiptBook'],
    }),
    updateReceiptBook: builder.mutation({
      query: ({ id, body }) => ({
        url: `/receipt-books/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['ReceiptBook'],
    }),
    deleteReceiptBook: builder.mutation({
      query: ({ id }) => ({
        url: `/receipt-books/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ReceiptBook'],
    }),
    patchReceiptBook: builder.mutation({
      query: ({ receiptBookId, body }) => ({
        url: `/receipt-books/${receiptBookId}/status`,
        method: 'PATCH',
        data: body,
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

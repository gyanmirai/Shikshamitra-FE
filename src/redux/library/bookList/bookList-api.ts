import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from '../libraryModuleApi';

export const booksApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBooks: builder.query({
      query: (params) => ({
        url: '/library/books',
        method: 'GET',
        params,
      }),
      providesTags: [libraryModuleType.books],
    }),

    addBook: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/library/books',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [libraryModuleType.books],
    }),

    updateBookCopyStatus: builder.mutation({
      query: ({ bookId, accessionNumber, body }) => ({
        url: `/library/books/${bookId}/copies/${accessionNumber}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [libraryModuleType.copies],
    }),

    getBookById: builder.query({
      query: ({ bookId }) => ({
        url: `/library/books/${bookId}`,
        method: 'GET',
      }),
      providesTags: (result, error, { bookId }) => [{ type: libraryModuleType.books, id: bookId }],
    }),

    updateBook: builder.mutation({
      query: ({ bookId, body }) => ({
        url: `/library/books/${bookId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { bookId }) => [
        libraryModuleType.books,
        { type: libraryModuleType.books, id: bookId },
      ],
    }),

    deleteBook: builder.mutation({
      query: ({ bookId }) => ({
        url: `/library/books/${bookId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [libraryModuleType.books],
    }),

    getReservationTableView: builder.query({
      query: ({ bookId, ...params }) => ({
        url: `/library/books/${bookId}/table-view`,
        method: 'GET',
        params,
      }),
    }),

    reserveBook: builder.mutation({
      query: ({ bookId, body }) => ({
        url: `/library/books/${bookId}/reservations`,
        method: 'POST',
        body,
      }),
    }),

    getBookReservations: builder.query({
      query: ({ bookId, ...params }) => ({
        url: `/library/books/${bookId}/reservations`,
        method: 'GET',
        params,
      }),
    }),

    getBookCopies: builder.query({
      query: ({ bookId, ...params }) => ({
        url: `/library/books/${bookId}/copies`,
        method: 'GET',
        params,
      }),
      providesTags: (result, error, { bookId }) => [{ type: libraryModuleType.copies, id: bookId }],
    }),

    updateBookCopies: builder.mutation({
      query: ({ bookId, academicYearId, body }) => ({
        url: `/library/books/${bookId}/copies`,
        method: 'PUT',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: (result, error, { bookId }) => [
        { type: libraryModuleType.copies, id: bookId },
      ],
    }),

    viewBookDetails: builder.query({
      query: ({ bookId }) => ({
        url: `/library/books/${bookId}`,
        method: 'GET',
      }),
    }),

    getBookCopyMembers: builder.query({
      query: ({ bookId, accessionNo, ...params }) => ({
        url: `/library/books/${bookId}/copies/${accessionNo}/members`,
        method: 'GET',
        params,
      }),
    }),
    updateBookStatus: builder.mutation({
      query: ({ bookId, academicYearId, body }) => ({
        url: `/library/books/${bookId}/status`,
        method: 'PUT',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: (result, error, { bookId }) => [
        libraryModuleType.books,
        { type: libraryModuleType.books, id: bookId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllBooksQuery,
  useAddBookMutation,
  useUpdateBookCopyStatusMutation,
  useGetBookByIdQuery,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useGetReservationTableViewQuery,
  useReserveBookMutation,
  useGetBookReservationsQuery,
  useGetBookCopiesQuery,
  useUpdateBookCopiesMutation,
  useViewBookDetailsQuery,
  useGetBookCopyMembersQuery,
  useUpdateBookStatusMutation,
} = booksApi;

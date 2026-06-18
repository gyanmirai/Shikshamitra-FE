import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from '../libraryModuleApi';
import {
  mapBookDto,
  mapBookCopyDto,
  mapBookDetailDto,
  mapBookReservationDto,
  toLibraryPaginatedList,
} from '../library-adapters';

export const booksApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBooks: builder.query({
      query: (params) => ({
        url: '/library/books',
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response, mapBookDto),
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
      transformResponse: mapBookDetailDto,
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
        url: `/library/books/${bookId}/reservations`,
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response, mapBookReservationDto),
      providesTags: (result, error, { bookId }) => [
        { type: libraryModuleType.bookReservation, id: bookId },
      ],
    }),

    reserveBook: builder.mutation({
      query: ({ bookId, body }) => ({
        url: `/library/books/${bookId}/reservations`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { bookId }) => [
        { type: libraryModuleType.bookReservation, id: bookId },
      ],
    }),

    deleteBookReservation: builder.mutation({
      query: ({ bookId, reservationId }) => ({
        url: `/library/books/${bookId}/reservations/${reservationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { bookId }) => [
        { type: libraryModuleType.bookReservation, id: bookId },
        libraryModuleType.books,
      ],
    }),

    getBookReservations: builder.query({
      query: ({ bookId, ...params }) => ({
        url: `/library/books/${bookId}/reservations`,
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response, mapBookReservationDto),
      providesTags: (result, error, { bookId }) => [
        { type: libraryModuleType.bookReservation, id: bookId },
      ],
    }),

    getBookCopies: builder.query({
      query: ({ bookId, ...params }) => ({
        url: `/library/books/${bookId}/copies`,
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response, mapBookCopyDto),
      providesTags: (result, error, { bookId }) => [{ type: libraryModuleType.copies, id: bookId }],
    }),

    updateBookCopies: builder.mutation({
      query: ({ bookId, body }) => ({
        url: `/library/books/${bookId}/copies`,
        method: 'PUT',
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
      transformResponse: mapBookDetailDto,
    }),

    getBookCopyMembers: builder.query({
      query: ({ accessionNo, ...params }) => ({
        url: `/library/issuedBook/accession/${accessionNo}/member`,
        method: 'GET',
        params,
      }),
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
  useDeleteBookReservationMutation,
  useGetBookReservationsQuery,
  useGetBookCopiesQuery,
  useUpdateBookCopiesMutation,
  useViewBookDetailsQuery,
  useGetBookCopyMembersQuery,
} = booksApi;

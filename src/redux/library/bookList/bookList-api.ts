import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from '../libraryModuleApi';
import {
  libraryInventoryMutationTags,
  libraryReservationMutationTags,
} from '../library-cache-tags';
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
      invalidatesTags: (_result, error) => (error ? [] : libraryInventoryMutationTags),
    }),

    updateBookCopyStatus: builder.mutation({
      query: ({ bookId, accessionNumber, body }) => ({
        url: `/library/books/${bookId}/copies/status`,
        method: 'PUT',
        params: { accessionNumber },
        body,
      }),
      invalidatesTags: (_result, error) => (error ? [] : libraryInventoryMutationTags),
    }),

    getBookById: builder.query({
      query: ({ bookId }) => ({
        url: `/library/books/${bookId}`,
        method: 'GET',
      }),
      transformResponse: mapBookDetailDto,
      providesTags: (_result, _error, { bookId }) => [
        { type: libraryModuleType.books, id: bookId },
        { type: libraryModuleType.copies, id: bookId },
      ],
    }),

    updateBook: builder.mutation({
      query: ({ bookId, body }) => ({
        url: `/library/books/${bookId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, error) => (error ? [] : libraryInventoryMutationTags),
    }),

    deleteBook: builder.mutation({
      query: ({ bookId }) => ({
        url: `/library/books/${bookId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, error) => (error ? [] : libraryInventoryMutationTags),
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
      invalidatesTags: (_result, error) => (error ? [] : libraryReservationMutationTags),
    }),

    deleteBookReservation: builder.mutation({
      query: ({ bookId, reservationId }) => ({
        url: `/library/books/${bookId}/reservations/${reservationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, error) => (error ? [] : libraryReservationMutationTags),
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
      invalidatesTags: (_result, error) => (error ? [] : libraryInventoryMutationTags),
    }),

    viewBookDetails: builder.query({
      query: ({ bookId }) => ({
        url: `/library/books/${bookId}`,
        method: 'GET',
      }),
      transformResponse: mapBookDetailDto,
      providesTags: (_result, _error, { bookId }) => [
        { type: libraryModuleType.books, id: bookId },
        { type: libraryModuleType.copies, id: bookId },
      ],
    }),

    getBookCopyMembers: builder.query({
      query: ({ accessionNo, ...params }) => ({
        url: '/library/issuedBook/member',
        method: 'GET',
        params: { ...params, accessionNo },
      }),
      providesTags: [
        libraryModuleType.bookIssue,
        libraryModuleType.bookReturn,
        libraryModuleType.members,
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
  useDeleteBookReservationMutation,
  useGetBookReservationsQuery,
  useGetBookCopiesQuery,
  useUpdateBookCopiesMutation,
  useViewBookDetailsQuery,
  useGetBookCopyMembersQuery,
} = booksApi;

import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from '../libraryModuleApi';
import { mapBookCopyDto, toLibraryPaginatedList } from '../library-adapters';

export const copiesApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCopies: builder.query({
      query: (arg: any = {}) => {
        const { bookId, ...params } = arg;
        return {
          url: bookId ? `/library/books/${bookId}/copies` : '/library/books',
          method: 'GET',
          params,
        };
      },
      transformResponse: (response, meta, arg: any) =>
        arg?.bookId ? toLibraryPaginatedList(response, mapBookCopyDto) : toLibraryPaginatedList([]),
      providesTags: [libraryModuleType.copies],
    }),

    getCopiesByBookId: builder.query({
      query: (bookId: string) => ({
        url: `/library/books/${bookId}/copies`,
        method: 'GET',
      }),
      transformResponse: (response) => toLibraryPaginatedList(response, mapBookCopyDto),
      providesTags: (result, error, bookId) => [{ type: libraryModuleType.copies, id: bookId }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllCopiesQuery, useGetCopiesByBookIdQuery, useLazyGetCopiesByBookIdQuery } =
  copiesApi;

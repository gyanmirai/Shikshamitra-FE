import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import { toLibraryPaginatedList } from './library-adapters';
import { libraryInventoryMutationTags } from './library-cache-tags';

import type { LibraryCopyEvent } from './copy-events-types';
import type { LibraryPaginatedList } from './library-adapters';
import type {
  CopyIdentity,
  LibraryCopyState,
  LibraryCopyMoveRequest,
  LibraryCopyMoveOptions,
  LibraryCopyWriteOffRequest,
} from './copy-lifecycle-types';

export const libraryCopyLifecycleApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryCopyState: builder.query<LibraryCopyState, { bookId: string; copyId: string }>({
      query: ({ bookId, copyId }) => `/library/books/${bookId}/copies/${copyId}/state`,
      providesTags: (_result, _error, { bookId }) => [
        { type: libraryModuleType.books, id: bookId },
        { type: libraryModuleType.copies, id: bookId },
      ],
    }),
    getLibraryCopyEvents: builder.query<
      LibraryPaginatedList<LibraryCopyEvent>,
      CopyIdentity & { page: number; pageSize: number }
    >({
      query: ({ bookId, copyId, ...params }) => ({
        url: `/library/books/${bookId}/copies/${copyId}/events`,
        params,
      }),
      transformResponse: (response: unknown) => toLibraryPaginatedList<LibraryCopyEvent>(response),
      providesTags: (_result, _error, { bookId }) => [
        { type: libraryModuleType.copies, id: bookId },
      ],
    }),
    getLibraryCopyMoveOptions: builder.query<
      LibraryCopyMoveOptions,
      CopyIdentity & { academicYearId?: string }
    >({
      query: ({ bookId, copyId, ...params }) => ({
        url: `/library/books/${bookId}/copies/${copyId}/move-options`,
        params,
      }),
      providesTags: (_result, _error, { bookId }) => [
        { type: libraryModuleType.copies, id: bookId },
      ],
    }),
    moveLibraryCopy: builder.mutation<
      LibraryCopyState,
      CopyIdentity & { body: LibraryCopyMoveRequest }
    >({
      query: ({ bookId, copyId, body }) => ({
        url: `/library/books/${bookId}/copies/${copyId}/move`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, error) => (error ? [] : libraryInventoryMutationTags),
    }),
    writeOffLibraryCopy: builder.mutation<
      LibraryCopyState,
      CopyIdentity & { body: LibraryCopyWriteOffRequest }
    >({
      query: ({ bookId, copyId, body }) => ({
        url: `/library/books/${bookId}/copies/${copyId}/write-off`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, error) => (error ? [] : libraryInventoryMutationTags),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLibraryCopyStateQuery,
  useLazyGetLibraryCopyStateQuery,
  useGetLibraryCopyEventsQuery,
  useLazyGetLibraryCopyMoveOptionsQuery,
  useMoveLibraryCopyMutation,
  useWriteOffLibraryCopyMutation,
} = libraryCopyLifecycleApi;

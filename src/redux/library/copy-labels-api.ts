import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import { mapLibraryCopyLabelBatchDto } from './library-adapters';

export const libraryCopyLabelsApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookCopyLabels: builder.query({
      query: ({ bookId }) => ({
        url: `/library/books/${bookId}/copy-labels`,
        method: 'GET',
      }),
      transformResponse: mapLibraryCopyLabelBatchDto,
      providesTags: (result, error, { bookId }) => [
        { type: libraryModuleType.copyLabels, id: bookId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetBookCopyLabelsQuery } = libraryCopyLabelsApi;

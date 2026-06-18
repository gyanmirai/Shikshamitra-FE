import { bookCategoryOptionsType } from 'src/redux/tagTypes';
import { toLibraryPaginatedList } from 'src/redux/library/library-adapters';

import { api } from '../service';

export const bookCategoryOptionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBookCategoryOptions: builder.query({
      query: (params) => ({
        url: '/library/books',
        method: 'GET',
        params,
      }),
      transformResponse: (response) =>
        toLibraryPaginatedList(response, (book: any) => ({
          id: book.id,
          label: book.title,
          value: book.title,
          categoryName: book.categoryName || book.category || book.categoryId || '',
          quantity: book.availableBook ?? book.availableCopies ?? book.numberOfCopies ?? 0,
          accessionNumberOptions: [],
          editions: [{ id: book.edition, label: book.edition, value: book.edition }],
        })),
      providesTags: [bookCategoryOptionsType.bookCategoryOptions],
    }),
  }),
});

export const { useGetBookCategoryOptionsQuery } = bookCategoryOptionsApi;

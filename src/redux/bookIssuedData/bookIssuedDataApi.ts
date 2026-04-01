import { bookIssuedType } from 'src/redux/tagTypes';

import { api } from '../service';

const isDev = process.env.NODE_ENV === 'development';

export const bookIssuedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getIssuedBooks: builder.query({
      query: () => ({
        url: '/bookIssuedData',
        method: 'GET',
      }),
      providesTags: [bookIssuedType.bookIssued],
    }),
  }),
});

export const { useGetIssuedBooksQuery } = bookIssuedApi;

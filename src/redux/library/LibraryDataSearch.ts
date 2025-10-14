import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const openLibraryApi = createApi({
  reducerPath: 'openLibraryApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://openlibrary.org' }),
  endpoints: (builder) => ({
    searchBooks: builder.query({
      // The `q` param will be passed when calling the hook
      query: (q: string) => `/search.json?q=${encodeURIComponent(q)}`,
    }),
  }),
});

export const { useSearchBooksQuery } = openLibraryApi;

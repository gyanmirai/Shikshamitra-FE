import { libraryModuleApi } from '../libraryModuleApi';

export const booksApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBooks: builder.query({
      query: () => ({
        url: '/books', // endpoint for fetching book list
        method: 'GET',
      }),
      providesTags: ['Books'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllBooksQuery } = booksApi;

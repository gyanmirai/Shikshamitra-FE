import { libraryModuleApi } from '../libraryModuleApi';

export const copiesApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCopies: builder.query({
      query: () => ({
        url: '/copies',
        method: 'GET',
      }),
      providesTags: ['Copies'],
    }),

    getCopiesByBookId: builder.query({
      query: (bookId: string) => ({
        url: `/copies?bookId=${bookId}`, // endpoint with query param
        method: 'GET',
      }),
      providesTags: (result, error, bookId) => [{ type: 'Copies', id: bookId }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllCopiesQuery, useGetCopiesByBookIdQuery, useLazyGetCopiesByBookIdQuery } =
  copiesApi;

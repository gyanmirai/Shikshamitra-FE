import { libraryModuleApi } from '../libraryModuleApi';

export const copiesApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
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

export const { useGetCopiesByBookIdQuery, useLazyGetCopiesByBookIdQuery } = copiesApi;

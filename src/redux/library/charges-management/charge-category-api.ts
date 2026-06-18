import { api } from 'src/redux/service';
import { libraryChargeCategoryOptionsType } from 'src/redux/tagTypes';
import { mapChargeCategoryDto, toLibraryPaginatedList } from 'src/redux/library/library-adapters';

export const libraryChargeCategoryOptionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryChargeCategoryOptions: builder.query({
      query: (params) => ({
        url: '/library/charge-categories',
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response, mapChargeCategoryDto),
      providesTags: [libraryChargeCategoryOptionsType.libraryChargeCategoryOptions],
    }),
  }),
});

export const { useGetLibraryChargeCategoryOptionsQuery } = libraryChargeCategoryOptionsApi;

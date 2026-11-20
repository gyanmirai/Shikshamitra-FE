import { libraryModuleApi } from './libraryModuleApi';
import { libraryModuleType, librarySettingsType } from '../tagTypes';

import type {
  CatalogueConfiguration,
  CatalogueConfigurationRequest,
} from './catalogue-configuration-types';

export const catalogueConfigurationApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getCatalogueConfiguration: builder.query<CatalogueConfiguration, void>({
      query: () => ({ url: '/library/catalogue/configuration' }),
      providesTags: [librarySettingsType.librarySettings],
    }),
    updateCatalogueConfiguration: builder.mutation<
      CatalogueConfiguration,
      CatalogueConfigurationRequest
    >({
      query: (body) => ({ url: '/library/catalogue/configuration', method: 'PUT', body }),
      invalidatesTags: [librarySettingsType.librarySettings, libraryModuleType.books],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCatalogueConfigurationQuery,
  useLazyGetCatalogueConfigurationQuery,
  useUpdateCatalogueConfigurationMutation,
} = catalogueConfigurationApi;

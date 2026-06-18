import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import { mapLibraryDashboardOverviewDto } from './library-adapters';

export const libraryDashboardApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryDashboardOverview: builder.query({
      query: (params) => ({
        url: '/library/dashboard/overview',
        method: 'GET',
        params,
      }),
      transformResponse: mapLibraryDashboardOverviewDto,
      providesTags: [libraryModuleType.dashboard],
    }),
  }),
  overrideExisting: false,
});

export const { useGetLibraryDashboardOverviewQuery } = libraryDashboardApi;

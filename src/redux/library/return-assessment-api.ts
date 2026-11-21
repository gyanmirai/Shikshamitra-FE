import { librarySettingsType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import { toLibraryPaginatedList } from './library-adapters';

import type { LibraryPaginatedList } from './library-adapters';

export type LibraryReturnAssessmentCategory = {
  id: string;
  academicYearId: string;
  name: string;
  amount: number;
  isFixed: boolean;
};
export const returnAssessmentApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getReturnAssessmentCategories: builder.query<
      LibraryPaginatedList<LibraryReturnAssessmentCategory>,
      {
        academicYearId: string;
        page: number;
        pageSize: number;
        search: string;
      }
    >({
      query: (params) => ({ url: '/library/circulation/lookups/assessment-categories', params }),
      transformResponse: (response: unknown) =>
        toLibraryPaginatedList<LibraryReturnAssessmentCategory>(response),
      providesTags: [librarySettingsType.librarySettings],
    }),
  }),
  overrideExisting: false,
});
export const { useLazyGetReturnAssessmentCategoriesQuery } = returnAssessmentApi;

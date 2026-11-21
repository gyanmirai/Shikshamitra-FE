import { librarySettingsType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';

export type LibraryRolloverYear = { id: string; name: string; startsOn: string; endsOn: string };
export type LibraryRolloverInput = {
  sourceAcademicYearId: string;
  targetAcademicYearId: string;
  schoolDate: string | null;
};
export type LibraryRolloverPolicy = {
  id: string;
  name: string;
  version: number;
  role: 0 | 1;
  dueDateMode: 0 | 1;
  effectiveFrom: string;
  effectiveTo: string | null;
  originAcademicYearId: string;
  hasSelectors: boolean;
};
export type LibraryRolloverPreview = {
  sourceYear: LibraryRolloverYear;
  targetYear: LibraryRolloverYear;
  schoolDate: string;
  policyScope: 'School' | 'Assigned';
  calendar: {
    confirmedTimeZoneId: string | null;
    openWeekdays: number | null;
    canPublishAutomatic: boolean;
    hoursError: string | null;
  };
  effectivePolicies: LibraryRolloverPolicy[];
  draftPolicies: LibraryRolloverPolicy[];
  loans: {
    scope: 'School' | 'Assigned' | 'Restricted';
    sourceYearOpenCount: number | null;
    unassignedYearOpenCount: number | null;
  };
};

export const { useGetLibraryRolloverYearsQuery, usePreviewLibraryRolloverMutation } =
  libraryModuleApi.injectEndpoints({
    endpoints: (builder) => ({
      getLibraryRolloverYears: builder.query<LibraryRolloverYear[], void>({
        query: () => '/library/policies/rollover/options',
        providesTags: [librarySettingsType.librarySettings],
      }),
      previewLibraryRollover: builder.mutation<LibraryRolloverPreview, LibraryRolloverInput>({
        query: (body) => ({ url: '/library/policies/rollover/preview', method: 'POST', body }),
      }),
    }),
  });

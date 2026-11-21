import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import { toLibraryPaginatedList } from './library-adapters';
import { libraryCalendarReadTag } from './operational-settings-tags';

import type { LibraryPaginatedList } from './library-adapters';
import type { LibraryMemberStatistics } from './member-statistics-types';

export type LibraryCirculationMember = {
  id: string;
  memberIdentifier?: string | null;
  memberName: string;
  role: number;
  academicYearId?: string | null;
  classDivision?: string | null;
  isEligibleForIssue: boolean;
  ineligibilityReason?: string | null;
  statistics: LibraryMemberStatistics;
};

export const libraryCirculationMembersApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    resolveCirculationMember: builder.query<LibraryCirculationMember, { identifier: string }>({
      query: (params) => ({ url: '/library/circulation/members/resolve', params }),
      providesTags: [libraryModuleType.members, libraryCalendarReadTag],
    }),
    searchCirculationMembers: builder.query<
      LibraryPaginatedList<LibraryCirculationMember>,
      { search: string; page: number; pageSize: number }
    >({
      query: (params) => ({ url: '/library/circulation/members', params }),
      transformResponse: (response: unknown) =>
        toLibraryPaginatedList<LibraryCirculationMember>(response),
      providesTags: [libraryModuleType.members, libraryCalendarReadTag],
    }),
  }),
  overrideExisting: false,
});

export const { useResolveCirculationMemberQuery, useLazySearchCirculationMembersQuery } =
  libraryCirculationMembersApi;

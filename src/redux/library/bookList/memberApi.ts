import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from '../libraryModuleApi';
import { mapLibraryMemberDto, toLibraryPaginatedList } from '../library-adapters';

export const membersApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllMembers: builder.query({
      query: (params) => ({
        url: '/library/members',
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response, mapLibraryMemberDto),
      providesTags: [libraryModuleType.members],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllMembersQuery, useLazyGetAllMembersQuery } = membersApi;

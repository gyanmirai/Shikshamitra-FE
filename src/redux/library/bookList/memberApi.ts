import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from '../libraryModuleApi';

export const membersApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllMembers: builder.query({
      query: () => ({
        url: '/libraryMemberManagementData', // endpoint for fetching member list
        method: 'GET',
      }),
      providesTags: [libraryModuleType.members],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAllMembersQuery, useLazyGetAllMembersQuery } = membersApi;

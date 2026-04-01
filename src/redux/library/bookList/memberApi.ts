import { libraryModuleApi } from '../libraryModuleApi';
import { libraryModuleType } from 'src/redux/tagTypes';


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

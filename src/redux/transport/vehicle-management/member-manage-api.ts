import { transportApi } from '../transportApi';

export const memberManageApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransportMembers: builder.query({
      query: () => ({
        url: '/memberData',
        method: 'GET',
      }),
      providesTags: ['Member'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetTransportMembersQuery } = memberManageApi;

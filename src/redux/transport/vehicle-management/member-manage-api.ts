import { transportType } from 'src/redux/tagTypes';

import { transportApi } from '../transportApi';

export const memberManageApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransportMembers: builder.query({
      query: () => ({
        url: '/transport/applications',
        method: 'GET',
      }),
      providesTags: [transportType.member],
    }),
    addTransportMember: builder.mutation({
      query: (body: any) => ({
        url: '/transport/applications',
        method: 'POST',
        body,
      }),
      invalidatesTags: [transportType.member],
    }),
  }),
  overrideExisting: false,
});

export const { useGetTransportMembersQuery, useAddTransportMemberMutation } = memberManageApi;

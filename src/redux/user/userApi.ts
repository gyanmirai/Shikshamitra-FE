import { api } from 'src/redux/service';

import type { UserDirectoryPage } from './types';
import type { IdentityListQuery } from '../identity-list';

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserDirectory: builder.query<UserDirectoryPage, IdentityListQuery>({
      query: (params) => ({ url: '/security/user-directory', params }),
    }),
    changePassword: builder.mutation({
      query: ({ data }) => ({
        url: `/account/my-profile/change-password`,
        method: 'POST',
        data,
      }),
    }),
    addUser: builder.mutation({
      query: (body) => ({
        url: `/identity/users`,
        method: 'POST',
        body,
      }),
    }),
    getUser: builder.query({
      query: (id) => ({ url: `/identity/users/${id}` }),
    }),
    getUsers: builder.query({
      query: () => ({ url: `/identity/users`, params: { maxResultCount: 1000 } }),
    }),
  }),
});

export const {
  useChangePasswordMutation,
  useAddUserMutation,
  useGetUsersQuery,
  useGetUserDirectoryQuery,
} = userApi;

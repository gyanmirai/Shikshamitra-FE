import { api } from 'src/redux/service';

import type { UserRecord, UserDirectoryPage } from './types';

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserDirectory: builder.query<UserDirectoryPage, void>({
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const items: UserRecord[] = [];
        let totalCount = 0;
        do {
          // eslint-disable-next-line no-await-in-loop -- Each offset depends on the preceding page size.
          const result = await baseQuery({
            url: '/security/user-directory',
            params: { skipCount: items.length, maxResultCount: 1000, sorting: 'userName,id' },
          });
          if (result.error) return { error: result.error };
          const page = result.data as UserDirectoryPage;
          if (
            !Array.isArray(page?.items) ||
            !Number.isFinite(page.totalCount) ||
            (page.items.length === 0 && items.length < page.totalCount)
          ) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: 'The user directory response is incomplete. Please retry.',
              },
            };
          }
          items.push(...page.items);
          ({ totalCount } = page);
        } while (items.length < totalCount);
        return { data: { items, totalCount } };
      },
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

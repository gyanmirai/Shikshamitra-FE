import { api } from 'src/redux/service';

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
      query: () => ({ url: `/identity/users` }),
    }),
  }),
});

export const { useChangePasswordMutation, useAddUserMutation, useGetUsersQuery } = userApi;

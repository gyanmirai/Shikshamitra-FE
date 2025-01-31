import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
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
        data: body,
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

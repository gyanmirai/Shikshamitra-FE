import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/httpService';

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
  }),
});

export const { useChangePasswordMutation, useAddUserMutation } = userApi;

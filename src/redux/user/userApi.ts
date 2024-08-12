import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api` }),
  endpoints: (builder) => ({
    changePassword: builder.mutation({
      query: ({ data, token }) => ({
        url: `/account/my-profile/change-password`,
        method: 'POST',
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    }),
  }),
});

export const { useChangePasswordMutation } = userApi;

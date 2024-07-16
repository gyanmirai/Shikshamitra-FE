import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (id) => `users/${id}`,
    }),
    updateUser: builder.mutation({
      query: (user) => ({
        url: `users/${user.id}`,
        method: 'PUT',
        body: user,
      }),
    }),
  }),
})

export const { useGetUserQuery, useUpdateUserMutation } = userApi
import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const roleApi = createApi({
  reducerPath: 'roleApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Role'],
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => ({ url: '/identity/roles/all' }),
      providesTags: ['Role'],
    }),
    addRole: builder.mutation({
      query: (body) => ({
        url: '/identity/roles',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Role'],
    }),
    updateRole: builder.mutation({
      query: ({ id, body }) => ({
        url: `/identity/roles/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Role'],
    }),
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/identity/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useAddRoleMutation,
  useDeleteRoleMutation,
  useUpdateRoleMutation,
} = roleApi;

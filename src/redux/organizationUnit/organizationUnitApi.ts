import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const organizationUnitApi = createApi({
  reducerPath: 'organizationUnitApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['OrganizationUnit'],
  endpoints: (builder) => ({
    getOrganizationUnits: builder.query({
      query: () => ({ url: '/organization-unit/tree' }),
      providesTags: ['OrganizationUnit'],
    }),
    addOrganizationUnit: builder.mutation({
      query: (body) => ({
        url: '/organization-unit/create',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['OrganizationUnit'],
    }),
    updateOrganizationUnit: builder.mutation({
      query: (body) => ({
        url: `/organization-unit/update`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['OrganizationUnit'],
    }),
    deleteOrganizationUnit: builder.mutation({
      query: (id) => ({
        url: `/organization-unit/delete`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OrganizationUnit'],
    }),
    addRoleToOrganizationUnit: builder.mutation({
      query: (body) => ({
        url: `/organization-unit/add-role-to-organization-unit`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['OrganizationUnit'],
    }),
    removeRoleFromOrganizationUnit: builder.mutation({
      query: (body) => ({
        url: `/organization-unit/remove-role-from-organization-unit`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['OrganizationUnit'],
    }),
    addUserToOrganizationUnit: builder.mutation({
      query: (body) => ({
        url: `/organization-unit/add-user-to-organization-unit`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['OrganizationUnit'],
    }),
    removeUserFromOrganizationUnit: builder.mutation({
      query: (body) => ({
        url: `/organization-unit/remove-user-from-organization-unit`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['OrganizationUnit'],
    }),
    getOrganizationUnitUser: builder.mutation({
      query: (body) => ({ url: `/organization-unit/getUsers`, method: 'POST', data: body }),
      invalidatesTags: ['OrganizationUnit'],
    }),
    getOrganizationUnitRole: builder.mutation({
      query: (body) => ({ url: `/organization-unit/getRoles`, method: 'POST', data: body }),
      invalidatesTags: ['OrganizationUnit'],
    }),
  }),
});

export const {
  useAddOrganizationUnitMutation,
  useDeleteOrganizationUnitMutation,
  useUpdateOrganizationUnitMutation,
  useGetOrganizationUnitsQuery,

  useAddRoleToOrganizationUnitMutation,
  useRemoveRoleFromOrganizationUnitMutation,
  useAddUserToOrganizationUnitMutation,
  useRemoveUserFromOrganizationUnitMutation,
  useGetOrganizationUnitUserMutation,
} = organizationUnitApi;

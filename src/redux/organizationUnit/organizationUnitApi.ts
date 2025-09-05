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
      query: () => ({ url: '/organization-units/tree' }),
      providesTags: ['OrganizationUnit'],
    }),
    addOrganizationUnit: builder.mutation({
      query: ({ title, parentId }) => ({
        url: `/organization-units/create?DisplayName=${title}${parentId ? `&ParentId=${parentId}` : ''}`,
        method: 'POST',
      }),
      invalidatesTags: ['OrganizationUnit'],
    }),
    updateOrganizationUnit: builder.mutation({
      query: ({ title, id }) => ({
        url: `/organization-units/update?DisplayName=${title}${id ? `&id=${id}` : ''}`,
        method: 'PUT',
      }),
      invalidatesTags: ['OrganizationUnit'],
    }),
    deleteOrganizationUnit: builder.mutation({
      query: (id) => ({
        url: `/organization-units/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OrganizationUnit'],
    }),
    addRoleToOrganizationUnit: builder.mutation({
      query: ({ roleId, organizationUnitId }) => {
        let roleIdString = '';
        roleId.forEach((role: any) => {
          roleIdString += `&RoleId=${role}`;
        });
        return {
          url: `/organization-units/roles/add?OrganizationUnitId=${organizationUnitId}${roleIdString}`,
          method: 'POST',
        };
      },
      invalidatesTags: ['OrganizationUnit'],
    }),
    removeRoleFromOrganizationUnit: builder.mutation({
      query: ({ roleId, organizationUnitId }) => ({
        url: `/organization-units/roles/remove?RoleId=${roleId}&OrganizationUnitId=${organizationUnitId}`,
        method: 'POST',
      }),
      invalidatesTags: ['OrganizationUnit'],
    }),
    addUserToOrganizationUnit: builder.mutation({
      query: ({ userId, organizationUnitId }) => {
        let userIdString = '';
        userId.forEach((user: any) => {
          userIdString += `&UserId=${user}`;
        });
        return {
          url: `/organization-units/users/add?OrganizationUnitId=${organizationUnitId}${userIdString}`,
          method: 'POST',
        };
      },
      invalidatesTags: ['OrganizationUnit'],
    }),
    removeUserFromOrganizationUnit: builder.mutation({
      query: ({ userId, organizationUnitId }) => ({
        url: `/organization-units/users/remove?UserId=${userId}&OrganizationUnitId=${organizationUnitId}`,
        method: 'POST',
      }),
      invalidatesTags: ['OrganizationUnit'],
    }),
    getOrganizationUnitUser: builder.query({
      query: (id) => ({
        url: `/organization-units/users?OrganizationUnitId=${id}`,
        method: 'GET',
      }),
      providesTags: ['OrganizationUnit'],
    }),
    getOrganizationUnitRole: builder.query({
      query: (id) => ({
        url: `/organization-units/roles?OrganizationUnitId=${id}`,
        method: 'GET',
      }),
      providesTags: ['OrganizationUnit'],
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
  useGetOrganizationUnitUserQuery,
  useGetOrganizationUnitRoleQuery,
} = organizationUnitApi;

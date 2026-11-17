import { api } from 'src/redux/service';
import { roleType } from 'src/redux/tagTypes';

import type { IdentityPage, IdentityListQuery } from '../identity-list';

export type IdentityRoleOption = {
  id: string;
  name: string;
  roleAudience?: string | null;
  employeeGroupAudience?: string | null;
  employeeOnboardingAssignable?: boolean | null;
  extraProperties?: {
    color?: string;
    roleAudience?: string | null;
    employeeGroupAudience?: string | null;
    employeeOnboardingAssignable?: boolean | null;
    EmployeeOnboardingAssignable?: boolean | null;
    [key: string]: unknown;
  };
};

type IdentityRoleListResponse = {
  items: IdentityRoleOption[];
};

export const roleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRolePage: builder.query<IdentityPage<IdentityRoleOption>, IdentityListQuery>({
      query: (params) => ({ url: '/identity/roles', params }),
      providesTags: [roleType.role],
    }),
    getRoles: builder.query<IdentityRoleListResponse, void>({
      query: () => ({ url: '/identity/roles/all' }),
      providesTags: [roleType.role],
    }),
    addRole: builder.mutation({
      query: (body) => ({
        url: '/identity/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: [roleType.role],
    }),
    updateRole: builder.mutation({
      query: ({ id, body }) => ({
        url: `/identity/roles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [roleType.role],
    }),
    deleteRole: builder.mutation<void, string>({
      query: (id) => ({
        url: `/identity/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [roleType.role],
    }),
  }),
});

export const {
  useGetRolePageQuery,
  useGetRolesQuery,
  useAddRoleMutation,
  useDeleteRoleMutation,
  useUpdateRoleMutation,
} = roleApi;

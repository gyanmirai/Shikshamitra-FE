import { api } from 'src/redux/service';
import { organizationUnitType } from 'src/redux/tagTypes';

export const organizationUnitApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationUnits: builder.query({
      query: () => ({ url: '/organization-units/tree' }),
      providesTags: [organizationUnitType.organizationUnit],
    }),
    addOrganizationUnit: builder.mutation({
      query: ({ title, parentId }) => ({
        url: `/organization-units/create?DisplayName=${title}${parentId ? `&ParentId=${parentId}` : ''}`,
        method: 'POST',
      }),
      invalidatesTags: [organizationUnitType.organizationUnit],
    }),
    updateOrganizationUnit: builder.mutation({
      query: ({ title, id }) => ({
        url: `/organization-units/update?DisplayName=${title}${id ? `&id=${id}` : ''}`,
        method: 'PUT',
      }),
      invalidatesTags: [organizationUnitType.organizationUnit],
    }),
    deleteOrganizationUnit: builder.mutation({
      query: (id) => ({
        url: `/organization-units/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [organizationUnitType.organizationUnit],
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
      invalidatesTags: [organizationUnitType.organizationUnit],
    }),
    removeRoleFromOrganizationUnit: builder.mutation({
      query: ({ roleId, organizationUnitId }) => ({
        url: `/organization-units/roles/remove?RoleId=${roleId}&OrganizationUnitId=${organizationUnitId}`,
        method: 'POST',
      }),
      invalidatesTags: [organizationUnitType.organizationUnit],
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
      invalidatesTags: [organizationUnitType.organizationUnit],
    }),
    removeUserFromOrganizationUnit: builder.mutation({
      query: ({ userId, organizationUnitId }) => ({
        url: `/organization-units/users/remove?UserId=${userId}&OrganizationUnitId=${organizationUnitId}`,
        method: 'POST',
      }),
      invalidatesTags: [organizationUnitType.organizationUnit],
    }),
    getOrganizationUnitUser: builder.query({
      query: (id) => ({
        url: `/organization-units/users?OrganizationUnitId=${id}`,
        method: 'GET',
      }),
      providesTags: [organizationUnitType.organizationUnit],
    }),
    getOrganizationUnitRole: builder.query({
      query: (id) => ({
        url: `/organization-units/roles?OrganizationUnitId=${id}`,
        method: 'GET',
      }),
      providesTags: [organizationUnitType.organizationUnit],
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

import { api } from 'src/redux/service';
import { roleType } from 'src/redux/tagTypes';

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
  useGetRolesQuery,
  useAddRoleMutation,
  useDeleteRoleMutation,
  useUpdateRoleMutation,
} = roleApi;

import { api } from 'src/redux/service';
import { roleType } from 'src/redux/tagTypes';

export const roleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => ({ url: '/identity/roles/all' }),
      providesTags: [roleType.role],
    }),
    addRole: builder.mutation({
      query: (body) => ({
        url: '/identity/roles',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [roleType.role],
    }),
    updateRole: builder.mutation({
      query: ({ id, body }) => ({
        url: `/identity/roles/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [roleType.role],
    }),
    deleteRole: builder.mutation({
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

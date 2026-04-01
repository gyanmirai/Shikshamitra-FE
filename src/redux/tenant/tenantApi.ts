import { api } from 'src/redux/service';
import { tenantType } from 'src/redux/tagTypes';

export const tenantApi = api.injectEndpoints({
  endpoints: (builder) => ({
    addTenant: builder.mutation({
      query: (body) => ({
        url: '/multi-tenancy/tenants',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [tenantType.tenant],
    }),
    getTenantById: builder.query({
      query: (id) => ({
        url: `/multi-tenancy/tenants/${id}`,
      }),
      providesTags: [tenantType.tenant],
    }),
    getAllTenants: builder.query({
      query: () => ({
        url: '/multi-tenancy/tenants',
      }),
      providesTags: [tenantType.tenant],
    }),
    updateTenant: builder.mutation({
      query: ({ id, body }) => ({
        url: `/multi-tenancy/tenants/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [tenantType.tenant],
    }),
  }),
});

export const {
  useAddTenantMutation,
  useGetTenantByIdQuery,
  useGetAllTenantsQuery,
  useUpdateTenantMutation,
} = tenantApi;

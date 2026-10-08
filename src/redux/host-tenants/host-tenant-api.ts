import { hostTenantType } from '../tagTypes';
import { hostTenantModuleApi } from './host-tenant-module-api';

import type {
  HostTenant,
  TenantPage,
  TenantListQuery,
  CreateTenantInput,
  UpdateTenantInput,
} from './types';

export const hostTenantApi = hostTenantModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getHostTenants: builder.query<TenantPage, TenantListQuery>({
      query: (params) => ({ url: '/host/tenants', params }),
      providesTags: [hostTenantType.tenants],
    }),
    getHostTenant: builder.query<HostTenant, string>({
      query: (id) => `/host/tenants/${id}`,
      providesTags: [hostTenantType.tenants],
    }),
    createHostTenant: builder.mutation<HostTenant, CreateTenantInput>({
      query: (body) => ({ url: '/host/tenants', method: 'POST', body }),
      invalidatesTags: (_result, error) => (error ? [] : [hostTenantType.tenants]),
    }),
    updateHostTenant: builder.mutation<HostTenant, { id: string; input: UpdateTenantInput }>({
      query: ({ id, input }) => ({ url: `/host/tenants/${id}`, method: 'PUT', body: input }),
      invalidatesTags: (_result, error) => (error ? [] : [hostTenantType.tenants]),
    }),
    changeHostTenantStatus: builder.mutation<
      HostTenant,
      {
        id: string;
        isActive: boolean;
        reason?: string;
        concurrencyStamp: string;
      }
    >({
      query: ({ id, ...body }) => ({ url: `/host/tenants/${id}/status`, method: 'PUT', body }),
      invalidatesTags: (_result, error) => (error ? [] : [hostTenantType.tenants]),
    }),
  }),
});
export const {
  useGetHostTenantsQuery,
  useGetHostTenantQuery,
  useLazyGetHostTenantQuery,
  useCreateHostTenantMutation,
  useUpdateHostTenantMutation,
  useChangeHostTenantStatusMutation,
} = hostTenantApi;

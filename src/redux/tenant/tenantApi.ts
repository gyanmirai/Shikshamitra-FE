import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const tenantApi = createApi({
  reducerPath: 'tenantApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Tenant'],
  endpoints: (builder) => ({
    addTenant: builder.mutation({
      query: (body) => ({
        url: '/multi-tenancy/tenants',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Tenant'],
    }),
  }),
});

export const { useAddTenantMutation } = tenantApi;

import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const permissionApi = createApi({
  reducerPath: 'permissionApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  endpoints: (builder) => ({
    getPermissions: builder.query<any, { providerName: string; providerKey: string }>({
      query: ({ providerName, providerKey }) => ({
        url: `/permission-management/permissions?providerName=${providerName}&providerKey=${providerKey}`,
      }),
    }),
    updatePermission: builder.mutation<any, any>({
      query: ({ providerName, providerKey, data }) => ({
        url: `/permission-management/permissions?providerName=${providerName}&providerKey=${providerKey}`,
        method: 'PUT',
        data,
      }),
    }),
  }),
});

export const { useGetPermissionsQuery, useLazyGetPermissionsQuery, useUpdatePermissionMutation } =
  permissionApi;

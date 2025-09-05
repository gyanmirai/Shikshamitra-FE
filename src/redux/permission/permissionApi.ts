import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const permissionApi = createApi({
  reducerPath: 'permissionApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  endpoints: (builder) => ({
    getPermissions: builder.query<any, void>({
      query: (role) => ({
        url: `/permission-management/permissions?providerName=R&providerKey=${role}`,
      }),
    }),
    updatePermission: builder.mutation<any, any>({
      query: ({ role, data }) => ({
        url: `/permission-management/permissions?providerName=R&providerKey=${role}`,
        method: 'PUT',
        data,
      }),
    }),
  }),
});

export const { useGetPermissionsQuery, useLazyGetPermissionsQuery, useUpdatePermissionMutation } =
  permissionApi;

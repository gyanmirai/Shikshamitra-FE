import { api } from 'src/redux/service';

export const permissionApi = api.injectEndpoints({
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

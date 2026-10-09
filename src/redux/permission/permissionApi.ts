import type { PermissionCatalogue, PermissionOverrideState } from 'src/screens/security/role/permission-catalogue';

import { api } from 'src/redux/service';
import { permissionType } from 'src/redux/tagTypes';

type PermissionProvider = {
  providerName: string;
  providerKey: string;
};

type UpdatePermissionRequest = PermissionProvider & {
  data: {
    permissions: { name: string; isGranted: boolean }[];
  };
};

const permissionCacheId = ({ providerName, providerKey }: PermissionProvider) =>
  `${providerName}:${providerKey}`;

export const permissionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserPermissionOverrides: builder.query<PermissionCatalogue, PermissionProvider>({
      query: ({ providerKey }) => ({
        url: `/shikshamitra-permissions/users/${encodeURIComponent(providerKey)}/permissions`,
      }),
      providesTags: (_result, _error, request) => [
        { type: permissionType.permission, id: permissionCacheId(request) },
      ],
    }),
    updateUserPermissionOverrides: builder.mutation<void, PermissionProvider & {
      data: { permissions: { name: string; state: PermissionOverrideState }[] };
    }>({
      query: ({ providerKey, data }) => ({
        url: `/shikshamitra-permissions/users/${encodeURIComponent(providerKey)}/permissions`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, request) => [
        { type: permissionType.permission, id: permissionCacheId(request) },
      ],
    }),
    getPermissions: builder.query<any, PermissionProvider>({
      query: ({ providerName, providerKey }) => ({
        url: `/permission-management/permissions?${new URLSearchParams({ providerName, providerKey })}`,
      }),
      providesTags: (_result, _error, request) => [
        { type: permissionType.permission, id: permissionCacheId(request) },
      ],
    }),
    updatePermission: builder.mutation<any, UpdatePermissionRequest>({
      query: ({ providerName, providerKey, data }) => ({
        url: `/permission-management/permissions?${new URLSearchParams({ providerName, providerKey })}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (_result, _error, request) => [
        { type: permissionType.permission, id: permissionCacheId(request) },
      ],
    }),
  }),
});

export const { useGetPermissionsQuery, useLazyGetPermissionsQuery, useUpdatePermissionMutation,
  useGetUserPermissionOverridesQuery, useUpdateUserPermissionOverridesMutation } =
  permissionApi;

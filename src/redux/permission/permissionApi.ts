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

export const { useGetPermissionsQuery, useLazyGetPermissionsQuery, useUpdatePermissionMutation } =
  permissionApi;

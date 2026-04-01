import { roleOptionsType } from 'src/redux/tagTypes';

import { api } from '../service';

export const roleOptionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRoleOptions: builder.query({
      query: () => ({
        url: '/rolesData',
        method: 'GET',
      }),
      providesTags: [roleOptionsType.roleOptions],
    }),
  }),
});

export const { useGetRoleOptionsQuery } = roleOptionsApi;

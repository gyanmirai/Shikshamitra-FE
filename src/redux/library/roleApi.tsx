import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import libraryData from '../../../issueReturnData.json';

const isDev = process.env.NODE_ENV === 'development';

export const roleOptionsApi = createApi({
  reducerPath: 'RoleOptionsApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/rolesData') {
          return { data: libraryData.rolesData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['RoleOptions'],
  endpoints: (builder) => ({
    getRoleOptions: builder.query({
      query: () => ({
        url: '/rolesData',
        method: 'GET',
      }),
      providesTags: ['RoleOptions'],
    }),
  }),
});

export const { useGetRoleOptionsQuery } = roleOptionsApi;

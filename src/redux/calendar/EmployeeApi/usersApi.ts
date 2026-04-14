import { calendarModuleType } from 'src/redux/tagTypes';

import { calendarModuleApi } from '../calendarApi';

export const usersApi = calendarModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getGroupUsers: builder.query({
      query: () => ({
        url: '/usersData',
        method: 'GET',
      }),
      providesTags: [calendarModuleType.users],
    }),
  }),
  overrideExisting: false,
});

export const { useGetGroupUsersQuery } = usersApi;

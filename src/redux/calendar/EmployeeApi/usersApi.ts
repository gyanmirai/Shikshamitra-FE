import { calendarModuleApi } from '../calendarApi';
import { calendarModuleType } from 'src/redux/tagTypes';


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

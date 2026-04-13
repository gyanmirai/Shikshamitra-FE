import { calendarModuleType } from 'src/redux/tagTypes';

import { calendarModuleApi } from '../calendarApi';

export const employeeApi = calendarModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getGroupEmployees: builder.query({
      query: () => ({
        url: '/employeeData',
        method: 'GET',
      }),
      providesTags: [calendarModuleType.employee],
    }),
  }),
  overrideExisting: false,
});

export const { useGetGroupEmployeesQuery } = employeeApi;

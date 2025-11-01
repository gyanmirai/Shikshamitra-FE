import { calendarModuleApi } from '../calendarApi';

export const employeeApi = calendarModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getGroupEmployees: builder.query({
      query: () => ({
        url: '/employeeData',
        method: 'GET',
      }),
      providesTags: ['Employee'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetGroupEmployeesQuery } = employeeApi;

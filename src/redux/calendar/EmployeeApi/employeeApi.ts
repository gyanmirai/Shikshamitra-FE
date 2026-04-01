import { calendarModuleApi } from '../calendarApi';
import { calendarModuleType } from 'src/redux/tagTypes';


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

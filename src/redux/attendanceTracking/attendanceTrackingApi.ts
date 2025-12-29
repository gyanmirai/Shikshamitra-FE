import { employeeApi } from '../employee/employeeApi';

export const attendanceTrackingApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    // Employee-wise attendance (date range)
    getEmployeeWiseAttendance: builder.query({
      query: (params) => ({
        url: '/attendance-tracking/employee-wise',
        method: 'GET',
        params, // { employeeId, startDate, endDate, status }
      }),
      providesTags: ['Attendance'],
    }),

    // Date-wise attendance (with pagination)
    getDateWiseAttendance: builder.query({
      query: (params) => ({
        url: '/attendance-tracking/date-wise',
        method: 'GET',
        params, // { attendanceDate, status, page, pageSize }
      }),
      providesTags: ['Attendance'],
    }),
  }),
});

export const { useGetEmployeeWiseAttendanceQuery, useGetDateWiseAttendanceQuery } =
  attendanceTrackingApi;

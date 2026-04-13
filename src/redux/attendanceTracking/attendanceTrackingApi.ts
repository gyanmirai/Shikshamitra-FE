import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from '../hr/employeeApi';

export const attendanceTrackingApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    // Employee-wise attendance (date range)
    getEmployeeWiseAttendance: builder.query({
      query: (params) => ({
        url: '/attendance-tracking/employee-wise',
        method: 'GET',
        params, // { employeeId, startDate, endDate, status }
      }),
      providesTags: [employeeType.attendance],
    }),

    // Date-wise attendance (with pagination)
    getDateWiseAttendance: builder.query({
      query: (params) => ({
        url: '/attendance-tracking/date-wise',
        method: 'GET',
        params, // { attendanceDate, status, page, pageSize }
      }),
      providesTags: [employeeType.attendance],
    }),
  }),
});

export const { useGetEmployeeWiseAttendanceQuery, useGetDateWiseAttendanceQuery } =
  attendanceTrackingApi;

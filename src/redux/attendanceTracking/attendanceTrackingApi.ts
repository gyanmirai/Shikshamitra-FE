import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from '../hr/employeeApi';

export type AttendanceTrackingFilterStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'REJECTED_LEAVE';

export interface GetDateWiseAttendanceParams {
  attendanceDate: string;
  status: AttendanceTrackingFilterStatus;
  educationMediumStageId: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface GetEmployeeWiseAttendanceParams {
  employeeId: string;
  startDate: string;
  endDate: string;
  educationMediumStageId: string;
  status?: AttendanceTrackingFilterStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const buildDateWiseAttendanceParams = ({
  attendanceDate,
  status,
  educationMediumStageId,
  search,
  page = 1,
  pageSize = 10,
}: GetDateWiseAttendanceParams) => ({
  attendanceDate,
  status,
  educationMediumStageId,
  search,
  page,
  pageSize,
});

export const buildEmployeeWiseAttendanceParams = ({
  employeeId,
  startDate,
  endDate,
  educationMediumStageId,
  status,
  search,
  page = 1,
  pageSize = 10,
}: GetEmployeeWiseAttendanceParams) => ({
  employeeId,
  startDate,
  endDate,
  educationMediumStageId,
  status,
  search,
  page,
  pageSize,
});

export const mapEmployeeWiseAttendanceRow = (row: any) => ({
  date: row?.date,
  inTime: row?.inTime,
  outTime: row?.outTime,
  hoursWorked: row?.hoursWorked,
  status: row?.status,
  description: row?.description,
});

export const attendanceTrackingApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    // Employee-wise attendance (date range)
    getEmployeeWiseAttendance: builder.query({
      query: (params: GetEmployeeWiseAttendanceParams) => ({
        url: '/attendance-tracking/employee-wise',
        method: 'GET',
        params: buildEmployeeWiseAttendanceParams(params),
      }),
      providesTags: [employeeType.attendance],
    }),

    // Date-wise attendance (with pagination)
    getDateWiseAttendance: builder.query({
      query: (params: GetDateWiseAttendanceParams) => ({
        url: '/attendance-tracking/date-wise',
        method: 'GET',
        params: buildDateWiseAttendanceParams(params),
      }),
      providesTags: [employeeType.attendance],
    }),
  }),
});

export const { useGetEmployeeWiseAttendanceQuery, useGetDateWiseAttendanceQuery } =
  attendanceTrackingApi;

import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/httpService';

export const employeeApi = createApi({
  reducerPath: 'employeeApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Employee', 'Attendance', 'AttendanceRule'],
  endpoints: (builder) => ({
    getEmployee: builder.query({
      query: () => ({ url: '/app/employee', redirect: 'follow' }),
      providesTags: ['Employee'],
    }),
    getEmployeeById: builder.query({
      query: (id) => ({ url: `/app/employee/${id}`, redirect: 'follow' }),
      providesTags: ['Employee'],
    }),
    addEmployee: builder.mutation({
      query: (body) => ({
        url: '/app/employee',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    addBasicInformation: builder.mutation({
      query: (body) => ({
        url: `/app/employee/basic-info`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    updateFamilyInformation: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: `/app/employee/family-info/${employeeId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    updateExperienceInformation: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: `/app/employee/experience-info/${employeeId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    updateBankDetails: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: `/app/employee/bank-details/${employeeId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    updateEmployee: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/employee/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/app/employee/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employee'],
    }),
    addAccessControl: builder.mutation({
      query: (body) => ({
        url: '/app/academic-setup-permission/assign-permissions',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    getEmployeeAttendanceByDate: builder.query({
      query: (date) => ({
        url: `/app/employee-attendance/employees-by-date?date=${date}`,
        redirect: 'follow',
      }),
      providesTags: ['Attendance'],
    }),
    getAttendanceByEmployeeId: builder.query({
      query: ({ employeeId, month }: { employeeId: string; month: string }) => ({
        url: `/app/employee-attendance/employee-attendance-summary?month=${month}&${employeeId}`,
        redirect: 'follow',
      }),
      providesTags: ['Attendance'],
    }),
    getEmployeeByUserId: builder.query({
      query: (userId) => ({
        url: `/app/employee/employee-by-user-id?userId=${userId}`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
    }),
    addEmployeeLeave: builder.mutation({
      query: (body) => ({
        url: '/app/employee-leave',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    getEmployeeLeave: builder.query({
      query: () => ({
        url: `/app/employee-leave`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
    }),
    employeeLeaveRequestStatus: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/employee-leave/${id}/leave-request-status`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    getEmployeeCustomAttendanceRule: builder.query({
      query: () => ({
        url: `/app/custom-attendance-rule`,
        redirect: 'follow',
      }),
      providesTags: ['AttendanceRule'],
    }),
    addEmployeeCustomAttendanceRule: builder.mutation({
      query: (body) => ({
        url: '/app/custom-attendance-rule',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['AttendanceRule'],
    }),
    updateEmployeeCustomAttendanceRule: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/custom-attendance-rule/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['AttendanceRule'],
    }),
    deleteEmployeeCustomAttendanceRule: builder.mutation({
      query: (id) => ({
        url: `/app/custom-attendance-rule/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AttendanceRule'],
    }),
    getEmployeeNotificationHistory: builder.query({
      query: () => ({
        url: `/app/notification-info`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
    }),
  }),
});

export const {
  useAddEmployeeMutation,
  useDeleteEmployeeMutation,
  useLazyGetEmployeeByIdQuery,
  useLazyGetEmployeeQuery,
  useGetEmployeeByIdQuery,
  useGetEmployeeQuery,
  useUpdateEmployeeMutation,
  useAddAccessControlMutation,
  useGetAttendanceByEmployeeIdQuery,
  useGetEmployeeAttendanceByDateQuery,
  useLazyGetEmployeeAttendanceByDateQuery,
  useLazyGetAttendanceByEmployeeIdQuery,
  useGetEmployeeByUserIdQuery,
  useLazyGetEmployeeByUserIdQuery,
  useAddEmployeeLeaveMutation,
  useGetEmployeeLeaveQuery,
  useEmployeeLeaveRequestStatusMutation,
  useGetEmployeeCustomAttendanceRuleQuery,
  useAddEmployeeCustomAttendanceRuleMutation,
  useUpdateEmployeeCustomAttendanceRuleMutation,
  useDeleteEmployeeCustomAttendanceRuleMutation,
  useGetEmployeeNotificationHistoryQuery,
  useUpdateBankDetailsMutation,
  useUpdateExperienceInformationMutation,
  useUpdateFamilyInformationMutation,
  useAddBasicInformationMutation,
} = employeeApi;

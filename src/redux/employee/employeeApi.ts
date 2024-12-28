import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const employeeApi = createApi({
  reducerPath: 'employeeApi',
  keepUnusedDataFor: 0,
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: [
    'Employee',
    'Attendance',
    'AttendanceRule',
    'EmployeeDocument',
    'Employee-Leave-Policy',
  ],
  endpoints: (builder) => ({
    // Basic Employee CRUD Operations
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
    updateEmployee: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/employee/basic-info/${id}`,
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
    getEmployeeByUserId: builder.query({
      query: (userId) => ({
        url: `/app/employee/employee-by-user-id?userId=${userId}`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
    }),

    // Employee Information Management
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
    updateEmployeeStatus: builder.mutation({
      query: ({ id, employeeStatusType }) => ({
        url: `/app/employee/employee-status/${id}?employeeStatusType=${employeeStatusType}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Employee'],
    }),

    // Attendance Management
    getEmployeeAttendanceByDate: builder.query({
      query: (date) => ({
        url: `/app/employee-attendance/employees-by-date?date=${date}`,
        redirect: 'follow',
      }),
      providesTags: ['Attendance'],
    }),
    getAttendanceByEmployeeId: builder.query({
      query: ({ employeeId, month }: { employeeId: string; month: string }) => ({
        url: `/app/employee-attendance/employee-attendance-summary?month=${month}&employeeIds=${employeeId}`,
        redirect: 'follow',
      }),
      providesTags: ['Attendance'],
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

    // Leave Management
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

    // Document Management
    uploadDocuments: builder.mutation({
      query: ({ id, body }) => ({
        url: `/employee/${id}/documents`,
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: body,
      }),
      invalidatesTags: ['EmployeeDocument'],
    }),
    employeeUpdateDocument: builder.mutation({
      query: ({ employeeId, documentId, body }) => ({
        url: `/employee/${employeeId}/documents/${documentId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: body,
      }),
      invalidatesTags: ['EmployeeDocument'],
    }),
    getEmployeeDocuments: builder.query({
      query: (id) => ({
        url: `/employee/${id}/documents`,
      }),
      providesTags: ['EmployeeDocument'],
    }),
    getEmployeeDocumentById: builder.query({
      query: ({ employeeId, documentId }) => ({
        url: `/employee/${employeeId}/documents/${documentId}`,
      }),
      providesTags: ['EmployeeDocument'],
    }),

    // Access Control & Notifications
    addAccessControl: builder.mutation({
      query: (body) => ({
        url: '/app/academic-setup-permission/assign-permissions',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    getEmployeeNotificationHistory: builder.query({
      query: () => ({
        url: `/app/notification-info`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
    }),

    // Employee Leave Policy
    getEmployeeLeavePolicy: builder.query({
      query: () => ({
        url: `/app/leave-policy`,
        redirect: 'follow',
      }),
      providesTags: ['Employee-Leave-Policy'],
    }),
    addEmployeeLeavePolicy: builder.mutation({
      query: (body) => ({
        url: '/app/leave-policy',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Employee-Leave-Policy'],
    }),
    updateEmployeeLeavePolicy: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/leave-policy/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee-Leave-Policy'],
    }),
    deleteEmployeeLeavePolicy: builder.mutation({
      query: (id) => ({
        url: `/app/leave-policy/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employee-Leave-Policy'],
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
  useUploadDocumentsMutation,
  useGetEmployeeDocumentsQuery,
  useGetEmployeeDocumentByIdQuery,
  useLazyGetEmployeeDocumentByIdQuery,
  useEmployeeUpdateDocumentMutation,
  useUpdateEmployeeStatusMutation,
  useGetEmployeeLeavePolicyQuery,
  useAddEmployeeLeavePolicyMutation,
  useUpdateEmployeeLeavePolicyMutation,
  useDeleteEmployeeLeavePolicyMutation,
} = employeeApi;

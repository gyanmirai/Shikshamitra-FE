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
    'Employee-Type',
    'Deduction-Components',
    'Employee-Payroll',
    'Earning-Components',
    'Salary-Slip',
    'PF',
    'Run-Payroll',
    'Salary-Structure',
  ],
  endpoints: (builder) => ({
    // Basic Employee CRUD Operations
    getEmployee: builder.query({
      query: () => ({ url: '/employees', redirect: 'follow' }),
      providesTags: ['Employee'],
    }),
    getEmployeeById: builder.query({
      query: (id) => ({ url: `/employees/${id}`, redirect: 'follow' }),
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
    updateEmployee: builder.mutation({
      query: ({ id, body }) => ({
        url: `/employees/${id}/personal-info`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    addBasicInformation: builder.mutation({
      query: (body) => ({
        url: `/employees/personal-info`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    getBasicInformation: builder.query({
      query: (id) => ({
        url: `/employees/${id}/personal-info`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
    }),
    getFamilyInformation: builder.query({
      query: (id) => ({
        url: `/employees/${id}/family-info`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
    }),
    updateFamilyInformation: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: `/employees/${employeeId}/family-info`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    getAdditionalInformation: builder.query({
      query: (id) => ({
        url: `/employees/${id}/additional-info`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
    }),
    updateAdditionalInformation: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: `/employees/${employeeId}/additional-info`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    getWorkExperience: builder.query({
      query: (id) => ({
        url: `/employees/${id}/work-experience`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
    }),
    updateExperienceInformation: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: `/employees/${employeeId}/work-experience`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    getBankDetails: builder.query({
      query: (id) => ({
        url: `/employees/${id}/payroll`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
    }),
    updateBankDetails: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: `/employees/${employeeId}/payroll`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    update: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: `/app/employee/bank-details/${employeeId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    updateEmployeeStatus: builder.mutation({
      query: ({ id, employeeStatusType }) => ({
        url: `/app/employee-status/change-status/${id}`,
        method: 'POST',
        data: {
          employeeStatusType,
        },
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
        url: '/v1/leave-management',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    getEmployeeLeave: builder.query({
      query: () => ({
        url: `/leave-management`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
    }),
    getEmployeeLeaveById: builder.query({
      query: (id) => ({
        url: `/leave-management/${id}`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
    }),
    employeeLeaveRequestStatus: builder.mutation({
      query: ({ id, body }) => ({
        url: `/leave-management/${id}`,
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
        url: '/app/user-scope/bulk-assign',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    getAccessControl: builder.query({
      query: (userId) => ({
        url: `/app/user-scope/user-scope/${userId}`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
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

    // Employee Type
    getEmployeeType: builder.query({
      query: () => ({
        url: `/app/employee-type`,
        redirect: 'follow',
      }),
      providesTags: ['Employee-Type'],
    }),
    addEmployeeType: builder.mutation({
      query: (body) => ({
        url: '/app/employee-type',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Employee-Type'],
    }),
    updateEmployeeType: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/employee-type/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee-Type'],
    }),
    deleteEmployeeType: builder.mutation({
      query: (id) => ({
        url: `/app/employee-type/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employee-Type'],
    }),
    getReportingManagerByEmployeeId: builder.query({
      query: (id) => ({
        url: `/employees/${id}/reporting-manager`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
    }),
    updateReportingManagerByEmployeeId: builder.mutation({
      query: ({ id, body }) => ({
        url: `/employees/${id}/reporting-manager`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee'],
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
  useGetAccessControlQuery,
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
  useGetBankDetailsQuery,
  useUpdateBankDetailsMutation,
  useGetWorkExperienceQuery,
  useUpdateExperienceInformationMutation,
  useGetFamilyInformationQuery,
  useUpdateFamilyInformationMutation,
  useGetAdditionalInformationQuery,
  useUpdateAdditionalInformationMutation,
  useAddBasicInformationMutation,
  useGetBasicInformationQuery,
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
  useGetEmployeeLeaveByIdQuery,
  useGetEmployeeTypeQuery,
  useAddEmployeeTypeMutation,
  useUpdateEmployeeTypeMutation,
  useDeleteEmployeeTypeMutation,
  useGetReportingManagerByEmployeeIdQuery,
  useUpdateReportingManagerByEmployeeIdMutation,
} = employeeApi;

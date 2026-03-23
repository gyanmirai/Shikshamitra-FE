import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const employeeApi = createApi({
  reducerPath: 'employeeApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: [
    'Employee',
    'EmployeeDocument',
    'Employee-Type',
    'Deduction-Components',
    'Employee-Payroll',
    'Earning-Components',
    'Salary-Slip',
    'PF',
    'Run-Payroll',
    'Salary-Structure',
    'Employee-Document-Config',
    'Employee-Leave-Policy',
    'AttendanceRule',
    'Attendance',
  ],
  endpoints: (builder) => ({
    // Basic Employee CRUD Operations
    getEmployee: builder.query({
      query: ({ search }) => ({
        url: `/employees/search`,
        method: 'GET',
        params: {
          search,
        },
      }),
      providesTags: ['Employee'],
    }),
    getEmployeeById: builder.query({
      query: (id) => ({ url: `/employees/${id}`, redirect: 'follow' }),
      providesTags: ['Employee'],
    }),
    // addEmployee: builder.mutation({
    //   query: (body) => ({
    //     url: '/app/employee',
    //     method: 'POST',
    //     data: body,
    //   }),
    //   invalidatesTags: ['Employee'],
    // }),
    // deleteEmployee: builder.mutation({
    //   query: (id) => ({
    //     url: `/app/employee/${id}`,
    //     method: 'DELETE',
    //   }),
    //   invalidatesTags: ['Employee'],
    // }),
    // getEmployeeByUserId: builder.query({
    //   query: (userId) => ({
    //     url: `/app/employee/employee-by-user-id?userId=${userId}`,
    //     redirect: 'follow',
    //   }),
    //   providesTags: ['Employee'],
    // }),

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
      query: ({ body }) => ({
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
        method: 'GET',
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
      query: ({ id }) => ({
        url: `/app/employee-work-experience`,
        method: 'GET',
        params: {
          employeeId: id,
        },
      }),
      providesTags: ['Employee'],
    }),
    updateExperienceInformation: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: `/app/employee-work-experience/upsert/${employeeId}`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    getBankDetails: builder.query({
      query: (id) => ({
        url: `/employees/${id}/payroll`,
        method: 'GET',
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

    // Document Management
    uploadDocuments: builder.mutation({
      query: ({ id, body }) => ({
        url: `/employees/${id}/documents`,
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: body,
      }),
      invalidatesTags: ['EmployeeDocument'],
    }),
    employeeUpdateDocument: builder.mutation({
      query: ({ employeeId, documentId, body }) => ({
        url: `/employees/${employeeId}/documents/${documentId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: body,
      }),
      invalidatesTags: ['EmployeeDocument'],
    }),
    getEmployeeDocuments: builder.query({
      query: ({ id, page = 1, pageSize = 20, search }) => ({
        url: `/employees/${id}/documents`,
        params: {
          page,
          pageSize,
          search,
        },
      }),
      providesTags: ['EmployeeDocument'],
    }),
    getEmployeeDocumentById: builder.query({
      query: ({ employeeId, documentId }) => ({
        url: `/employees/${employeeId}/documents/${documentId}`,
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
      query: ({ userId, academicYearId }) => ({
        url: `/app/user-scope/user-scope-hierarchy?userId=${userId}&academicYearId=${academicYearId}`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
    }),
    getEmployeeNotificationHistory: builder.query({
      query: () => ({
        url: `/app/notification-info`,
        method: 'GET',
      }),
      providesTags: ['Employee'],
    }),

    getReportingManagerByEmployeeId: builder.query({
      query: (id) => ({
        url: `/employees/${id}/reporting-manager`,
        method: 'GET',
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
    getEmployeesUnderManager: builder.query({
      query: (managerId) => ({
        url: `/employees/reporting-manager/${managerId}/employees`,
        redirect: 'follow',
      }),
      providesTags: ['Employee'],
    }),

    // Employee Document configuration
    getDocumentConfigurations: builder.query({
      query: ({ page = 1, pageSize = 20, academicYearId }) => ({
        url: `/employees/documents`,
        method: 'GET',
        params: {
          page,
          pageSize,
          academicYearId,
        },
      }),
      providesTags: ['Employee-Document-Config'],
    }),
    createDocumentConfiguration: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: `/employees/documents?academicYearId=${academicYearId}`,
        method: 'POST',
        data: body,
      }),
    }),
    updateDocumentConfiguration: builder.mutation({
      query: ({ id, body }) => ({
        url: `/employees/documents/${id}`,
        method: 'PUT',
        data: body,
      }),
    }),
    deleteDocumentConfiguration: builder.mutation({
      query: (id) => ({
        url: `/employees/documents/${id}`,
        method: 'DELETE',
      }),
    }),
    getDocumentConfigurationById: builder.query({
      query: (id) => ({
        url: `/employees/documents/${id}`,
        redirect: 'follow',
      }),
      providesTags: ['Employee-Document-Config'],
    }),
  }),
});

export const {
  useGetEmployeeByIdQuery,
  useLazyGetEmployeeByIdQuery,
  useGetEmployeeQuery,
  useLazyGetEmployeeQuery,
  useUpdateEmployeeMutation,
  useAddAccessControlMutation,
  useGetAccessControlQuery,
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
  useGetReportingManagerByEmployeeIdQuery,
  useUpdateReportingManagerByEmployeeIdMutation,
  useGetEmployeesUnderManagerQuery,
  useGetDocumentConfigurationsQuery,
  useCreateDocumentConfigurationMutation,
  useUpdateDocumentConfigurationMutation,
  useDeleteDocumentConfigurationMutation,
  useGetDocumentConfigurationByIdQuery,
  useLazyGetDocumentConfigurationByIdQuery,
} = employeeApi;

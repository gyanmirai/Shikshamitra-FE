import { api } from 'src/redux/service';
import { employeeType } from 'src/redux/tagTypes';

const compactParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  );

export const resolveEmployeeIdParam = (input: any): string | null => {
  const id = typeof input === 'string' ? input : input?.id || input?.employeeId;
  return typeof id === 'string' && id.trim() ? id.trim() : null;
};

export const buildWorkExperienceUrl = (input: any): string => {
  const id = resolveEmployeeIdParam(input);
  if (!id) {
    throw new Error('Employee id is required to fetch work experience.');
  }

  return `/employees/${id}/work-experience`;
};

export const employeeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Basic Employee CRUD Operations
    getEmployee: builder.query({
      query: (args) => {
        const { page = 1, pageSize = 10, search, ...filters } = args ?? {};

        return {
          url: `/employees`,
          method: 'GET',
          params: compactParams({
            page,
            pageSize,
            search,
            ...filters,
          }),
        };
      },
      providesTags: [employeeType.employee],
    }),
    getEmployeeById: builder.query({
      query: (id) => ({ url: `/employees/${id}`, redirect: 'follow' }),
      providesTags: [employeeType.employee],
    }),
    // addEmployee: builder.mutation({
    //   query: (body) => ({
    //     url: '/app/employee',
    //     method: 'POST',
    //     body,
    //   }),
    //   invalidatesTags: [employeeType.employee],
    // }),
    // deleteEmployee: builder.mutation({
    //   query: (id) => ({
    //     url: `/app/employee/${id}`,
    //     method: 'DELETE',
    //   }),
    //   invalidatesTags: [employeeType.employee],
    // }),
    // getEmployeeByUserId: builder.query({
    //   query: (userId) => ({
    //     url: `/app/employee/employee-by-user-id?userId=${userId}`,
    //     redirect: 'follow',
    //   }),
    //   providesTags: [employeeType.employee],
    // }),

    // Employee Information Management
    updateEmployee: builder.mutation({
      query: ({ id, body }) => ({
        url: `/employees/${id}/personal-info`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employee],
    }),
    addBasicInformation: builder.mutation({
      query: ({ body }) => ({
        url: `/employees/personal-info`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.employee],
    }),
    getBasicInformation: builder.query({
      query: (id) => ({
        url: `/employees/${id}/personal-info`,
        redirect: 'follow',
      }),
      providesTags: [employeeType.employee],
    }),
    getFamilyInformation: builder.query({
      query: (id) => ({
        url: `/employees/${id}/family-info`,
        method: 'GET',
      }),
      providesTags: [employeeType.employee],
    }),
    updateFamilyInformation: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: `/employees/${employeeId}/family-info`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employee],
    }),
    getAdditionalInformation: builder.query({
      query: (id) => ({
        url: `/employees/${id}/additional-info`,
        redirect: 'follow',
      }),
      providesTags: [employeeType.employee],
    }),
    updateAdditionalInformation: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: `/employees/${employeeId}/additional-info`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employee],
    }),
    getWorkExperience: builder.query({
      query: (input) => ({
        url: buildWorkExperienceUrl(input),
        method: 'GET',
      }),
      providesTags: [employeeType.employee],
    }),
    updateExperienceInformation: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: `/employees/${employeeId}/work-experience`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employee],
    }),
    getBankDetails: builder.query({
      query: (id) => ({
        url: `/employees/${id}/payroll`,
        method: 'GET',
      }),
      providesTags: [employeeType.employee],
    }),
    updateBankDetails: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: `/employees/${employeeId}/payroll`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employee],
    }),

    updateEmployeeStatus: builder.mutation({
      query: ({ id, body }) => ({
        url: `/employees/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employee],
    }),

    // Document Management
    uploadDocuments: builder.mutation({
      query: ({ id, body }) => ({
        url: `/employees/${id}/documents`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.employeeDocument],
    }),
    employeeUpdateDocument: builder.mutation({
      query: ({ employeeId, documentId, body }) => ({
        url: `/employees/${employeeId}/documents/${documentId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employeeDocument],
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
      providesTags: [employeeType.employeeDocument],
    }),
    getEmployeeDocumentById: builder.query({
      query: ({ employeeId, documentId }) => ({
        url: `/employees/${employeeId}/documents/${documentId}`,
        responseHandler: (response) => response.blob(),
      }),
      providesTags: [employeeType.employeeDocument],
    }),

    // Access Control & Notifications
    addAccessControl: builder.mutation({
      query: (body) => ({
        url: '/app/user-scope/bulk-assign',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.employee],
    }),
    getAccessControl: builder.query({
      query: ({ userId, academicYearId }) => ({
        url: `/app/user-scope/user-scope-hierarchy?userId=${userId}&academicYearId=${academicYearId}`,
        redirect: 'follow',
      }),
      providesTags: [employeeType.employee],
    }),
    getEmployeeNotificationHistory: builder.query({
      query: () => ({
        url: `/app/notification-info`,
        method: 'GET',
      }),
      providesTags: [employeeType.employee],
    }),

    getReportingManagerByEmployeeId: builder.query({
      query: (id) => ({
        url: `/employees/${id}/reporting-manager`,
        method: 'GET',
      }),
      providesTags: [employeeType.employee],
    }),

    updateReportingManagerByEmployeeId: builder.mutation({
      query: ({ id, body }) => ({
        url: `/employees/${id}/reporting-manager`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employee],
    }),
    getEmployeesUnderManager: builder.query({
      query: (managerId) => ({
        url: `/employees/reporting-manager/${managerId}/employees`,
        redirect: 'follow',
      }),
      providesTags: [employeeType.employee],
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
      providesTags: [employeeType.employeeDocumentConfig],
    }),
    createDocumentConfiguration: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: `/employees/documents?academicYearId=${academicYearId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.employeeDocumentConfig],
    }),
    updateDocumentConfiguration: builder.mutation({
      query: ({ id, body }) => ({
        url: `/employees/documents/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employeeDocumentConfig],
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
      providesTags: [employeeType.employeeDocumentConfig],
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

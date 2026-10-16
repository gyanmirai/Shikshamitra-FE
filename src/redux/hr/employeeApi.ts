import type { IdentityRoleOption } from 'src/redux/role/roleApi';
import type {
  BulkUserScopeAssignmentScope,
  BulkUserScopeAssignmentResult,
  BulkUserScopeAssignmentPayload,
} from 'src/utils/userScopeBulkAssignPayload';

import { api } from 'src/redux/service';
import { tagTypes, roleType, allTagTypes, employeeType } from 'src/redux/tagTypes';

export type { BulkUserScopeAssignmentScope, BulkUserScopeAssignmentPayload };

export const EMPLOYEE_LIST_MAX_PAGE_SIZE = 500;

export interface EmployeeSearchOption {
  id: string;
  fullName: string;
  status: number;
}

export interface EmployeeOptionsResponse {
  items: EmployeeSearchOption[];
  hasMore: boolean;
}

export interface EmployeeOptionsInput {
  page: number;
  pageSize: number;
  search: string;
  status?: 'Active';
}

export type EmployeeDashboardStatus =
  | 'Present'
  | 'HalfDay'
  | 'Absent'
  | 'HalfDayLeave'
  | 'FullDayLeave'
  | 'Holiday'
  | 'WeeklyOff'
  | 'NotMarked'
  | 'NotAvailable';

export interface EmployeeDashboardAttendanceDay {
  date: string;
  status: EmployeeDashboardStatus;
  timeIn?: string | null;
  timeOut?: string | null;
  remarks?: string | null;
}

export interface EmployeeDashboardAttendanceMonth {
  month: string;
  present: number;
  halfDay: number;
  absent: number;
  halfDayLeave: number;
  fullDayLeave: number;
}

export interface EmployeeDashboardHoliday {
  name: string;
  fromDate: string;
  toDate: string;
}

export interface EmployeeDashboardData {
  employeeId: string;
  date: string;
  academicYearId?: string | null;
  academicYearName?: string | null;
  dataNotice?: string | null;
  todayStatus: EmployeeDashboardStatus;
  attendancePercentage?: number | null;
  recordedAttendanceDays: number;
  leaveBalanceDays?: number | null;
  hasUnlimitedLeave: boolean;
  isLeaveBalanceAvailable: boolean;
  pendingLeaveRequests: number;
  upcomingHoliday?: EmployeeDashboardHoliday | null;
  attendanceDays: EmployeeDashboardAttendanceDay[];
  attendanceTrend: EmployeeDashboardAttendanceMonth[];
  holidays: EmployeeDashboardHoliday[];
}

const compactParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );

const normalizeEmployeeListPageSize = (value: unknown): number => {
  const numericPageSize = Number(value ?? 10);
  if (!Number.isFinite(numericPageSize)) return 10;
  return Math.min(EMPLOYEE_LIST_MAX_PAGE_SIZE, Math.max(1, Math.trunc(numericPageSize)));
};

export const normalizeIsTeachingFilter = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true;
    }
    if (value.toLowerCase() === 'false') {
      return false;
    }
  }

  return undefined;
};

export const buildEmployeeListQueryParams = (args?: Record<string, unknown>) => {
  const { page = 1, pageSize = 10, search, isTeaching, ...filters } = args ?? {};

  return compactParams({
    page,
    pageSize: normalizeEmployeeListPageSize(pageSize),
    search,
    ...filters,
    isTeaching: normalizeIsTeachingFilter(isTeaching),
  });
};

export const resolveEmployeeIdParam = (input: any): string | null => {
  const id = typeof input === 'string' ? input : input?.id || input?.employeeId;
  return typeof id === 'string' && id.trim() ? id.trim() : null;
};

export const buildWorkExperienceUrl = (input: any): string => {
  const id = resolveEmployeeIdParam(input);
  if (!id) {
    throw new Error('Staff id is required to fetch work experience.');
  }

  return `/employees/${id}/work-experience`;
};

export const buildEmployeeSubresourceUrl = (input: any, resourceName: string): string => {
  const id = resolveEmployeeIdParam(input);
  if (!id) {
    throw new Error(`Staff id is required to access ${resourceName}.`);
  }

  return `/employees/${id}/${resourceName}`;
};

export const buildReportingManagerUrl = (input: any): string =>
  buildEmployeeSubresourceUrl(input, 'reporting-manager');

export const buildEmployeeDashboardUrl = (input: any): string =>
  buildEmployeeSubresourceUrl(input, 'dashboard');

export const employeePayrollInvalidationTags = [
  employeeType.employee,
  employeeType.attendanceRule,
  employeeType.runPayroll,
  employeeType.salarySlip,
];

export const employeeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeAssignableRoles: builder.query<{ items: IdentityRoleOption[] }, void>({
      query: () => ({ url: '/employees/assignable-roles' }),
      providesTags: [roleType.role],
    }),
    // Basic Employee CRUD Operations
    getEmployeeOptions: builder.query<EmployeeOptionsResponse, EmployeeOptionsInput>({
      query: (params) => ({ url: '/employees/options', params }),
      providesTags: [employeeType.employee],
    }),
    getEmployee: builder.query({
      query: (args) => ({
        url: `/employees`,
        method: 'GET',
        params: buildEmployeeListQueryParams(args),
      }),
      providesTags: [employeeType.employee],
    }),
    getEmployeeById: builder.query({
      query: (id) => ({ url: `/employees/${id}`, redirect: 'follow' }),
      providesTags: [employeeType.employee],
    }),
    getCurrentEmployee: builder.query({
      query: () => ({ url: '/employees/me', method: 'GET' }),
      providesTags: [employeeType.employee],
    }),
    getEmployeeDashboard: builder.query<
      EmployeeDashboardData,
      { employeeId: string; date?: string }
    >({
      query: ({ employeeId, date }) => ({
        url: buildEmployeeDashboardUrl({ employeeId }),
        method: 'GET',
        params: date ? { date } : undefined,
      }),
      providesTags: [employeeType.employee, employeeType.attendance, employeeType.hrDashboard],
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
        url: buildEmployeeSubresourceUrl({ id }, 'personal-info'),
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
        url: buildEmployeeSubresourceUrl(id, 'personal-info'),
        redirect: 'follow',
      }),
      providesTags: [employeeType.employee],
    }),
    getFamilyInformation: builder.query({
      query: (id) => ({
        url: buildEmployeeSubresourceUrl(id, 'family-info'),
        method: 'GET',
      }),
      providesTags: [employeeType.employee],
    }),
    updateFamilyInformation: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: buildEmployeeSubresourceUrl({ employeeId }, 'family-info'),
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employee],
    }),
    getAdditionalInformation: builder.query({
      query: (id) => ({
        url: buildEmployeeSubresourceUrl(id, 'additional-info'),
        redirect: 'follow',
      }),
      providesTags: [employeeType.employee],
    }),
    updateAdditionalInformation: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: buildEmployeeSubresourceUrl({ employeeId }, 'additional-info'),
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
        url: buildEmployeeSubresourceUrl({ employeeId }, 'work-experience'),
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employee],
    }),
    getBankDetails: builder.query({
      query: (id) => ({
        url: buildEmployeeSubresourceUrl(id, 'payroll'),
        method: 'GET',
      }),
      providesTags: [employeeType.employee],
    }),
    updateBankDetails: builder.mutation({
      query: ({ employeeId, body }) => ({
        url: buildEmployeeSubresourceUrl({ employeeId }, 'payroll'),
        method: 'PUT',
        body,
      }),
      invalidatesTags: employeePayrollInvalidationTags,
    }),

    updateEmployeeStatus: builder.mutation({
      query: ({ id, body }) => ({
        url: `/employees/${id}/status`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employee],
    }),
    getEmployeeStatusDeactivationCheck: builder.query({
      query: (id) => ({
        url: `/employees/${id}/status-deactivation-check`,
        method: 'GET',
      }),
      providesTags: [employeeType.employee],
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
    addAccessControl: builder.mutation<
      BulkUserScopeAssignmentResult,
      BulkUserScopeAssignmentPayload
    >({
      query: (body) => ({
        url: '/app/user-scope/bulk-assign',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result) => (result ? tagTypes : []),
    }),
    getAccessControl: builder.query({
      query: ({ userId, academicYearId }) => ({
        url: `/app/user-scope/user-scope-hierarchy?userId=${userId}&academicYearId=${academicYearId}`,
        redirect: 'follow',
      }),
      providesTags: [employeeType.employee, allTagTypes.userScope],
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
        url: buildReportingManagerUrl({ id }),
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
    getMyEmployeesUnderManager: builder.query({
      query: () => ({
        url: '/employees/reporting-manager/my/employees',
        method: 'GET',
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
      invalidatesTags: [employeeType.employeeDocumentConfig],
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
  useGetEmployeeAssignableRolesQuery,
  useGetEmployeeByIdQuery,
  useLazyGetEmployeeByIdQuery,
  useGetCurrentEmployeeQuery,
  useGetEmployeeDashboardQuery,
  useGetEmployeeQuery,
  useLazyGetEmployeeQuery,
  useLazyGetEmployeeOptionsQuery,
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
  useGetEmployeeStatusDeactivationCheckQuery,
  useGetReportingManagerByEmployeeIdQuery,
  useUpdateReportingManagerByEmployeeIdMutation,
  useGetEmployeesUnderManagerQuery,
  useGetMyEmployeesUnderManagerQuery,
  useGetDocumentConfigurationsQuery,
  useCreateDocumentConfigurationMutation,
  useUpdateDocumentConfigurationMutation,
  useDeleteDocumentConfigurationMutation,
  useGetDocumentConfigurationByIdQuery,
  useLazyGetDocumentConfigurationByIdQuery,
} = employeeApi;

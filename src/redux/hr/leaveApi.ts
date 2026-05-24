import { employeeType } from 'src/redux/tagTypes';

import { api } from '../service';

export const leaveApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Leave Types
    getLeaveTypes: builder.query({
      query: ({ page = 1, pageSize = 10, academicYearId, search }) => ({
        url: '/hr-leave-types',
        method: 'GET',
        params: { academicYearId, page, pageSize, search },
      }),
      providesTags: [employeeType.employeeType],
    }),
    createLeaveType: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/hr-leave-types',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [employeeType.employeeType],
    }),
    getLeaveTypeById: builder.query({
      query: (id) => ({
        url: `/hr-leave-types/${id}`,
        method: 'GET',
      }),
      providesTags: [employeeType.employeeType],
    }),
    updateLeaveType: builder.mutation({
      query: ({ leaveTypeId, body }) => ({
        url: `/hr-leave-types/${leaveTypeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employeeType],
    }),
    deleteLeaveType: builder.mutation({
      query: (id) => ({
        url: `/hr-leave-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [employeeType.employeeType],
    }),

    // Leave Policies
    getLeavePolicies: builder.query({
      query: ({ academicYearId, page = 1, pageSize = 10, search }) => ({
        url: '/leave-policies',
        method: 'GET',
        params: { academicYearId, page, pageSize, search },
      }),
      providesTags: [employeeType.employeeLeavePolicy],
    }),
    createLeavePolicy: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/leave-policies',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [employeeType.employeeLeavePolicy],
    }),
    getLeavePolicyById: builder.query({
      query: (id) => ({
        url: `/leave-policies/${id}`,
        method: 'GET',
      }),
      providesTags: [employeeType.employeeLeavePolicy],
    }),
    updateLeavePolicy: builder.mutation({
      query: ({ id, body }) => ({
        url: `/leave-policies/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employeeLeavePolicy],
    }),
    deleteLeavePolicy: builder.mutation({
      query: (id) => ({
        url: `/leave-policies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [employeeType.employeeLeavePolicy],
    }),

    // Leave Management
    getLeaveRequests: builder.query({
      query: ({
        academicYearId,
        'month-year': monthYear,
        page = 1,
        pageSize = 20,
        search,
        status,
        leavePolicyId,
        leaveTypeMasterId,
        employeeId,
      }) => ({
        url: '/leave-management',
        method: 'GET',
        params: {
          academicYearId,
          ...(monthYear != null && monthYear !== '' ? { 'month-year': monthYear } : {}),
          page,
          pageSize,
          search,
          status,
          leavePolicyId,
          leaveTypeMasterId,
          employeeId,
        },
      }),
      providesTags: [employeeType.employee],
    }),
    getMyLeaveRequests: builder.query({
      query: ({
        academicYearId,
        'month-year': monthYear,
        page = 1,
        pageSize = 20,
        search,
        status,
        leavePolicyId,
        leaveTypeMasterId,
      }) => ({
        url: '/leave-management/my',
        method: 'GET',
        params: {
          academicYearId,
          ...(monthYear != null && monthYear !== '' ? { 'month-year': monthYear } : {}),
          page,
          pageSize,
          search,
          status,
          leavePolicyId,
          leaveTypeMasterId,
        },
      }),
      providesTags: [employeeType.employee],
    }),
    getLeaveCalendar: builder.query({
      query: ({
        academicYearId,
        rangeStart,
        rangeEnd,
        page = 1,
        pageSize = 100,
        search,
        status,
        leavePolicyId,
        leaveTypeMasterId,
      }) => ({
        url: '/leave-management/calendar',
        method: 'GET',
        params: {
          academicYearId,
          rangeStart,
          rangeEnd,
          page,
          pageSize,
          search,
          status,
          leavePolicyId,
          leaveTypeMasterId,
        },
      }),
      providesTags: [employeeType.employee],
    }),
    createLeaveRequest: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/leave-management',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [employeeType.employee, employeeType.hrDashboard],
    }),
    createMyLeaveRequest: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/leave-management/my',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [employeeType.employee, employeeType.hrDashboard],
    }),
    getLeaveRequestById: builder.query({
      query: ({ id }) => ({
        url: `/leave-management/${id}`,
        method: 'GET',
      }),
      providesTags: [employeeType.employee],
    }),
    getMyLeaveRequestById: builder.query({
      query: ({ id }) => ({
        url: `/leave-management/my/${id}`,
        method: 'GET',
      }),
      providesTags: [employeeType.employee],
    }),
    cancelLeaveRequest: builder.mutation({
      query: (id) => ({
        url: `/leave-management/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [employeeType.employee],
    }),
    cancelMyLeaveRequest: builder.mutation({
      query: (id) => ({
        url: `/leave-management/my/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [employeeType.employee],
    }),
    approveLeaveRequest: builder.mutation({
      query: ({ id, body }) => ({
        url: `/leave-management/${id}/approve`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [employeeType.employee, employeeType.hrDashboard],
    }),
    rejectLeaveRequest: builder.mutation({
      query: ({ id, body }) => ({
        url: `/leave-management/${id}/reject`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [employeeType.employee, employeeType.hrDashboard],
    }),

    // Leave Balance
    getMyLeaveBalance: builder.query({
      query: ({ academicYearId, employeeId }) => ({
        url: '/leave-management/balances',
        method: 'GET',
        params: { academicYearId, employeeId },
      }),
      providesTags: [employeeType.employee],
    }),
    getSelfLeaveBalance: builder.query({
      query: ({ academicYearId }) => ({
        url: '/leave-management/my/balances',
        method: 'GET',
        params: { academicYearId },
      }),
      providesTags: [employeeType.employee],
    }),
  }),
});

export const {
  useGetLeaveTypesQuery,
  useLazyGetLeaveTypesQuery,
  useCreateLeaveTypeMutation,
  useGetLeaveTypeByIdQuery,
  useUpdateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
  useGetLeavePoliciesQuery,
  useLazyGetLeavePoliciesQuery,
  useCreateLeavePolicyMutation,
  useGetLeavePolicyByIdQuery,
  useUpdateLeavePolicyMutation,
  useDeleteLeavePolicyMutation,
  useGetLeaveRequestsQuery,
  useGetMyLeaveRequestsQuery,
  useLazyGetMyLeaveRequestsQuery,
  useLazyGetLeaveRequestsQuery,
  useGetLeaveCalendarQuery,
  useLazyGetLeaveCalendarQuery,
  useCreateLeaveRequestMutation,
  useCreateMyLeaveRequestMutation,
  useGetLeaveRequestByIdQuery,
  useGetMyLeaveRequestByIdQuery,
  useCancelLeaveRequestMutation,
  useCancelMyLeaveRequestMutation,
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
  useGetMyLeaveBalanceQuery,
  useGetSelfLeaveBalanceQuery,
} = leaveApi;

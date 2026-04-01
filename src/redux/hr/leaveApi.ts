import { employeeApi } from './employeeApi';
import { employeeType } from 'src/redux/tagTypes';

export const leaveApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    // Leave Types
    getLeaveTypes: builder.query({
      query: ({ page = 1, pageSize = 20, academicYearId, search }) => ({
        url: '/hr-leave-types',
        method: 'GET',
        params: { page, pageSize, academicYearId, search },
      }),
      providesTags: [employeeType.employeeType],
    }),
    createLeaveType: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/hr-leave-types',
        method: 'POST',
        params: { academicYearId },
        data: body,
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
      query: ({ id, body }) => ({
        url: `/hr-leave-types/${id}`,
        method: 'PUT',
        data: body,
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
      query: ({ academicYearId, page = 1, pageSize = 20, search }) => ({
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
        data: body,
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
        data: body,
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
      query: ({ academicYearId, 'month-year': monthYear, page = 1, pageSize = 20, search }) => ({
        url: '/leave-management',
        method: 'GET',
        params: { academicYearId, 'month-year': monthYear, page, pageSize, search },
      }),
      providesTags: [employeeType.employee], // Following existing pattern in employeeApi
    }),
    createLeaveRequest: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/leave-management',
        method: 'POST',
        params: { academicYearId },
        data: body,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
      invalidatesTags: [employeeType.employee],
    }),
    getLeaveRequestById: builder.query({
      query: (id) => ({
        url: `/leave-management/${id}`,
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
    approveLeaveRequest: builder.mutation({
      query: ({ id, body }) => ({
        url: `/leave-management/${id}/approve`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: [employeeType.employee],
    }),
    rejectLeaveRequest: builder.mutation({
      query: ({ id, body }) => ({
        url: `/leave-management/${id}/reject`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: [employeeType.employee],
    }),
  }),
});

export const {
  useGetLeaveTypesQuery,
  useCreateLeaveTypeMutation,
  useGetLeaveTypeByIdQuery,
  useUpdateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
  useGetLeavePoliciesQuery,
  useCreateLeavePolicyMutation,
  useGetLeavePolicyByIdQuery,
  useUpdateLeavePolicyMutation,
  useDeleteLeavePolicyMutation,
  useGetLeaveRequestsQuery,
  useCreateLeaveRequestMutation,
  useGetLeaveRequestByIdQuery,
  useCancelLeaveRequestMutation,
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
} = leaveApi;

import { employeeApi } from './employeeApi';

export const leaveApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    // Leave Types
    getLeaveTypes: builder.query({
      query: ({ page = 1, pageSize = 20, academicYearId, search }) => ({
        url: '/hr-leave-types',
        method: 'GET',
        params: { page, pageSize, academicYearId, search },
      }),
      providesTags: ['Employee-Type'],
    }),
    createLeaveType: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/hr-leave-types',
        method: 'POST',
        params: { academicYearId },
        data: body,
      }),
      invalidatesTags: ['Employee-Type'],
    }),
    getLeaveTypeById: builder.query({
      query: (id) => ({
        url: `/hr-leave-types/${id}`,
        method: 'GET',
      }),
      providesTags: ['Employee-Type'],
    }),
    updateLeaveType: builder.mutation({
      query: ({ id, body }) => ({
        url: `/hr-leave-types/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee-Type'],
    }),
    deleteLeaveType: builder.mutation({
      query: (id) => ({
        url: `/hr-leave-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employee-Type'],
    }),

    // Leave Policies
    getLeavePolicies: builder.query({
      query: ({ academicYearId, page = 1, pageSize = 20, search }) => ({
        url: '/leave-policies',
        method: 'GET',
        params: { academicYearId, page, pageSize, search },
      }),
      providesTags: ['Employee-Leave-Policy'],
    }),
    createLeavePolicy: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/leave-policies',
        method: 'POST',
        params: { academicYearId },
        data: body,
      }),
      invalidatesTags: ['Employee-Leave-Policy'],
    }),
    getLeavePolicyById: builder.query({
      query: (id) => ({
        url: `/leave-policies/${id}`,
        method: 'GET',
      }),
      providesTags: ['Employee-Leave-Policy'],
    }),
    updateLeavePolicy: builder.mutation({
      query: ({ id, body }) => ({
        url: `/leave-policies/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Employee-Leave-Policy'],
    }),
    deleteLeavePolicy: builder.mutation({
      query: (id) => ({
        url: `/leave-policies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employee-Leave-Policy'],
    }),

    // Leave Management
    getLeaveRequests: builder.query({
      query: ({ academicYearId, 'month-year': monthYear, page = 1, pageSize = 20, search }) => ({
        url: '/leave-management',
        method: 'GET',
        params: { academicYearId, 'month-year': monthYear, page, pageSize, search },
      }),
      providesTags: ['Employee'], // Following existing pattern in employeeApi
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
      invalidatesTags: ['Employee'],
    }),
    getLeaveRequestById: builder.query({
      query: (id) => ({
        url: `/leave-management/${id}`,
        method: 'GET',
      }),
      providesTags: ['Employee'],
    }),
    cancelLeaveRequest: builder.mutation({
      query: (id) => ({
        url: `/leave-management/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Employee'],
    }),
    approveLeaveRequest: builder.mutation({
      query: ({ id, body }) => ({
        url: `/leave-management/${id}/approve`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: ['Employee'],
    }),
    rejectLeaveRequest: builder.mutation({
      query: ({ id, body }) => ({
        url: `/leave-management/${id}/reject`,
        method: 'PATCH',
        data: body,
      }),
      invalidatesTags: ['Employee'],
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

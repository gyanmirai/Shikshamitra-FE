import type {
  LeaveImpactPage,
  LeaveImpactReview,
  LeaveImpactRequest,
  LeaveReviewApproval,
} from 'src/screens/hr/policies/leave-impact.types';

import { employeeType } from 'src/redux/tagTypes';

import { api } from '../service';

type LeaveRequestQueryArgs = {
  academicYearId?: string;
  'month-year'?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string | number;
  leavePolicyId?: string;
  paidType?: string;
  employeeId?: string;
};

export type LeavePolicyQueryArgs = {
  academicYearId?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  archivedOnly?: boolean;
};

export const buildLeavePolicyQueryParams = ({
  academicYearId,
  page = 1,
  pageSize = 10,
  search,
  archivedOnly,
}: LeavePolicyQueryArgs) => ({
  academicYearId,
  page,
  pageSize,
  ...(search ? { search } : {}),
  ...(archivedOnly !== undefined ? { archivedOnly } : {}),
});

export type LeaveYearEndSettlementItem = {
  id: string;
  runId: string;
  sourceAcademicYearId: string;
  targetAcademicYearId?: string | null;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  sourceLeavePolicyId: string;
  sourceLeavePolicyRuleId: string;
  targetLeavePolicyRuleId?: string | null;
  accruedDays: number;
  carryInDays: number;
  approvedUsedDays: number;
  pendingDays: number;
  unusedDays: number;
  carriedDays: number;
  encashedDays: number;
  forfeitedDays: number;
  payrollMonth?: string | null;
  amount: number;
  status: string;
  issueCodes: string[];
  payrollAdjustmentId?: string | null;
};

export type LeaveYearEndSettlementRun = {
  id: string;
  academicYearId: string;
  targetAcademicYearId?: string | null;
  status: string;
  previewedAt?: string | null;
  finalizedAt?: string | null;
  totalItems: number;
  finalizedItems: number;
  blockedItems: number;
  totalCarriedDays: number;
  totalEncashedDays: number;
  totalForfeitedDays: number;
  totalEncashmentAmount: number;
  items?: LeaveYearEndSettlementItem[];
};

export const buildLeaveRequestQueryParams = ({
  academicYearId,
  'month-year': monthYear,
  page = 1,
  pageSize = 20,
  search,
  status,
  leavePolicyId,
  paidType,
  employeeId,
}: LeaveRequestQueryArgs = {}) => ({
  academicYearId,
  ...(monthYear != null && monthYear !== '' ? { 'month-year': monthYear } : {}),
  page,
  pageSize,
  ...(search ? { search } : {}),
  ...(status !== undefined && status !== '' ? { status } : {}),
  ...(leavePolicyId ? { leavePolicyId } : {}),
  ...(paidType ? { paidType } : {}),
  ...(employeeId ? { employeeId } : {}),
});

export const buildLeaveYearEndSettlementQueryParams = ({
  academicYearId,
}: {
  academicYearId?: string;
} = {}) => ({
  academicYearId,
});

export const buildLeaveYearEndSettlementPreviewBody = ({
  academicYearId,
}: {
  academicYearId?: string;
} = {}) => ({
  academicYearId,
});

export const leaveApi = api.injectEndpoints({
  endpoints: (builder) => ({
    previewLeavePolicyImpact: builder.mutation<LeaveImpactReview, LeaveImpactRequest>({
      query: (body) => ({ url: '/leave-policies/impact/preview', method: 'POST', body }),
    }),
    getLeavePolicyImpactDetails: builder.mutation<
      LeaveImpactPage,
      {
        assessment: LeaveImpactRequest;
        fingerprint: string;
        metric: string;
        skipCount: number;
        maxResultCount: number;
      }
    >({
      query: (body) => ({ url: '/leave-policies/impact/details', method: 'POST', body }),
    }),
    // Leave Policies
    getLeavePolicies: builder.query({
      query: (args: LeavePolicyQueryArgs) => ({
        url: '/leave-policies',
        method: 'GET',
        params: buildLeavePolicyQueryParams(args),
      }),
      providesTags: [employeeType.employeeLeavePolicy],
    }),
    createLeavePolicy: builder.mutation({
      query: ({ academicYearId, body, impactToken }) => ({
        url: '/leave-policies',
        method: 'POST',
        params: { academicYearId },
        body,
        headers: impactToken ? { 'X-HR-Policy-Impact-Token': impactToken } : undefined,
      }),
      invalidatesTags: [
        employeeType.employeeLeavePolicy,
        employeeType.employee,
        employeeType.hrDashboard,
        employeeType.runPayroll,
      ],
    }),
    getLeavePolicyById: builder.query({
      query: (id) => ({
        url: `/leave-policies/${id}`,
        method: 'GET',
      }),
      providesTags: [employeeType.employeeLeavePolicy],
    }),
    updateLeavePolicy: builder.mutation({
      query: ({ id, body, impactToken }) => ({
        url: `/leave-policies/${id}`,
        method: 'PUT',
        body,
        headers: impactToken ? { 'X-HR-Policy-Impact-Token': impactToken } : undefined,
      }),
      invalidatesTags: [
        employeeType.employeeLeavePolicy,
        employeeType.employee,
        employeeType.hrDashboard,
        employeeType.runPayroll,
      ],
    }),
    setDefaultLeavePolicy: builder.mutation({
      query: (args: string | ({ id: string } & LeaveReviewApproval)) => ({
        url: `/leave-policies/${typeof args === 'string' ? args : args.id}/set-default`,
        method: 'PATCH',
        headers:
          typeof args === 'string'
            ? undefined
            : {
                'X-HR-Policy-Impact-Token': args.impactToken || '',
                'X-HR-Leave-Impact-Scope': JSON.stringify(args.impactScope),
              },
      }),
      invalidatesTags: [
        employeeType.employeeLeavePolicy,
        employeeType.employee,
        employeeType.hrDashboard,
        employeeType.runPayroll,
      ],
    }),
    deleteLeavePolicy: builder.mutation({
      query: (args: string | ({ id: string } & LeaveReviewApproval)) => ({
        url: `/leave-policies/${typeof args === 'string' ? args : args.id}`,
        method: 'DELETE',
        headers:
          typeof args === 'string'
            ? undefined
            : {
                'X-HR-Policy-Impact-Token': args.impactToken || '',
                'X-HR-Leave-Impact-Scope': JSON.stringify(args.impactScope),
              },
      }),
      invalidatesTags: [
        employeeType.employeeLeavePolicy,
        employeeType.employee,
        employeeType.hrDashboard,
        employeeType.runPayroll,
      ],
    }),
    unarchiveLeavePolicy: builder.mutation({
      query: (id) => ({
        url: `/leave-policies/${id}/unarchive`,
        method: 'POST',
      }),
      invalidatesTags: [
        employeeType.employeeLeavePolicy,
        employeeType.employee,
        employeeType.hrDashboard,
        employeeType.runPayroll,
      ],
    }),

    // Leave Management
    getLeaveRequests: builder.query({
      query: (args) => ({
        url: '/leave-management',
        method: 'GET',
        params: buildLeaveRequestQueryParams(args),
      }),
      providesTags: [employeeType.employee],
    }),
    getMyLeaveRequests: builder.query({
      query: (args) => ({
        url: '/leave-management/my',
        method: 'GET',
        params: buildLeaveRequestQueryParams(args),
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
        paidType,
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
          paidType,
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
      invalidatesTags: [employeeType.employee, employeeType.hrDashboard, employeeType.runPayroll],
    }),
    createMyLeaveRequest: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/leave-management/my',
        method: 'POST',
        params: { academicYearId },
        body,
      }),
      invalidatesTags: [employeeType.employee, employeeType.hrDashboard, employeeType.runPayroll],
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
      invalidatesTags: [employeeType.employee, employeeType.hrDashboard, employeeType.runPayroll],
    }),
    cancelMyLeaveRequest: builder.mutation({
      query: (id) => ({
        url: `/leave-management/my/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [employeeType.employee, employeeType.hrDashboard, employeeType.runPayroll],
    }),
    approveLeaveRequest: builder.mutation({
      query: ({ id, body }) => ({
        url: `/leave-management/${id}/approve`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [employeeType.employee, employeeType.hrDashboard, employeeType.runPayroll],
    }),
    rejectLeaveRequest: builder.mutation({
      query: ({ id, body }) => ({
        url: `/leave-management/${id}/reject`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [employeeType.employee, employeeType.hrDashboard, employeeType.runPayroll],
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

    // Year-end settlements
    getLeaveYearEndSettlements: builder.query<
      LeaveYearEndSettlementRun[],
      { academicYearId?: string }
    >({
      query: ({ academicYearId }) => ({
        url: '/leave-management/year-end-settlements',
        method: 'GET',
        params: buildLeaveYearEndSettlementQueryParams({ academicYearId }),
      }),
      providesTags: [employeeType.employeeLeavePolicy, employeeType.runPayroll],
    }),
    getLeaveYearEndSettlementById: builder.query<LeaveYearEndSettlementRun, string>({
      query: (id) => ({
        url: `/leave-management/year-end-settlements/${id}`,
        method: 'GET',
      }),
      providesTags: [employeeType.employeeLeavePolicy, employeeType.runPayroll],
    }),
    previewLeaveYearEndSettlement: builder.mutation<
      LeaveYearEndSettlementRun,
      { academicYearId?: string }
    >({
      query: ({ academicYearId }) => ({
        url: '/leave-management/year-end-settlements/preview',
        method: 'POST',
        body: buildLeaveYearEndSettlementPreviewBody({ academicYearId }),
      }),
      invalidatesTags: [employeeType.employeeLeavePolicy, employeeType.runPayroll],
    }),
    finalizeLeaveYearEndSettlement: builder.mutation<LeaveYearEndSettlementRun, string>({
      query: (id) => ({
        url: `/leave-management/year-end-settlements/${id}/finalize`,
        method: 'POST',
      }),
      invalidatesTags: [
        employeeType.employee,
        employeeType.employeeLeavePolicy,
        employeeType.hrDashboard,
        employeeType.runPayroll,
        employeeType.salarySlip,
      ],
    }),
  }),
});

export const {
  usePreviewLeavePolicyImpactMutation,
  useGetLeavePolicyImpactDetailsMutation,
  useGetLeavePoliciesQuery,
  useLazyGetLeavePoliciesQuery,
  useCreateLeavePolicyMutation,
  useGetLeavePolicyByIdQuery,
  useUpdateLeavePolicyMutation,
  useSetDefaultLeavePolicyMutation,
  useDeleteLeavePolicyMutation,
  useUnarchiveLeavePolicyMutation,
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
  useGetLeaveYearEndSettlementsQuery,
  useGetLeaveYearEndSettlementByIdQuery,
  usePreviewLeaveYearEndSettlementMutation,
  useFinalizeLeaveYearEndSettlementMutation,
} = leaveApi;

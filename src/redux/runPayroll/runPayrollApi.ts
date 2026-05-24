import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from '../hr/employeeApi';

export const runPayrollApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    getRunPayrollPreview: builder.query({
      query: ({ month, page, pageSize, forceRefresh }) => ({
        url: '/payroll/run',
        method: 'GET',
        params: {
          month,
          ...(page !== undefined ? { page } : {}),
          ...(pageSize !== undefined ? { pageSize } : {}),
          ...(forceRefresh !== undefined ? { forceRefresh } : {}),
        },
      }),
      providesTags: [employeeType.runPayroll],
    }),

    getRunPayrollReadiness: builder.query({
      query: ({ month }) => ({
        url: '/payroll/run/readiness',
        method: 'GET',
        params: { month },
      }),
      providesTags: [employeeType.runPayroll],
    }),

    generateAndLockPayroll: builder.mutation({
      query: ({ month, employeeIds }) => ({
        url: `/payroll/run`,
        method: 'POST',
        body: { month, employeeIds },
      }),
      invalidatesTags: [employeeType.runPayroll],
    }),

    markPayrollReviewed: builder.mutation({
      query: ({ month, employeeIds }) => ({
        url: `/payroll/run/reviews`,
        method: 'POST',
        body: { month, employeeIds },
      }),
      invalidatesTags: [employeeType.runPayroll],
    }),

    unmarkPayrollReviewed: builder.mutation({
      query: ({ month, employeeIds }) => ({
        url: `/payroll/run/reviews`,
        method: 'DELETE',
        body: { month, employeeIds },
      }),
      invalidatesTags: [employeeType.runPayroll],
    }),

    getPayrollAdjustments: builder.query({
      query: ({ month, employeeId }) => ({
        url: '/payroll/run/adjustments',
        method: 'GET',
        params: {
          month,
          ...(employeeId ? { employeeId } : {}),
        },
      }),
      providesTags: [employeeType.runPayroll],
    }),

    createPayrollAdjustment: builder.mutation({
      query: (body) => ({
        url: '/payroll/run/adjustments',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.runPayroll],
    }),

    updatePayrollAdjustment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/payroll/run/adjustments/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.runPayroll],
    }),

    deletePayrollAdjustment: builder.mutation({
      query: (id) => ({
        url: `/payroll/run/adjustments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [employeeType.runPayroll],
    }),

    getEmployeeSalarySlip: builder.query({
      query: (params) => ({
        url: '/payroll/salary-slips',
        method: 'GET',
        params,
      }),
      providesTags: [employeeType.salarySlip],
    }),

    getEmployeeSalarySlipPdf: builder.query({
      query: (params) => ({
        url: '/payroll/salary-slips/pdf',
        method: 'GET',
        params,
        responseHandler: (response) => response.blob(),
      }),
      providesTags: [employeeType.salarySlip],
    }),
  }),
});

export const {
  useGetRunPayrollPreviewQuery,
  useGetRunPayrollReadinessQuery,
  useLazyGetRunPayrollPreviewQuery,
  useGenerateAndLockPayrollMutation,
  useMarkPayrollReviewedMutation,
  useUnmarkPayrollReviewedMutation,
  useCreatePayrollAdjustmentMutation,
  useUpdatePayrollAdjustmentMutation,
  useDeletePayrollAdjustmentMutation,
  useGetEmployeeSalarySlipQuery,
  useLazyGetEmployeeSalarySlipQuery,
  useLazyGetEmployeeSalarySlipPdfQuery,
} = runPayrollApi;

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

    getEmployeeSalarySlip: builder.query({
      query: (params) => ({
        url: '/payroll/salary-slips',
        method: 'GET',
        params,
      }),
      providesTags: [employeeType.salarySlip],
    }),
  }),
});

export const {
  useGetRunPayrollPreviewQuery,
  useLazyGetRunPayrollPreviewQuery,
  useGenerateAndLockPayrollMutation,
  useMarkPayrollReviewedMutation,
  useUnmarkPayrollReviewedMutation,
  useGetEmployeeSalarySlipQuery,
  useLazyGetEmployeeSalarySlipQuery,
} = runPayrollApi;

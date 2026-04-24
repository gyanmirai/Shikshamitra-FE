import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from '../hr/employeeApi';

export const runPayrollApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    getRunPayrollPreview: builder.query({
      query: ({ month }) => ({
        url: '/payroll/run',
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
  useGetEmployeeSalarySlipQuery,
  useLazyGetEmployeeSalarySlipQuery,
} = runPayrollApi;

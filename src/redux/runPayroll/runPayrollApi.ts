import { employeeApi } from '../employee/employeeApi';

export const runPayrollApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    getRunPayrollPreview: builder.query({
      query: ({ month }) => ({
        url: `/payroll/run/?month=${month}`,
        method: 'GET',
      }),
      providesTags: ['Run-Payroll'],
    }),

    generateAndLockPayroll: builder.mutation({
      query: (body) => ({
        url: `/payroll/run/?month=${body.month}`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Run-Payroll'],
    }),

    getEmployeeSalarySlip: builder.query({
      query: (params) => ({
        url: '/payroll/salary-slips',
        method: 'GET',
        params,
      }),
      providesTags: ['Salary-Slip'],
    }),
  }),
});

export const {
  useGetRunPayrollPreviewQuery,
  useGenerateAndLockPayrollMutation,
  useGetEmployeeSalarySlipQuery,
} = runPayrollApi;

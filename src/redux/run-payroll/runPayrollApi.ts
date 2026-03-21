import { employeeApi } from '../hr/employeeApi';

export const runPayrollApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    getRunPayrollPreview: builder.query({
      query: ({ month, academicYearId }) => ({
        url: `/payroll/run?month=${month}&academicYearId=${academicYearId}`,
        method: 'GET',
      }),
      providesTags: ['Run-Payroll'],
    }),

    generateAndLockPayroll: builder.mutation({
      query: ({ month, academicYearId }) => ({
        url: `/payroll/run?month=${month}&academicYearId=${academicYearId}`,
        method: 'POST',
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

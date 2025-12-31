import { employeeApi } from '../employee/employeeApi';

export const employeePayrollApi = employeeApi.injectEndpoints({
  // tagTypes: ['Deduction-Components', 'Employee-Payroll', 'Earning-Components'],
  endpoints: (builder) => ({
    getEmployeeSalarySlip: builder.query({
      query: ({ employeeId, monthYear }) => ({
        url: `/payroll/salary-slips?employeeId=${employeeId}&monthYear=${monthYear}`,
        method: 'GET',
      }),
      providesTags: ['Salary-Slip'],
    }),
  }),
});

export const { useGetEmployeeSalarySlipQuery, useLazyGetEmployeeSalarySlipQuery } =
  employeePayrollApi;

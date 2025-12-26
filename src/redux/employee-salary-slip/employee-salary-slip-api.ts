import { employeeApi } from '../employee/employeeApi';

export const employeePayrollApi = employeeApi.injectEndpoints({
  // tagTypes: ['Deduction-Components', 'Employee-Payroll', 'Earning-Components'],
  endpoints: (builder) => ({
    getEmployeeSalarySlip: builder.query({
      query: ({ id, monthYear }) => ({
        url: `/payroll/salary-slips?employeeId=${id}&monthYear=${monthYear}`,
        method: 'GET',
      }),
      providesTags: ['Salary-Slip'],
    }),
  }),
});

export const { useGetEmployeeSalarySlipQuery } = employeePayrollApi;

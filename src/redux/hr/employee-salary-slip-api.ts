import { employeeApi } from './employeeApi';
import { employeeType } from 'src/redux/tagTypes';

export const employeePayrollApi = employeeApi.injectEndpoints({
  // tagTypes: ['Deduction-Components', 'Employee-Payroll', 'Earning-Components'],
  endpoints: (builder) => ({
    getEmployeeSalarySlip: builder.query({
      query: ({ employeeId, monthYear, academicYearId }) => ({
        url: `/payroll/salary-slips?employeeId=${employeeId}&monthYear=${monthYear}&academicYearId=${academicYearId}`,
        method: 'GET',
      }),
      providesTags: [employeeType.salarySlip],
    }),
  }),
});

export const { useGetEmployeeSalarySlipQuery, useLazyGetEmployeeSalarySlipQuery } =
  employeePayrollApi;

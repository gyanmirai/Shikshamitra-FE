import { employeeApi } from '../hr/employeeApi';
import { employeeType } from 'src/redux/tagTypes';


export const runPayrollApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    getRunPayrollPreview: builder.query({
      query: ({ month, academicYearId }) => ({
        url: `/payroll/run?month=${month}&academicYearId=${academicYearId}`,
        method: 'GET',
      }),
      providesTags: [employeeType.runPayroll],
    }),

    generateAndLockPayroll: builder.mutation({
      query: ({ month, academicYearId }) => ({
        url: `/payroll/run?month=${month}&academicYearId=${academicYearId}`,
        method: 'POST',
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
  useGenerateAndLockPayrollMutation,
  useGetEmployeeSalarySlipQuery,
} = runPayrollApi;

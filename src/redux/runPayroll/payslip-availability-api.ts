import { employeeType } from 'src/redux/tagTypes';

import { runPayrollApi } from './runPayrollApi';

export type PayslipAvailability = {
  employeeId: string;
  monthYear: string;
  status:
    | 'AVAILABLE'
    | 'UNAVAILABLE'
    | 'ISSUANCE_REQUIRED'
    | 'NOT_PREPARED'
    | 'PREPARING'
    | 'FAILED'
    | 'PENDING'
    | 'REVIEWED';
  message: string;
  canViewPayslip: boolean;
};

export const payslipAvailabilityApi = runPayrollApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayslipAvailability: builder.query<
      PayslipAvailability,
      { employeeId: string; monthYear: string; academicYearId?: string }
    >({
      query: (params) => ({ url: '/payroll/salary-slips/availability', params }),
      providesTags: [employeeType.runPayroll, employeeType.salarySlip],
    }),
  }),
});

export const { useGetPayslipAvailabilityQuery } = payslipAvailabilityApi;

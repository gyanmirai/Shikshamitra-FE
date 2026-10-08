import { employeeApi, employeePayrollInvalidationTags } from './employeeApi';

export type PayrollProfileDetails = {
  bankDetails: {
    bankName: string;
    branchName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
  };
  statutoryIdentifiers: { epfNumber: string; uanNumber: string };
  attendanceIntegration: { punchId: string; totalWorkingHourPerMonth: number | null };
};

export type PayrollProfileDetailsPatch = Partial<PayrollProfileDetails>;

export const buildPayrollProfileDetailsRequest = (
  employeeId: string,
  body: PayrollProfileDetailsPatch
) => ({ url: `/employees/${employeeId}/payroll/profile-details`, method: 'PATCH', body });

export const payrollProfileApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    updatePayrollProfileDetails: builder.mutation<
      void,
      { employeeId: string; body: PayrollProfileDetailsPatch }
    >({
      query: ({ employeeId, body }) => buildPayrollProfileDetailsRequest(employeeId, body),
      invalidatesTags: employeePayrollInvalidationTags,
    }),
  }),
  overrideExisting: false,
});

export const { useUpdatePayrollProfileDetailsMutation } = payrollProfileApi;

import { api } from 'src/redux/service';
import { employeeType, payrollStructureType } from 'src/redux/tagTypes';

export type StaffStatutoryProfile = {
  versionId?: string | null;
  effectiveMonth?: string;
  applyPf: boolean;
  pfNumber: string | null;
  uanNumber: string | null;
  pfDisabledReason: string | null;
  applyEsic: boolean;
  esicInsuranceNumber: string | null;
  esicDisabledReason: string | null;
};
export type StaffStatutoryProfileResponse = {
  employeeId: string;
  profile: StaffStatutoryProfile;
  effectiveMonth: string;
  concurrencyStamp: string | null;
  canViewPf: boolean;
  canViewEsic: boolean;
  canManagePf: boolean;
  canManageEsic: boolean;
  warnings: string[];
  history: Array<{
    id: string;
    effectiveMonth: string;
    applyPf: boolean;
    applyEsic: boolean;
    createdAt: string;
  }>;
};
export const emptyStatutoryProfile: StaffStatutoryProfile = {
  applyPf: true,
  pfNumber: '',
  uanNumber: '',
  pfDisabledReason: '',
  applyEsic: true,
  esicInsuranceNumber: '',
  esicDisabledReason: '',
};
export const hasStatutoryNumber = (number: string | null | undefined) =>
  Boolean(number?.trim() && number.trim() !== '0');
const tags = [
  employeeType.employeePayroll,
  employeeType.salaryStructure,
  payrollStructureType.statutoryScheme,
];
export const statutoryProfileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPayrollRegistrationReadiness: builder.query<
      {
        totalCount: number;
        items: Array<{
          employeeId: string;
          employeeName: string;
          employeeCode: string;
          applyPf: boolean;
          pfNumberPresent: boolean;
          applyEsic: boolean;
          esicNumberPresent: boolean;
          effectiveMonth: string;
        }>;
      },
      { month: string; page: number; pageSize: number }
    >({
      query: (params) => ({ url: '/payroll/statutory-profile/readiness', params }),
      providesTags: [employeeType.runPayroll],
    }),
    getStaffStatutoryProfile: builder.query<
      StaffStatutoryProfileResponse,
      { employeeId: string; month?: string }
    >({
      query: ({ employeeId, month }) => ({
        url: `/employees/${employeeId}/payroll/statutory-profile`,
        params: { month },
      }),
      providesTags: (_result, _error, { employeeId }) =>
        tags.map((type) => ({ type, id: employeeId })),
    }),
    saveStaffStatutoryProfile: builder.mutation<
      StaffStatutoryProfileResponse,
      {
        employeeId: string;
        profile: StaffStatutoryProfile;
        effectiveMonth?: string;
        concurrencyStamp: string | null;
        idempotencyKey: string;
        updatePf: boolean;
        updateEsic: boolean;
      }
    >({
      query: ({ employeeId, ...body }) => ({
        url: `/employees/${employeeId}/payroll/statutory-profile`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { employeeId }) => [
        ...tags.map((type) => ({ type, id: employeeId })),
        employeeType.runPayroll,
      ],
    }),
  }),
});
export const {
  useGetPayrollRegistrationReadinessQuery,
  useGetStaffStatutoryProfileQuery,
  useSaveStaffStatutoryProfileMutation,
} = statutoryProfileApi;

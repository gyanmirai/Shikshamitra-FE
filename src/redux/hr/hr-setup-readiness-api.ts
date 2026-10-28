import { api } from 'src/redux/service';
import { employeeType, shiftManagementType, payrollStructureType } from 'src/redux/tagTypes';

export type HrSetupCheck = {
  code: string;
  step: 'staff' | 'policies' | 'earnings' | 'salary';
  state: 'ready' | 'missing' | 'inactive' | 'invalid' | 'conflicting' | 'unknown';
  reason: string;
  canConfigure: boolean;
};

export type HrSetupReadiness = {
  academicYearId: string | null;
  isReady: boolean;
  availableYears: Array<{ id: string; name: string; startDate: string; endDate: string }>;
  checks: HrSetupCheck[];
};

export type HrSetupReadinessArgs = { academicYearId?: string; contextKey: string };
export const hrSetupReadinessApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHrSetupReadiness: builder.query<HrSetupReadiness, HrSetupReadinessArgs>({
      query: ({ academicYearId }) => ({
        url: '/hr/setup-readiness',
        params: { academicYearId: academicYearId || undefined },
      }),
      providesTags: [
        employeeType.earningComponents,
        employeeType.deductionComponents,
        employeeType.attendanceRule,
        employeeType.employeeLeavePolicy,
        employeeType.pf,
        payrollStructureType.payrollStructure,
        payrollStructureType.salaryTemplate,
        payrollStructureType.statutoryScheme,
        shiftManagementType.shift,
      ],
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetHrSetupReadinessQuery } = hrSetupReadinessApi;

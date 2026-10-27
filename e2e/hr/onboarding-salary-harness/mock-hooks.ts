import { useState } from 'react';

export const useRouter = () => ({
  push: (href: string) => window.history.pushState({}, '', href),
  replace: (href: string) => window.history.replaceState({}, '', href),
});
const empty = () => ({ data: { items: [] }, isLoading: false });
export const useGetRolesQuery = () => ({
  isSuccess: true,
  isFetching: false,
  isError: false,
  isUninitialized: false,
  refetch: () => Promise.resolve({}),
  data: {
    items: [
      {
        id: 'role',
        name: 'Office staff',
        roleAudience: 'employee',
        employeeOnboardingAssignable: true,
        employeeGroupAudience: 'both',
      },
    ],
  },
  isLoading: false,
});
export const useGetShiftsQuery = () => ({
  data: { items: [{ id: 'shift', shiftName: 'Day shift', name: 'Day shift' }] },
  isLoading: false,
});
export const useAcademicOrganizationOptions = () => ({
  options: [],
  byId: new Map(),
  isLoading: false,
});
export const useGetEmployeeApplicationQuery = empty;
export const useGetEmployeeApplicationsQuery = empty;
export const useDeleteEmployeeApplicationMutation = () => [() => {}, {}];
export const useLazyGetEmployeeApplicationPhotoQuery = () => [
  () => ({ unwrap: async () => new Blob() }),
  {},
];
export const useLazyGetEmployeeApplicationResumeQuery = useLazyGetEmployeeApplicationPhotoQuery;
export const useCreateEmployeeApplicationInviteMutation = useDeleteEmployeeApplicationMutation;
export const useUpdateEmployeeApplicationStatusMutation = useDeleteEmployeeApplicationMutation;
export const useRegenerateEmployeeApplicationLinkMutation = useDeleteEmployeeApplicationMutation;
export const useFinalizeEmployeeApplicationMutation = () => {
  const [isLoading, setLoading] = useState(false);
  return [
    (request: any) => ({
      unwrap: async () => {
        setLoading(true);
        const qa = window as any;
        qa.finalizeRequests = [...(qa.finalizeRequests || []), request];
        await new Promise((resolve) => setTimeout(resolve, 150));
        setLoading(false);
        if (qa.failNextFinalize) {
          qa.failNextFinalize = false;
          throw Object.assign(new Error('Synthetic salary save failed. Retry finalization.'), {
            status: 500,
            data: { detail: 'Synthetic salary save failed. Retry finalization.' },
          });
        }
        return {
          application: { finalizedEmployeeId: 'synthetic-staff' },
          employee: { id: 'synthetic-staff', fullName: 'Synthetic Staff' },
          activationReadiness: {
            canActivate: true,
            compensationRevisionId: 'synthetic-revision',
            blockerCodes: [],
          },
        };
      },
    }),
    { isLoading },
  ];
};
export const useGetPFQuery = () => ({
  data: { items: [{ id: 'pf', name: 'Standard PF', isActive: true }] },
});
export const useGetEsiPolicyOptionsQuery = () => ({ data: [], refetch: async () => ({}) });
export const effectiveEsiPolicyVersion = () => undefined;
export const useGetActiveSalaryTemplatesQuery = () => ({
  data: {
    items: [
      {
        id: 'template',
        name: 'Synthetic salary template',
        isDefault: true,
        editableVersion: {
          id: 'version',
          defaultSalaryBasis: 'GROSS',
          defaultPfRuleId: 'pf',
          defaultEsiManagementMode: 'EXTERNAL',
          defaultEsiExternalReason: 'Synthetic external ESIC',
          rules: [],
        },
      },
    ],
  },
});
export const useCalculateSalaryTemplateMutation = () => [
  (input: any) => ({
    unwrap: async () => ({
      grossSalary: input.monthlyAmount,
      totalDeductions: 0,
      netSalary: input.monthlyAmount,
      employerCost: input.monthlyAmount,
      earnings: [],
      deductions: [],
      employerContributions: [],
      statutorySummary: [],
      warnings: [],
      pfEligibility: { canSave: true, status: 'NOT_APPLICABLE' },
      targetResult: { isExact: true, difference: 0 },
      employeeStateInsurance: { canCalculate: true, issueCodes: [] },
    }),
  }),
  {},
];
export const useGetCompensationRevisionsQuery = () => ({ data: { items: [] } });
export const useSaveEmployeeCompensationMutation = () => [
  () => {
    throw new Error('Onboarding must save through finalization');
  },
  {},
];
export const useGetEmployeeActivationReadinessQuery = () => ({});

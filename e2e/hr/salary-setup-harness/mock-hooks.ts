import { emptyStatutoryProfile } from 'src/redux/hr/statutory-profile-api';

export { hasStatutoryNumber, emptyStatutoryProfile } from 'src/redux/hr/statutory-profile-api';
export {
  useRouter,
  useGetPFQuery,
  effectiveEsiPolicyVersion,
  useGetEsiPolicyOptionsQuery,
  useGetActiveSalaryTemplatesQuery,
  useCalculateSalaryTemplateMutation,
  useGetEmployeeActivationReadinessQuery,
} from '../onboarding-salary-harness/mock-hooks';

const profile = {
  employeeId: 'synthetic-staff',
  effectiveMonth: '2026-11',
  concurrencyStamp: 'synthetic-stamp',
  canViewPf: true,
  canViewEsic: true,
  canManagePf: true,
  canManageEsic: true,
  profile: {
    ...emptyStatutoryProfile,
    applyPf: false,
    applyEsic: false,
    pfDisabledReason: 'Synthetic exclusion',
    esicDisabledReason: 'Synthetic exclusion',
  },
  warnings: [],
  history: [],
};
export const useSearchParams = () => new URLSearchParams('month=2026-11');
export const useSalaryEditorPrefetch = () => () => {};
export const useGetEmployeeByIdQuery = () => ({
  currentData: {
    id: 'synthetic-staff',
    fullName: 'Synthetic Staff',
    employeeIdentifier: 'QA-ONLY',
    status: 0,
  },
  refetch: async () => ({}),
});
export const useGetStaffStatutoryProfileQuery = () => ({
  currentData: profile,
  refetch: async () => ({}),
});
export const useSaveStaffStatutoryProfileMutation = () => [
  () => {
    throw Error('Use the atomic compensation save');
  },
  {},
];
export const useUpdateEmployeeStatusMutation = () => [
  () => {
    throw Error('Activation is outside this harness');
  },
  {},
];
const revisions = { items: [] };
export const useGetCompensationRevisionsQuery = () => ({
  data: revisions,
  refetch: async () => ({ data: revisions }),
});
export const useSaveEmployeeCompensationMutation = () => [
  (input: unknown) => ({
    unwrap: async () => {
      const qa = window as typeof window & {
        salarySaveRequests?: unknown[];
        failNextSalarySave?: boolean;
      };
      qa.salarySaveRequests = [...(qa.salarySaveRequests || []), input];
      if (qa.failNextSalarySave) {
        qa.failNextSalarySave = false;
        throw Object.assign(new Error('Synthetic salary save failure'), {
          status: 500,
          data: { detail: 'Synthetic salary save failed. Retry without losing changes.' },
        });
      }
      return {
        revisionNumber: 1,
        savedStatutoryProfile: {
          ...profile,
          concurrencyStamp: 'saved-stamp',
          profile: { ...profile.profile, versionId: 'saved-profile' },
        },
      };
    },
  }),
  {},
];

const salaryTemplate = {
  id: 'synthetic-template',
  name: 'Synthetic Staff Salary',
  description: 'Synthetic browser fixture',
  status: 'ACTIVE',
  isDefault: true,
  activeVersion: 1,
  versionCount: 1,
  concurrencyStamp: 'template-stamp',
  updatedAt: '2026-10-30T00:00:00Z',
  editableVersion: {
    id: 'version',
    versionNumber: 1,
    status: 'ACTIVE',
    defaultSalaryBasis: 'EMPLOYER_COST',
    defaultProtectionPolicy: 'PROTECT_EMPLOYER_COST',
    defaultPfApplicable: false,
    defaultEsiManagementMode: 'EXTERNAL',
    defaultEsiExternalReason: 'Synthetic external ESIC',
    rules: [
      {
        code: 'BASIC',
        componentId: 'basic',
        lineKind: 'EARNING',
        semanticType: 'BASIC',
        formulaType: 'PERCENTAGE_OF_GROSS',
        value: 40,
        displayOrder: 0,
      },
      {
        code: 'ALLOWANCE',
        componentId: 'allowance',
        lineKind: 'EARNING',
        semanticType: 'BALANCING_EARNING',
        formulaType: 'REMAINDER_OF_GROSS',
        value: null,
        displayOrder: 1,
      },
    ],
  },
};
const catalog = {
  items: [
    { componentId: 'basic', name: 'Basic', lineKind: 'EARNING' },
    { componentId: 'allowance', name: 'Other allowances', lineKind: 'EARNING' },
  ],
};
export const useGetSalaryTemplateQuery = () => ({
  data: salaryTemplate,
  refetch: async () => ({ data: salaryTemplate }),
});
export const useGetSalaryTemplateVersionsQuery = () => ({ data: { items: [] } });
export const useGetSalaryTemplateComponentCatalogQuery = () => ({
  data: catalog,
  refetch: async () => ({ data: catalog }),
});
export const useCreateSalaryTemplateMutation = () => [
  () => ({ unwrap: async () => salaryTemplate }),
  {},
];
export const useUpdateSalaryTemplateMutation = useCreateSalaryTemplateMutation;
export const usePreviewSalaryTemplateMutation = () => [
  (input: { monthlyAmount: number }) => ({
    requestId: 'synthetic-preview',
    unwrap: async () => ({
      isSample: true,
      previewToken: 'synthetic-proof',
      expiresAt: new Date(Date.now() + 1800000).toISOString(),
      calculation: {
        grossSalary: input.monthlyAmount,
        totalDeductions: 0,
        netSalary: input.monthlyAmount,
        employerCost: input.monthlyAmount,
        employerContributionTotal: 0,
        earnings: [],
        deductions: [],
        employerContributions: [],
        statutorySummary: [],
        warnings: [],
        targetResult: { isExact: true, difference: 0 },
        employeeStateInsurance: { managementMode: 'EXTERNAL', canCalculate: true, issueCodes: [] },
      },
    }),
  }),
  {},
];

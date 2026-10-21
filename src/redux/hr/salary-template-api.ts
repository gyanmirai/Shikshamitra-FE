import { api } from 'src/redux/service';
import { payrollStructureType } from 'src/redux/tagTypes';

import type { EsiManagementMode } from './esi-policy-api';
import type { StaffStatutoryProfile } from './statutory-profile-api';

export type SalaryBasis = 'GROSS' | 'EMPLOYER_COST';
export type ProtectionPolicy = 'PROTECT_GROSS' | 'PROTECT_TAKE_HOME' | 'PROTECT_EMPLOYER_COST';

export type SalaryTemplateRule = {
  code: string;
  componentId: string;
  lineKind: 'EARNING' | 'DEDUCTION';
  formulaType: string;
  semanticType: string;
  value?: number | null;
  basisCode?: string | null;
  basisComponentId?: string | null;
  displayOrder: number;
};

export type SalaryRuleOverride = {
  componentId: string;
  formulaType: string;
  value?: number | null;
  basisComponentId?: string | null;
};

export type SalaryTemplateComponentCatalogItem = {
  calculationType?: string;
  calculationBase?: string | null;
  defaultValue?: number | null;
  basisComponentId?: string | null;
  componentId: string;
  name: string;
  description?: string | null;
  lineKind: 'EARNING' | 'DEDUCTION';
};

export type SalaryTemplateVersion = {
  id: string;
  versionNumber: number;
  status: 'ACTIVE' | 'REPLACED' | 'RECOVERED';
  activatedAt?: string | null;
  defaultSalaryBasis: SalaryBasis;
  defaultProtectionPolicy: ProtectionPolicy;
  defaultPfApplicable: boolean;
  defaultPfRuleId?: string | null;
  defaultEsiManagementMode?: EsiManagementMode;
  defaultEsiPolicyId?: string | null;
  defaultEsiExternalReason?: string | null;
  rules: SalaryTemplateRule[];
};

export type SalaryTemplate = {
  id: string;
  name: string;
  description?: string | null;
  status: 'ACTIVE' | 'NEEDS_SETUP' | 'ARCHIVED';
  isDefault: boolean;
  activeVersion?: number | null;
  versionCount: number;
  updatedAt: string;
  concurrencyStamp: string;
  editableVersion: SalaryTemplateVersion;
};

export type SaveSalaryTemplate = {
  previewToken: string;
  sampleMonthlyAmount: number;
  sampleEffectiveMonth: string;
  name: string;
  description?: string | null;
  defaultSalaryBasis: SalaryBasis;
  defaultPfApplicable: boolean;
  defaultPfRuleId?: string | null;
  defaultEsiManagementMode?: EsiManagementMode;
  defaultEsiPolicyId?: string | null;
  defaultEsiExternalReason?: string | null;
  rules: SalaryTemplateRule[];
  idempotencyKey: string;
  expectedActiveVersionId?: string | null;
  concurrencyStamp?: string | null;
};

export type PreviewSalaryTemplateRequest = {
  templateId?: string | null;
  expectedActiveVersionId?: string | null;
  concurrencyStamp?: string | null;
  rules: SalaryTemplateRule[];
  salaryBasis: SalaryBasis;
  monthlyAmount: number;
  effectiveMonth: string;
  pfApplicable: boolean;
  pfRuleId?: string | null;
  esiManagementMode?: EsiManagementMode;
  esiPolicyId?: string | null;
  esiExternalReason?: string | null;
};

export type SalaryTemplatePreview = {
  isSample: boolean;
  previewToken: string;
  expiresAt: string;
  calculation: SalaryTemplateCalculation;
};

export type CalculatedSalaryLine = {
  componentId: string;
  code: string;
  name: string;
  amount: number;
  semanticType: string;
  formulaType: string;
  isStatutory: boolean;
  lineSource: 'TEMPLATE' | 'CUSTOMIZED' | 'SYSTEM_STATUTORY';
  persistable: boolean;
};

export type SalaryTemplateEsiPreview = {
  policyId?: string | null;
  policyName?: string | null;
  managementMode?: EsiManagementMode;
  configurationId?: string | null;
  isConfigured: boolean;
  isCovered: boolean;
  canCalculate: boolean;
  registrationPending: boolean;
  coverageDecision?: string | null;
  statutoryWages: number;
  wageCeiling: number;
  employeeContribution: number;
  employerContribution: number;
  governmentContribution: number;
  ruleId?: string | null;
  ruleVersion?: number | null;
  issueCodes: string[];
};

export type PfEnrollment = {
  membership: 'UNKNOWN' | 'EXISTING_MEMBER' | 'NOT_MEMBER';
  consentReference?: string | null;
};
export type PfEligibility = {
  grossSalary?: number | null;
  status: string;
  wages: number;
  coverageCeiling: number;
  enrollmentRequired: boolean;
  canSave: boolean;
  issueCode?: string | null;
};
export type SalaryTemplateCalculation = {
  statutorySummary: import('./compensation-revision-api').SalaryStatutorySummary[];
  pfEnrollment?: PfEnrollment;
  pfEligibility?: PfEligibility;
  templateId: string;
  templateVersionId: string;
  templateVersion: number;
  salaryBasis: SalaryBasis;
  protectionPolicy: ProtectionPolicy;
  quotedMonthlyAmount: number;
  effectiveMonth: string;
  grossSalary: number;
  basicSalary: number;
  totalDeductions: number;
  netSalary: number;
  employerContributionTotal: number;
  employerCost: number;
  protectedMonthlyAmount: number;
  targetResult: {
    requested: number;
    achieved: number;
    difference: number;
    isExact: boolean;
    isExplainedByEnrollment?: boolean;
  };
  employeeStateInsurance: SalaryTemplateEsiPreview;
  earnings: CalculatedSalaryLine[];
  deductions: CalculatedSalaryLine[];
  employerContributions: CalculatedSalaryLine[];
  formulaTrace: string[];
  warnings: string[];
  pfRuleId?: string | null;
  esiManagementMode?: EsiManagementMode;
  esiPolicyId?: string | null;
  esiExternalReason?: string | null;
  pfRuleVersion?: number | null;
  professionalTaxProfile: string;
  generatedAt: string;
};

export const salaryTemplateEndpoint = '/payroll/salary-templates';
export const salaryTemplateComponentCatalogEndpoint = `${salaryTemplateEndpoint}/component-catalog`;

export const buildSaveSalaryTemplateRequest = (body: SaveSalaryTemplate, templateId?: string) => ({
  url: templateId ? `${salaryTemplateEndpoint}/${templateId}` : salaryTemplateEndpoint,
  method: templateId ? ('PUT' as const) : ('POST' as const),
  body,
});

export const buildSalaryTemplateCalculationRequest = ({
  templateVersionId,
  ...body
}: {
  statutoryProfileOverride?: StaffStatutoryProfile;
  statutoryProfileConcurrencyStamp?: string | null;
  statutoryProfileUpdatePf?: boolean;
  statutoryProfileUpdateEsic?: boolean;
  templateVersionId: string;
  salaryBasis: SalaryBasis;
  monthlyAmount: number;
  effectiveMonth: string;
  employeeId?: string | null;
  pfEnrollment?: PfEnrollment;
  pfApplicable: boolean;
  pfRuleId?: string | null;
  esiManagementMode?: EsiManagementMode;
  esiPolicyId?: string | null;
  esiExternalReason?: string | null;
  overrides?: SalaryRuleOverride[];
  customizationReason?: string | null;
}) => ({
  url: `${salaryTemplateEndpoint}/versions/${templateVersionId}/calculate`,
  method: 'POST' as const,
  body: { ...body, statutoryProfile: 'IN-GJ' },
});

export const salaryTemplateApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSalaryTemplates: builder.query<{ items: SalaryTemplate[] }, void>({
      query: () => salaryTemplateEndpoint,
      providesTags: [payrollStructureType.salaryTemplate],
    }),
    getActiveSalaryTemplates: builder.query<{ items: SalaryTemplate[] }, void>({
      query: () => `${salaryTemplateEndpoint}/active`,
      providesTags: [payrollStructureType.salaryTemplate],
    }),
    getSalaryTemplate: builder.query<SalaryTemplate, string>({
      query: (id) => `${salaryTemplateEndpoint}/${id}`,
      providesTags: [payrollStructureType.salaryTemplate],
    }),
    getSalaryTemplateVersions: builder.query<{ items: SalaryTemplateVersion[] }, string>({
      query: (id) => `${salaryTemplateEndpoint}/${id}/versions`,
      providesTags: [payrollStructureType.salaryTemplate],
    }),
    getSalaryTemplateComponentCatalog: builder.query<
      { items: SalaryTemplateComponentCatalogItem[] },
      void
    >({
      query: () => salaryTemplateComponentCatalogEndpoint,
      providesTags: [payrollStructureType.salaryTemplate],
    }),
    previewSalaryTemplate: builder.mutation<SalaryTemplatePreview, PreviewSalaryTemplateRequest>({
      query: (body) => ({ url: `${salaryTemplateEndpoint}/preview`, method: 'POST', body }),
    }),
    calculateSalaryTemplate: builder.mutation<
      SalaryTemplateCalculation,
      Parameters<typeof buildSalaryTemplateCalculationRequest>[0]
    >({ query: buildSalaryTemplateCalculationRequest }),
    createSalaryTemplate: builder.mutation<SalaryTemplate, SaveSalaryTemplate>({
      query: (body) => buildSaveSalaryTemplateRequest(body),
      invalidatesTags: [payrollStructureType.salaryTemplate],
    }),
    updateSalaryTemplate: builder.mutation<
      SalaryTemplate,
      { templateId: string; body: SaveSalaryTemplate }
    >({
      query: ({ templateId, body }) => buildSaveSalaryTemplateRequest(body, templateId),
      invalidatesTags: [payrollStructureType.salaryTemplate],
    }),
    setDefaultSalaryTemplate: builder.mutation<SalaryTemplate, string>({
      query: (id) => ({ url: `${salaryTemplateEndpoint}/${id}/set-default`, method: 'POST' }),
      invalidatesTags: [payrollStructureType.salaryTemplate],
    }),
    archiveSalaryTemplate: builder.mutation<
      void,
      { id: string; replacementDefaultTemplateId?: string | null }
    >({
      query: ({ id, replacementDefaultTemplateId }) => ({
        url: `${salaryTemplateEndpoint}/${id}`,
        method: 'DELETE',
        params: replacementDefaultTemplateId ? { replacementDefaultTemplateId } : undefined,
      }),
      invalidatesTags: [payrollStructureType.salaryTemplate],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSalaryTemplatesQuery,
  useGetActiveSalaryTemplatesQuery,
  useGetSalaryTemplateQuery,
  useGetSalaryTemplateVersionsQuery,
  useGetSalaryTemplateComponentCatalogQuery,
  useCreateSalaryTemplateMutation,
  useUpdateSalaryTemplateMutation,
  useCalculateSalaryTemplateMutation,
  usePreviewSalaryTemplateMutation,
  useSetDefaultSalaryTemplateMutation,
  useArchiveSalaryTemplateMutation,
} = salaryTemplateApi;

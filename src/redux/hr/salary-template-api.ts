import { api } from 'src/redux/service';
import { payrollStructureType } from 'src/redux/tagTypes';

export type SalaryBasis = 'GROSS' | 'TAKE_HOME' | 'EMPLOYER_COST';
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

export type SalaryTemplateComponentCatalogItem = {
  componentId: string;
  name: string;
  description?: string | null;
  lineKind: 'EARNING' | 'DEDUCTION';
};

export type SalaryTemplate = {
  id: string;
  name: string;
  description?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isDefault: boolean;
  latestVersion: number;
  publishedVersion?: number | null;
  latest: SalaryTemplateVersion;
  published?: SalaryTemplateVersion | null;
};

export type SalaryTemplateVersion = {
  id: string;
  versionNumber: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: string | null;
  defaultSalaryBasis: SalaryBasis;
  defaultProtectionPolicy: ProtectionPolicy;
  rules: SalaryTemplateRule[];
};

export type CalculatedSalaryLine = {
  componentId: string;
  code: string;
  name: string;
  amount: number;
  semanticType: string;
  formulaType: string;
  isStatutory: boolean;
  lineSource: 'TEMPLATE' | 'SYSTEM_STATUTORY';
  persistable: boolean;
};

export type SalaryTemplateTargetResult = {
  requested: number;
  achieved: number;
  difference: number;
  isExact: boolean;
};

export type SalaryTemplateEsiPreview = {
  isConfigured: boolean;
  isCovered: boolean;
  canCalculate: boolean;
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

export type SalaryTemplateCalculation = {
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
  targetResult: SalaryTemplateTargetResult;
  employeeStateInsurance: SalaryTemplateEsiPreview;
  earnings: CalculatedSalaryLine[];
  deductions: CalculatedSalaryLine[];
  employerContributions: CalculatedSalaryLine[];
  formulaTrace: string[];
  warnings: string[];
  pfRuleId?: string | null;
  pfRuleVersion?: number | null;
  professionalTaxProfile: string;
  generatedAt: string;
};

export const salaryTemplateEndpoint = '/payroll/salary-templates';
export const salaryTemplateComponentCatalogEndpoint = `${salaryTemplateEndpoint}/component-catalog`;

export const buildCreateSalaryTemplateRequest = (body: {
  name: string;
  description?: string | null;
}) => ({
  url: salaryTemplateEndpoint,
  method: 'POST' as const,
  body,
});

export const buildSalaryTemplateCalculationRequest = ({
  templateVersionId,
  salaryBasis,
  monthlyAmount,
  protectionPolicy,
  effectiveMonth,
  employeeId,
  pfRuleId,
}: {
  templateVersionId: string;
  salaryBasis: SalaryBasis;
  protectionPolicy: ProtectionPolicy;
  monthlyAmount: number;
  effectiveMonth: string;
  employeeId?: string | null;
  pfRuleId?: string | null;
}) => ({
  url: `${salaryTemplateEndpoint}/versions/${templateVersionId}/calculate`,
  method: 'POST' as const,
  body: {
    salaryBasis,
    protectionPolicy,
    monthlyAmount,
    effectiveMonth,
    employeeId,
    pfRuleId,
    statutoryProfile: 'IN-GJ',
  },
});

export const salaryTemplateApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSalaryTemplates: builder.query<{ items: SalaryTemplate[] }, void>({
      query: () => salaryTemplateEndpoint,
      providesTags: [payrollStructureType.salaryTemplate],
    }),
    getSalaryTemplate: builder.query<SalaryTemplate, string>({
      query: (id) => `${salaryTemplateEndpoint}/${id}`,
      providesTags: [payrollStructureType.salaryTemplate],
    }),
    getSalaryTemplateComponentCatalog: builder.query<
      { items: SalaryTemplateComponentCatalogItem[] },
      void
    >({
      query: () => salaryTemplateComponentCatalogEndpoint,
      providesTags: [payrollStructureType.salaryTemplate],
    }),
    getPublishedSalaryTemplates: builder.query<{ items: SalaryTemplate[] }, void>({
      query: () => `${salaryTemplateEndpoint}/published`,
      providesTags: [payrollStructureType.salaryTemplate],
    }),
    calculateSalaryTemplate: builder.mutation<
      SalaryTemplateCalculation,
      {
        templateVersionId: string;
        salaryBasis: SalaryBasis;
        protectionPolicy: ProtectionPolicy;
        monthlyAmount: number;
        effectiveMonth: string;
        employeeId?: string | null;
        pfRuleId?: string | null;
      }
    >({
      query: buildSalaryTemplateCalculationRequest,
    }),
    createSalaryTemplate: builder.mutation<
      SalaryTemplate,
      { name: string; description?: string | null }
    >({
      query: buildCreateSalaryTemplateRequest,
      invalidatesTags: [payrollStructureType.salaryTemplate],
    }),
    setDefaultSalaryTemplate: builder.mutation<SalaryTemplate, string>({
      query: (id) => ({
        url: `/payroll/salary-templates/${id}/set-default`,
        method: 'POST',
      }),
      invalidatesTags: [payrollStructureType.salaryTemplate],
    }),
    publishSalaryTemplate: builder.mutation<
      SalaryTemplate,
      { templateId: string; versionId: string }
    >({
      query: ({ templateId, versionId }) => ({
        url: `/payroll/salary-templates/${templateId}/versions/${versionId}/publish`,
        method: 'POST',
      }),
      invalidatesTags: [payrollStructureType.salaryTemplate],
    }),
    archiveSalaryTemplate: builder.mutation<void, string>({
      query: (id) => ({ url: `/payroll/salary-templates/${id}`, method: 'DELETE' }),
      invalidatesTags: [payrollStructureType.salaryTemplate],
    }),
    cloneSalaryTemplate: builder.mutation<SalaryTemplate, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/payroll/salary-templates/${id}/clone`,
        method: 'POST',
        params: { name },
      }),
      invalidatesTags: [payrollStructureType.salaryTemplate],
    }),
    createSalaryTemplateVersion: builder.mutation<SalaryTemplate, string>({
      query: (id) => ({
        url: `/payroll/salary-templates/${id}/versions`,
        method: 'POST',
      }),
      invalidatesTags: [payrollStructureType.salaryTemplate],
    }),
    updateSalaryTemplateDraft: builder.mutation<
      SalaryTemplate,
      {
        templateId: string;
        versionId: string;
        name: string;
        description?: string | null;
        defaultSalaryBasis: SalaryBasis;
        defaultProtectionPolicy: ProtectionPolicy;
        rules: SalaryTemplateRule[];
      }
    >({
      query: ({ templateId, versionId, ...body }) => ({
        url: `/payroll/salary-templates/${templateId}/versions/${versionId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [payrollStructureType.salaryTemplate],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSalaryTemplatesQuery,
  useGetSalaryTemplateQuery,
  useGetSalaryTemplateComponentCatalogQuery,
  useGetPublishedSalaryTemplatesQuery,
  useCreateSalaryTemplateMutation,
  useCalculateSalaryTemplateMutation,
  useSetDefaultSalaryTemplateMutation,
  usePublishSalaryTemplateMutation,
  useArchiveSalaryTemplateMutation,
  useCloneSalaryTemplateMutation,
  useCreateSalaryTemplateVersionMutation,
  useUpdateSalaryTemplateDraftMutation,
} = salaryTemplateApi;

import { employeeType } from 'src/redux/tagTypes';

import { employeeApi } from './employeeApi';

import type {
  SalaryBasis,
  ProtectionPolicy,
  SalaryRuleOverride,
  SalaryTemplatePreview,
} from './salary-template-api';

export type EmployeeActivationReadiness = {
  canActivate: boolean;
  requiredMonth: string;
  compensationRevisionId?: string | null;
  blockerCodes: string[];
};

export type CompensationRevisionStatus = 'EFFECTIVE' | 'SUPERSEDED' | 'LEGACY_NON_EFFECTIVE';

export type CompensationRevisionLine = {
  id: string;
  componentId?: string | null;
  name: string;
  description?: string | null;
  amount: number;
  isEarning: boolean;
  semanticType: string;
  source: 'TEMPLATE' | 'MANUAL' | 'LEGACY';
  displayOrder: number;
};

export type CompensationRevision = {
  protectionCalculationVersion?: number;
  id: string;
  employeeId: string;
  revisionNumber: number;
  effectiveMonth: string;
  status: CompensationRevisionStatus;
  isCurrent: boolean;
  isScheduled: boolean;
  salaryBasis: SalaryBasis;
  protectionPolicy: ProtectionPolicy;
  quotedMonthlyAmount: number;
  protectedMonthlyAmount: number;
  grossSalary: number;
  netSalary: number;
  employerCost: number;
  sourceSalaryTemplateId?: string | null;
  sourceSalaryTemplateVersionId?: string | null;
  sourceSalaryTemplateVersion?: number | null;
  pfRuleId?: string | null;
  statutoryProfile: string;
  isCustomized: boolean;
  overrides: SalaryRuleOverride[];
  customizationReason?: string | null;
  warnings: string[];
  activationReadiness: EmployeeActivationReadiness;
  creatorId?: string | null;
  savedByUserId?: string | null;
  savedAt?: string | null;
  lines: CompensationRevisionLine[];
};

export type SaveEmployeeCompensation = {
  templateVersionId: string;
  salaryBasis: SalaryBasis;
  protectionPolicy: ProtectionPolicy;
  monthlyAmount: number;
  effectiveMonth: string;
  pfApplicable: boolean;
  pfRuleId?: string | null;
  statutoryProfile: 'IN-GJ';
  overrides: SalaryRuleOverride[];
  customizationReason?: string | null;
  idempotencyKey: string;
  expectedRevision?: number | null;
};

export const compensationEndpoint = (employeeId: string) =>
  `/payroll/employees/${employeeId}/compensation`;

export type ProtectionMigrationPreview = {
  sourceRevisionId: string;
  previousPolicy: string;
  previousGross: number;
  previousNet: number;
  previousEmployerCost: number;
  preview: SalaryTemplatePreview;
};

export const buildSaveEmployeeCompensationRequest = (
  employeeId: string,
  body: SaveEmployeeCompensation
) => ({
  url: compensationEndpoint(employeeId),
  method: 'PUT' as const,
  body,
});

export const compensationRevisionApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    previewProtectionMigration: builder.mutation<ProtectionMigrationPreview,
      { employeeId: string; sourceRevisionId: string; effectiveMonth: string }>({
      query: ({ employeeId, ...body }) => ({
        url: `${compensationEndpoint(employeeId)}/protection-migration/preview`, method: 'POST', body,
      }),
    }),
    applyProtectionMigration: builder.mutation<CompensationRevision,
      { employeeId: string; sourceRevisionId: string; effectiveMonth: string; previewToken: string }>({
      query: ({ employeeId, ...body }) => ({
        url: `${compensationEndpoint(employeeId)}/protection-migration/apply`, method: 'POST', body,
      }),
      invalidatesTags: [employeeType.salaryStructure, employeeType.employee, employeeType.runPayroll],
    }),
    getCompensationRevisions: builder.query<{ items: CompensationRevision[] }, string>({
      query: compensationEndpoint,
      providesTags: [employeeType.salaryStructure],
    }),
    getEffectiveCompensationRevision: builder.query<
      CompensationRevision | null,
      { employeeId: string; month: string }
    >({
      query: ({ employeeId, month }) => ({
        url: `${compensationEndpoint(employeeId)}/effective`,
        params: { month },
      }),
      providesTags: [employeeType.salaryStructure],
    }),
    saveEmployeeCompensation: builder.mutation<
      CompensationRevision,
      { employeeId: string; body: SaveEmployeeCompensation }
    >({
      query: ({ employeeId, body }) => buildSaveEmployeeCompensationRequest(employeeId, body),
      invalidatesTags: [employeeType.salaryStructure, employeeType.employee],
    }),
    getEmployeeActivationReadiness: builder.query<EmployeeActivationReadiness, string>({
      query: (employeeId) => `/employees/${employeeId}/activation-readiness`,
      providesTags: [employeeType.salaryStructure, employeeType.employee],
    }),
  }),
  overrideExisting: false,
});

export const {
  usePreviewProtectionMigrationMutation,
  useApplyProtectionMigrationMutation,
  useGetCompensationRevisionsQuery,
  useGetEffectiveCompensationRevisionQuery,
  useSaveEmployeeCompensationMutation,
  useGetEmployeeActivationReadinessQuery,
} = compensationRevisionApi;

import { employeeType, payrollStructureType } from 'src/redux/tagTypes';

import { employeeApi } from './employeeApi';

import type { SalaryBasis, ProtectionPolicy, SalaryRuleOverride } from './salary-template-api';

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
  estimatedStatutoryDeductions?: Array<{ code: string; name: string; amount: number }>;
};

export type SaveEmployeeCompensation = {
  templateVersionId: string;
  salaryBasis: SalaryBasis;
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
      providesTags: [
        employeeType.salaryStructure,
        employeeType.employee,
        payrollStructureType.statutoryScheme,
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCompensationRevisionsQuery,
  useGetEffectiveCompensationRevisionQuery,
  useSaveEmployeeCompensationMutation,
  useGetEmployeeActivationReadinessQuery,
} = compensationRevisionApi;

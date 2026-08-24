import { employeeType } from 'src/redux/tagTypes';

import type { ProtectionPolicy, SalaryBasis } from './salary-template-api';

import { employeeApi } from './employeeApi';

export type CompensationRevisionStatus =
  'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUPERSEDED';

export type CompensationRevisionLine = {
  id: string;
  componentId?: string | null;
  name: string;
  description?: string | null;
  amount: number;
  isEarning: boolean;
  semanticType: string;
  source: 'TEMPLATE' | 'SYSTEM_STATUTORY' | 'MANUAL';
  displayOrder: number;
};

export type CompensationRevision = {
  id: string;
  employeeId: string;
  revisionNumber: number;
  effectiveMonth: string;
  status: CompensationRevisionStatus;
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
  creatorId?: string | null;
  submittedByUserId?: string | null;
  submittedAt?: string | null;
  approvedByUserId?: string | null;
  approvedAt?: string | null;
  rejectedByUserId?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  lines: CompensationRevisionLine[];
};

export type CompensationRevisionQuote = {
  templateVersionId: string;
  salaryBasis: SalaryBasis;
  protectionPolicy: ProtectionPolicy;
  monthlyAmount: number;
  effectiveMonth: string;
  pfRuleId?: string | null;
  statutoryProfile: 'IN-GJ';
};

export const compensationRevisionEndpoint = (employeeId: string) =>
  `/payroll/employees/${employeeId}/compensation-revisions`;

export const buildCreateCompensationRevisionRequest = (
  employeeId: string,
  quote: CompensationRevisionQuote
) => ({
  url: compensationRevisionEndpoint(employeeId),
  method: 'POST' as const,
  body: quote,
});

export const buildCompensationRevisionActionRequest = (
  employeeId: string,
  revisionId: string,
  action: 'submit' | 'approve'
) => ({
  url: `${compensationRevisionEndpoint(employeeId)}/${revisionId}/${action}`,
  method: 'POST' as const,
});

export const compensationRevisionApi = employeeApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompensationRevisions: builder.query<{ items: CompensationRevision[] }, string>({
      query: compensationRevisionEndpoint,
      providesTags: [employeeType.salaryStructure],
    }),
    getEffectiveCompensationRevision: builder.query<
      CompensationRevision | null,
      { employeeId: string; month: string }
    >({
      query: ({ employeeId, month }) => ({
        url: `${compensationRevisionEndpoint(employeeId)}/effective`,
        params: { month },
      }),
      providesTags: [employeeType.salaryStructure],
    }),
    createCompensationRevision: builder.mutation<
      CompensationRevision,
      { employeeId: string; quote: CompensationRevisionQuote }
    >({
      query: ({ employeeId, quote }) => buildCreateCompensationRevisionRequest(employeeId, quote),
      invalidatesTags: [employeeType.salaryStructure],
    }),
    updateCompensationRevision: builder.mutation<
      CompensationRevision,
      { employeeId: string; revisionId: string; quote: CompensationRevisionQuote }
    >({
      query: ({ employeeId, revisionId, quote }) => ({
        url: `${compensationRevisionEndpoint(employeeId)}/${revisionId}`,
        method: 'PUT',
        body: quote,
      }),
      invalidatesTags: [employeeType.salaryStructure],
    }),
    submitCompensationRevision: builder.mutation<
      CompensationRevision,
      { employeeId: string; revisionId: string }
    >({
      query: ({ employeeId, revisionId }) =>
        buildCompensationRevisionActionRequest(employeeId, revisionId, 'submit'),
      invalidatesTags: [employeeType.salaryStructure],
    }),
    approveCompensationRevision: builder.mutation<
      CompensationRevision,
      { employeeId: string; revisionId: string }
    >({
      query: ({ employeeId, revisionId }) =>
        buildCompensationRevisionActionRequest(employeeId, revisionId, 'approve'),
      invalidatesTags: [employeeType.salaryStructure],
    }),
    rejectCompensationRevision: builder.mutation<
      CompensationRevision,
      { employeeId: string; revisionId: string; reason: string }
    >({
      query: ({ employeeId, revisionId, reason }) => ({
        url: `${compensationRevisionEndpoint(employeeId)}/${revisionId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [employeeType.salaryStructure],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCompensationRevisionsQuery,
  useGetEffectiveCompensationRevisionQuery,
  useCreateCompensationRevisionMutation,
  useUpdateCompensationRevisionMutation,
  useSubmitCompensationRevisionMutation,
  useApproveCompensationRevisionMutation,
  useRejectCompensationRevisionMutation,
} = compensationRevisionApi;

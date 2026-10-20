import { api } from 'src/redux/service';
import { employeeType, payrollStructureType } from 'src/redux/tagTypes';

import type { EsiRule } from './statutory-scheme-api';
import type { EsiCalculationSettings } from './esi-configuration-api';

export type EsiManagementMode = 'IN_PLATFORM' | 'EXTERNAL';
export type EsiPolicyVersion = EsiRule & {
  appliesUntil?: string | null;
  calculationSettings?: EsiCalculationSettings | null;
};
export type EsiPolicy = {
  id: string;
  name: string;
  code: string;
  isDefault: boolean;
  isArchived: boolean;
  concurrencyStamp: string;
  versions: EsiPolicyVersion[];
};
export type EsiPolicyVersionInput = {
  effectiveFrom: string;
  employeePercentage: number;
  employerPercentage: number;
  standardWageCeiling: number;
  disabilityWageCeiling: number;
  employeeShareDailyWageExemption: number;
  establishmentThreshold: number;
  exclusionCapPercentage: number;
  inKindCapPercentage: number;
  roundingPolicy: string;
  sourceUrl: string;
  sourceVerifiedOn: string;
  calculationSettings: EsiCalculationSettings;
  concurrencyStamp: string;
  idempotencyKey: string;
};
export const effectiveEsiPolicyVersion = (policy: EsiPolicy | undefined, month: string) => {
  const version = policy?.versions
    .filter((item) => item.effectiveFrom.slice(0, 7) <= month)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom) || b.version - a.version)[0];
  return version && (!version.effectiveTo || version.effectiveTo.slice(0, 7) >= month)
    ? version
    : undefined;
};
const endpoint = '/payroll/statutory-schemes/esi/policies';
const tags = [payrollStructureType.statutoryScheme];
const payrollTags = [
  ...tags,
  payrollStructureType.salaryTemplate,
  employeeType.employeePayroll,
  employeeType.salaryStructure,
  employeeType.runPayroll,
];
export const esiPolicyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEsiPolicies: builder.query<EsiPolicy[], void>({
      query: () => endpoint,
      providesTags: tags,
    }),
    getEsiPolicyOptions: builder.query<EsiPolicy[], void>({
      query: () => `${endpoint}/options`,
      providesTags: tags,
    }),
    createEsiPolicy: builder.mutation<
      EsiPolicy,
      EsiPolicyVersionInput & { name: string; code: string }
    >({
      query: (body) => ({ url: endpoint, method: 'POST', body }),
      invalidatesTags: payrollTags,
    }),
    addEsiPolicyVersion: builder.mutation<EsiPolicy, { id: string; body: EsiPolicyVersionInput }>({
      query: ({ id, body }) => ({ url: `${endpoint}/${id}/versions`, method: 'POST', body }),
      invalidatesTags: payrollTags,
    }),
    archiveEsiPolicy: builder.mutation<void, { id: string; concurrencyStamp: string }>({
      query: ({ id, concurrencyStamp }) => ({
        url: `${endpoint}/${id}/archive`,
        method: 'POST',
        body: { concurrencyStamp },
      }),
      invalidatesTags: payrollTags,
    }),
  }),
});
export const {
  useGetEsiPoliciesQuery,
  useGetEsiPolicyOptionsQuery,
  useCreateEsiPolicyMutation,
  useAddEsiPolicyVersionMutation,
  useArchiveEsiPolicyMutation,
} = esiPolicyApi;

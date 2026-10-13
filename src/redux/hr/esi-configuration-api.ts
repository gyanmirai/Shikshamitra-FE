import { api } from 'src/redux/service';
import { employeeType, payrollStructureType } from 'src/redux/tagTypes';

import type { EsiComponentTreatment } from './statutory-scheme-api';

export type EsiSalaryBasis = 'CLASSIFIED_EARNINGS' | 'GROSS' | 'BASIC_COMPONENT';
export type EsiCalculationSettings = {
  eligibilityBasis: EsiSalaryBasis;
  calculationBasis: EsiSalaryBasis;
  basicComponentId?: string | null;
  employeePercentage?: number | null;
  employerPercentage?: number | null;
  overrideReason?: string | null;
  evidenceReference?: string | null;
};
export type EsiConfigurationDraft = {
  effectiveMonth?: string;
  calculationSettings: EsiCalculationSettings;
  concurrencyStamp: string;
  enabled: boolean;
  registrationNumber: string;
  coveredSince: string | null;
  treatments: Pick<EsiComponentTreatment, 'componentId' | 'treatment'>[];
};
export type EsiConfigurationVersion = Omit<
  EsiConfigurationDraft,
  'treatments' | 'registrationNumber' | 'calculationSettings'
> & {
  calculationSettings?: EsiCalculationSettings;
  registrationNumber: string | null;
  effectiveMonth: string;
  id: string;
  isCancelled: boolean;
  cancellationReason?: string;
  concurrencyStamp: string;
};
export type EsiConfigurationSettings = {
  hasSchoolWideScope: boolean;
  current: EsiConfigurationVersion | null;
  history: EsiConfigurationVersion[];
  suggestedEffectiveMonth: string;
};
const endpoint = '/payroll/statutory-schemes/esi/configuration';
const tags = [payrollStructureType.statutoryScheme];
const payrollTags = [
  ...tags,
  employeeType.runPayroll,
  employeeType.salarySlip,
  employeeType.employeePayroll,
  employeeType.salaryStructure,
  payrollStructureType.salaryTemplate,
];
export const esiConfigurationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEsiConfiguration: builder.query<EsiConfigurationSettings, void>({
      query: () => endpoint,
      providesTags: tags,
    }),
    saveEsiConfiguration: builder.mutation<
      EsiConfigurationSettings,
      EsiConfigurationDraft & { idempotencyKey: string }
    >({
      query: (body) => ({ url: endpoint, method: 'PUT', body }),
      invalidatesTags: payrollTags,
    }),
  }),
});
export const { useGetEsiConfigurationQuery, useSaveEsiConfigurationMutation } = esiConfigurationApi;

import { api } from 'src/redux/service';
import { payrollStructureType } from 'src/redux/tagTypes';

export type EsiRule = {
  id: string;
  schemeCode: 'ESI';
  jurisdictionCode: 'IN-GJ';
  version: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  establishmentThreshold: number;
  standardWageCeiling: number;
  disabilityWageCeiling: number;
  employeePercentage: number;
  employerPercentage: number;
  exclusionCapPercentage: number;
  inKindCapPercentage: number;
  roundingPolicy: string;
  sourceUrl: string;
  sourceVerifiedOn: string;
};

export type EsiEstablishment = {
  id?: string | null;
  schemeCode: 'ESI';
  jurisdictionCode: 'IN-GJ';
  registrationNumber?: string | null;
  employeeCount: number;
  coveredSince?: string | null;
  benefitsActiveFrom?: string | null;
  status: 'Draft' | 'Ready' | 'Active' | 'Suspended';
  evidenceReference?: string | null;
  confirmedByUserId?: string | null;
  confirmedAt?: string | null;
  canActivate: boolean;
};

export type EsiComponentTreatment = {
  componentId: string;
  componentName: string;
  treatment: 'Unclassified' | 'Included' | 'SpecifiedExclusion' | 'OtherExclusion' | 'InKind';
  effectiveFrom: string;
  effectiveTo?: string | null;
};

export type EsiEnrollment = {
  id?: string | null;
  employeeId: string;
  schemeCode: 'ESI';
  status: 'PendingReview' | 'Covered' | 'NotCovered' | 'Exited' | 'RegistrationPending';
  wageCeilingCategory: 'Standard' | 'PersonWithDisability';
  insuranceNumber?: string | null;
  coveredFrom?: string | null;
  coveredTo?: string | null;
  contributionPeriodEnd?: string | null;
  statusReason?: string | null;
  employerShareReliefEligible: boolean;
  employerShareReliefFrom?: string | null;
  employerShareReliefTo?: string | null;
  disabilityEvidenceReference?: string | null;
};

export type EsiEmployeeImpact = {
  employeeId: string;
  employeeIdentifier: string;
  employeeName: string;
  isCovered: boolean;
  canCalculate: boolean;
  coverageDecision: string;
  statutoryWages: number;
  wageCeiling: number;
  employeeContribution: number;
  employerContribution: number;
  governmentContribution: number;
  enrollmentStatus: EsiEnrollment['status'];
  wageCeilingCategory: EsiEnrollment['wageCeilingCategory'];
  insuranceNumber?: string | null;
  contributionPeriodEnd?: string | null;
  issueCodes: string[];
};

export type EsiStatutoryOverride = {
  id: string;
  employeeId: string;
  schemeCode: 'ESI';
  overrideType: 'ForceCovered' | 'ForceNotCovered' | 'EmployeeAmount' | 'EmployerAmount';
  amount?: number | null;
  reason: string;
  evidenceReference?: string | null;
  effectiveFrom: string;
  effectiveTo: string;
  approvedByUserId?: string | null;
  approvedAt: string;
};

export type EsiImpactPreview = {
  schemeCode: 'ESI';
  monthYear: string;
  employeeCount: number;
  coveredEmployeeCount: number;
  employeeContributionTotal: number;
  employerContributionTotal: number;
  governmentContributionTotal: number;
  canActivate: boolean;
  blockingIssueCodes: string[];
  employees: EsiEmployeeImpact[];
};

export const esiStatutoryEndpoint = '/payroll/statutory-schemes/esi';

export const buildEsiImpactPreviewRequest = (monthYear: string) => ({
  url: `${esiStatutoryEndpoint}/impact-preview`,
  method: 'POST' as const,
  body: { monthYear },
});

export const statutorySchemeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEsiRule: builder.query<EsiRule, string | void>({
      query: (effectiveOn) => ({
        url: `${esiStatutoryEndpoint}/rule`,
        params: effectiveOn ? { effectiveOn } : undefined,
      }),
      providesTags: [payrollStructureType.statutoryScheme],
    }),
    getEsiEstablishment: builder.query<EsiEstablishment, void>({
      query: () => `${esiStatutoryEndpoint}/establishment`,
      providesTags: [payrollStructureType.statutoryScheme],
    }),
    configureEsiEstablishment: builder.mutation<
      EsiEstablishment,
      {
        jurisdictionCode: 'IN-GJ';
        registrationNumber?: string | null;
        employeeCount: number;
        coveredSince?: string | null;
        benefitsActiveFrom?: string | null;
        evidenceReference?: string | null;
      }
    >({
      query: (body) => ({ url: `${esiStatutoryEndpoint}/establishment`, method: 'PUT', body }),
      invalidatesTags: [payrollStructureType.statutoryScheme],
    }),
    getEsiComponentTreatments: builder.query<EsiComponentTreatment[], string | void>({
      query: (effectiveOn) => ({
        url: `${esiStatutoryEndpoint}/component-treatments`,
        params: effectiveOn ? { effectiveOn } : undefined,
      }),
      providesTags: [payrollStructureType.statutoryScheme],
    }),
    updateEsiComponentTreatments: builder.mutation<
      EsiComponentTreatment[],
      { items: EsiComponentTreatment[] }
    >({
      query: (body) => ({
        url: `${esiStatutoryEndpoint}/component-treatments`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [payrollStructureType.statutoryScheme],
    }),
    getEsiEnrollment: builder.query<EsiEnrollment, string>({
      query: (employeeId) => `${esiStatutoryEndpoint}/employees/${employeeId}/enrollment`,
      providesTags: (_result, _error, employeeId) => [
        { type: payrollStructureType.statutoryScheme, id: employeeId },
      ],
    }),
    updateEsiEnrollment: builder.mutation<
      EsiEnrollment,
      { employeeId: string; body: Omit<EsiEnrollment, 'id' | 'employeeId' | 'schemeCode'> }
    >({
      query: ({ employeeId, body }) => ({
        url: `${esiStatutoryEndpoint}/employees/${employeeId}/enrollment`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { employeeId }) => [
        payrollStructureType.statutoryScheme,
        { type: payrollStructureType.statutoryScheme, id: employeeId },
      ],
    }),
    getEsiOverrides: builder.query<EsiStatutoryOverride[], string>({
      query: (employeeId) => `${esiStatutoryEndpoint}/employees/${employeeId}/overrides`,
      providesTags: (_result, _error, employeeId) => [
        { type: payrollStructureType.statutoryScheme, id: `override-${employeeId}` },
      ],
    }),
    createEsiOverride: builder.mutation<
      void,
      {
        employeeId: string;
        body: Omit<
          EsiStatutoryOverride,
          'id' | 'employeeId' | 'schemeCode' | 'approvedByUserId' | 'approvedAt'
        >;
      }
    >({
      query: ({ employeeId, body }) => ({
        url: `${esiStatutoryEndpoint}/employees/${employeeId}/overrides`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { employeeId }) => [
        payrollStructureType.statutoryScheme,
        { type: payrollStructureType.statutoryScheme, id: `override-${employeeId}` },
      ],
    }),
    previewEsiImpact: builder.mutation<EsiImpactPreview, { monthYear: string }>({
      query: ({ monthYear }) => buildEsiImpactPreviewRequest(monthYear),
    }),
    activateEsi: builder.mutation<EsiEstablishment, { monthYear: string }>({
      query: (body) => ({ url: `${esiStatutoryEndpoint}/activate`, method: 'POST', body }),
      invalidatesTags: [payrollStructureType.statutoryScheme],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEsiRuleQuery,
  useGetEsiEstablishmentQuery,
  useConfigureEsiEstablishmentMutation,
  useGetEsiComponentTreatmentsQuery,
  useUpdateEsiComponentTreatmentsMutation,
  useGetEsiEnrollmentQuery,
  useUpdateEsiEnrollmentMutation,
  useGetEsiOverridesQuery,
  useCreateEsiOverrideMutation,
  usePreviewEsiImpactMutation,
  useActivateEsiMutation,
} = statutorySchemeApi;

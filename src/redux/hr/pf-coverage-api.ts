import { api } from 'src/redux/service';
import { employeeType } from 'src/redux/tagTypes';

export type PfCoverageVersion = {
  id: string;
  effectiveMonth: string;
  isCovered: boolean;
  isHandledExternally?: boolean;
  evidenceReference: string;
  isCancelled: boolean;
};
export type PfCoverageSettings = { hasSchoolWideScope: boolean; history: PfCoverageVersion[] };
const endpoint = '/payroll/pf-rules/coverage';
export const pfCoverageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPfCoverage: builder.query<PfCoverageSettings, void>({
      query: () => endpoint,
      providesTags: [employeeType.pf],
    }),
    getSchoolPfManagement: builder.query<{ isHandledExternally: boolean }, string>({
      query: (effectiveMonth) => ({ url: `${endpoint}/management`, params: { effectiveMonth } }),
      providesTags: [employeeType.pf],
    }),
    savePfCoverage: builder.mutation<
      PfCoverageSettings,
      {
        effectiveMonth: string;
        isCovered: boolean;
        isHandledExternally?: boolean;
        evidenceReference?: string;
        expectedConfigurationId?: string | null;
        idempotencyKey: string;
      }
    >({
      query: (body) => ({ url: endpoint, method: 'PUT', body }),
      invalidatesTags: [employeeType.pf, employeeType.runPayroll, employeeType.salaryStructure],
    }),
  }),
});
export const { useGetPfCoverageQuery, useGetSchoolPfManagementQuery, useSavePfCoverageMutation } =
  pfCoverageApi;

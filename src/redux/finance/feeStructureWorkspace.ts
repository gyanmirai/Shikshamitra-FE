import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';
import { financeFeeStructureApi } from './financeFeeStructure';

export type PolicyFamily = 'collection' | 'concession' | 'refund';
export interface StructureInstallment {
  sourcePaymentTermInstallmentId: string;
  sequence: number;
  name: string;
  coverageStartDate: string | null;
  coverageEndDate: string | null;
  demandDate: string | null;
  dueDate: string | null;
  allocationPercentage: number | null;
}
export interface StructureLine {
  id?: string;
  feeHeadId: string;
  feeHeadName?: string;
  categoryName?: string;
  amount: number | null;
  isVariable?: boolean;
  isOneTime: boolean;
  isOptional: boolean;
  collectAtAdmission?: boolean;
  payableMonth: number;
  payableYear: number;
  paymentTermId: string | null;
  paymentTermVersionId: string | null;
  paymentTermName?: string;
  paymentTermVersionNumber?: number;
  scheduleMode: 'Inherited' | 'Customized';
  installmentOverrides: StructureInstallment[];
}
export interface StructureCandidate {
  name: string;
  concurrencyStamp?: string;
  saveAsDraft: boolean;
  feeHeads: StructureLine[];
  collectionPolicyId: string | null;
  collectionPolicyVersionId: string | null;
  concessionPolicyId: string | null;
  concessionPolicyVersionId: string | null;
  refundPolicyId: string | null;
  refundPolicyVersionId: string | null;
  concessionFeeHeadScope: 'EntireFeeStructure' | 'SelectedFeeHeads';
  concessionApplicableFeeHeadIds: string[];
}
export interface StructureRecord extends StructureCandidate {
  policyLabels?: Partial<Record<PolicyFamily, string>>;
  publicationReview?: StructurePreview;
  id: string;
  status: number;
  revisionNumber: number;
  revisionRootId: string;
  previousRevisionId?: string;
  creationTime: string;
  lastModificationTime?: string;
}
export interface StructureContext {
  academicYearId: string;
  academicYearName: string;
  className: string;
  boardId: string;
  startDate: string;
  endDate: string;
  permissions: Record<string, boolean>;
}
export interface StructureSettings extends StructureContext {
  heads: { id: string; name: string; categoryName: string; isConcessionApplied: boolean }[];
  policies: {
    id: string;
    versionId: string;
    family: PolicyFamily;
    name: string;
    versionNumber: number;
    isCurrent: boolean;
    isDefault?: boolean;
  }[];
  terms: {
    id: string;
    versionId: string;
    name: string;
    versionNumber: number;
    isCurrent: boolean;
    isDefault?: boolean;
    demandGenerationRule: string;
    demandOffsetDays?: number;
    installments: StructureInstallment[];
  }[];
  permissions: Record<string, boolean>;
}
export interface StructurePreview {
  policyLabels?: Partial<Record<PolicyFamily, string>>;
  isReady: boolean;
  errors: string[];
  warnings: string[];
  candidate: StructureCandidate;
  coverage: {
    feeHeadId: string;
    name: string;
    collection: string;
    concession: string;
    refund: string;
    accounting: string;
  }[];
  schedules: {
    feeHeadId: string;
    feeHeadName: string;
    annualAmount: number | null;
    paymentTermName: string;
    versionNumber: number;
    installments: {
      sequence: number;
      name: string;
      coverageStartDate: string;
      coverageEndDate: string;
      demandDate: string;
      dueDate: string;
      allocationPercentage: number;
      calculatedAmount: number | null;
    }[];
  }[];
}
export interface StructurePreviewRequest {
  requestId?: string;
  feeStructureMetadataId: string;
  standardId: string;
  structureId?: string;
  changes?: Record<string, unknown>;
  standardFeeStructures: StructureCandidate;
}

export interface StructureCopySource {
  standardId: string;
  className: string;
  structure: StructureRecord;
}

const classTags = (_r: unknown, error: unknown, arg: { standardId: string }) =>
  error
    ? []
    : [
        { type: financeModuleType.classWiseFeeStructure, id: arg.standardId },
        financeModuleType.feeStructure,
      ];
export const feeStructureWorkspaceApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getStructureCopySources: builder.query<
      StructureCopySource[],
      { feeStructureMetadataId: string; classes: { id: string; name: string }[] }
    >({
      // Metadata supplies only classes accessible in the current medium/year/board.
      // Reuse the scoped class read contract; do not fetch other metadata/mediums.
      async queryFn({ classes }, _api, _extra, baseQuery) {
        const results = await Promise.all(
          classes.map(async (item) => ({
            item,
            result: await baseQuery({ url: '/fee-structures', params: { standardId: item.id } }),
          }))
        );
        const failure = results.find(({ result }) => result.error);
        if (failure?.result.error) return { error: failure.result.error };
        return {
          data: results.flatMap(({ item, result }) => {
            const response = result.data as { standardFeeStructures: StructureRecord[] };
            return response.standardFeeStructures.map((structure) => ({
              standardId: item.id,
              className: item.name,
              structure,
            }));
          }),
        };
      },
      providesTags: [financeModuleType.classWiseFeeStructure, financeModuleType.feeStructure],
    }),
    getStructureContext: builder.query<
      StructureContext,
      { feeStructureMetadataId: string; standardId: string }
    >({
      query: (params) => ({ url: '/fee-structures/context', params }),
    }),
    previewStructure: builder.mutation<StructurePreview, StructurePreviewRequest>({
      query: (body) => ({ url: '/fee-structures/preview', method: 'POST', body }),
    }),
    saveStructureDraft: builder.mutation<StructureRecord, StructurePreviewRequest>({
      query: ({
        structureId,
        feeStructureMetadataId,
        standardId,
        standardFeeStructures,
        requestId,
        changes,
      }) =>
        structureId
          ? {
              url: `/fee-structures/${structureId}`,
              method: 'PATCH',
              body: {
                requestId,
                concurrencyStamp: standardFeeStructures.concurrencyStamp,
                changes,
              },
            }
          : {
              url: '/fee-structures',
              method: 'POST',
              params: { feeStructureMetadataId },
              body: { requestId, standardId, standardFeeStructures },
            },
      invalidatesTags: (result, error, arg) =>
        arg.structureId ? [] : classTags(result, error, arg),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            financeFeeStructureApi.util.updateQueryData(
              'getStandardFeeStructure',
              { standardId: arg.standardId },
              (draft) => {
                const index = draft.standardFeeStructures.findIndex(
                  (item: StructureRecord) => item.id === data.id
                );
                if (index >= 0) draft.standardFeeStructures[index] = data;
              }
            )
          );
        } catch {
          /* Keep the editor and its cache intact on failed saves. */
        }
      },
    }),
    publishStructure: builder.mutation<
      StructureRecord,
      { structureId: string; standardId: string; concurrencyStamp: string }
    >({
      query: ({ structureId, concurrencyStamp }) => ({
        url: `/fee-structures/${structureId}/publish`,
        method: 'POST',
        body: { concurrencyStamp },
      }),
      invalidatesTags: classTags,
    }),
    reviseStructure: builder.mutation<
      StructureRecord,
      { structureId: string; standardId: string; concurrencyStamp: string }
    >({
      query: ({ structureId, concurrencyStamp }) => ({
        url: `/fee-structures/${structureId}/revisions`,
        method: 'POST',
        body: { concurrencyStamp },
      }),
      invalidatesTags: classTags,
    }),
  }),
});
export const {
  useGetStructureCopySourcesQuery,
  useGetStructureContextQuery,
  usePreviewStructureMutation,
  useSaveStructureDraftMutation,
  usePublishStructureMutation,
  useReviseStructureMutation,
} = feeStructureWorkspaceApi;

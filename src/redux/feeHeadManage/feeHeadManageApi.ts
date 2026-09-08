import type { FeeHeadModule } from 'src/redux/feeHeadModule/feeHeadModuleApi';

import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../finance/financeModuleApi';

import type { IFeeHeadResponse } from '../feeCategory/feeCategoryApi';

export interface IFeeHeadListResponse {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  items: IFeeHeadResponse[];
}

export interface IActiveFeeHeadLookup {
  id: string;
  academicYearId: string;
  feeCategoryId: string;
  feeCategoryName: string;
  name: string;
  module: FeeHeadModule | null;
  isConcessionApplied: boolean;
}

export interface IFeeHeadCreateOrUpdateBody {
  feeCategoryId: string;
  name: string;
  module?: FeeHeadModule | null;
  isConcessionApplied: boolean;
  description?: string;
}

export interface IFeeHeadStatusUpdateBody {
  isActive: boolean;
  deactivationReason?: string | null;
}

export const FeeHeadManagementApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get fee head list
    getFeeHeads: builder.query<IFeeHeadListResponse, Record<string, unknown>>({
      query: (params) => ({
        url: '/fee-heads',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.feeHead],
    }),

    getActiveFeeHeads: builder.query<IActiveFeeHeadLookup[], string>({
      query: (academicYearId) => ({
        url: '/fee-heads/active',
        method: 'GET',
        params: { academicYearId },
      }),
      providesTags: [financeModuleType.feeHead],
    }),

    // Add fee head
    addFeeHead: builder.mutation<
      IFeeHeadResponse,
      { academicYearId: string; body: IFeeHeadCreateOrUpdateBody }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/fee-heads`,
        method: 'POST',
        body,
        params: {
          academicYearId,
        },
      }),
      invalidatesTags: [financeModuleType.feeHead, financeModuleType.feeCategory],
    }),

    // Update fee head
    updateFeeHead: builder.mutation<
      IFeeHeadResponse,
      { id: string; body: IFeeHeadCreateOrUpdateBody }
    >({
      query: ({ id, body }) => ({
        url: `/fee-heads/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.feeHead, financeModuleType.feeCategory],
    }),

    // Delete fee head
    deleteFeeHead: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/fee-heads/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.feeHead, financeModuleType.feeCategory],
    }),
    patchFeeHead: builder.mutation<
      IFeeHeadResponse,
      { feeHeadId: string; body: IFeeHeadStatusUpdateBody }
    >({
      query: ({ feeHeadId, body }) => ({
        url: `/fee-heads/${feeHeadId}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [financeModuleType.feeHead, financeModuleType.feeCategory],
    }),
  }),
});

export const {
  useGetFeeHeadsQuery,
  useLazyGetFeeHeadsQuery,
  useGetActiveFeeHeadsQuery,
  useAddFeeHeadMutation,
  useUpdateFeeHeadMutation,
  useDeleteFeeHeadMutation,
  usePatchFeeHeadMutation,
} = FeeHeadManagementApi;

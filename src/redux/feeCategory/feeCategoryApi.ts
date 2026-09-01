import type { FeeHeadModule } from 'src/redux/feeHeadModule/feeHeadModuleApi';

import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../finance/financeModuleApi';

export interface IFeeHeadItemRequest {
  id?: string | null;
  name: string;
  module?: FeeHeadModule | null;
  isConcessionApplied: boolean;
  description?: string;
}

export interface IFeeHeadResponse {
  id: string;
  academicYearId: string;
  feeCategoryId: string;
  feeCategoryName?: string;
  name: string;
  module: FeeHeadModule | null;
  isConcessionApplied: boolean;
  description?: string;
  isActive: boolean;
  deactivationReason?: string | null;
  isUsedInDownstream: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface IFeeCategoryResponse {
  id: string;
  academicYearId: string;
  name: string;
  description?: string;
  isActive: boolean;
  deactivationReason?: string | null;
  isUsedInDownstream: boolean;
  feeHeads: IFeeHeadResponse[];
  totalFeeHeads: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface IFeeCategoryListResponse {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  items: IFeeCategoryResponse[];
}

export interface IFeeCategoryCreateOrUpdateBody {
  name: string;
  description?: string;
  feeHeads: IFeeHeadItemRequest[];
}

export interface IFeeCategoryStatusUpdateBody {
  isActive: boolean;
  deactivationReason?: string | null;
}

export const feeCategoryApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get fee category list
    getFeeCategories: builder.query<IFeeCategoryListResponse, Record<string, unknown>>({
      query: (params) => ({
        url: '/fee-categories',
        method: 'GET',
        params,
      }),
      providesTags: [financeModuleType.feeCategory],
    }),

    // Get fee category by id
    getFeeCategoryById: builder.query<IFeeCategoryResponse, string>({
      query: (id) => ({
        url: `/fee-categories/${id}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.feeCategory],
    }),

    // Create fee category
    addFeeCategory: builder.mutation<
      IFeeCategoryResponse,
      { academicYearId: string; body: IFeeCategoryCreateOrUpdateBody }
    >({
      query: ({ academicYearId, body }) => ({
        url: `/fee-categories`,
        method: 'POST',
        body,
        params: {
          academicYearId,
        },
      }),
      invalidatesTags: [financeModuleType.feeCategory, financeModuleType.feeHead],
    }),

    // Update fee category
    updateFeeCategory: builder.mutation<
      IFeeCategoryResponse,
      { id: string; body: IFeeCategoryCreateOrUpdateBody }
    >({
      query: ({ id, body }) => ({
        url: `/fee-categories/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.feeCategory, financeModuleType.feeHead],
    }),

    // Delete fee category
    deleteFeeCategory: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/fee-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.feeCategory, financeModuleType.feeHead],
    }),

    // Patch fee category status
    patchFeeCategoryStatus: builder.mutation<
      IFeeCategoryResponse,
      { id: string; body: IFeeCategoryStatusUpdateBody }
    >({
      query: ({ id, body }) => ({
        url: `/fee-categories/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [financeModuleType.feeCategory, financeModuleType.feeHead],
    }),
  }),
});

export const {
  useGetFeeCategoriesQuery,
  useGetFeeCategoryByIdQuery,
  useAddFeeCategoryMutation,
  useUpdateFeeCategoryMutation,
  useDeleteFeeCategoryMutation,
  usePatchFeeCategoryStatusMutation,
} = feeCategoryApi;

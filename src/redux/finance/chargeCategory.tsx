import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';

export interface ChargeCategoryListParams {
  academicYearId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export const buildChargeCategoryListRequest = (params: ChargeCategoryListParams) => ({
  url: '/charge-categories',
  method: 'GET' as const,
  params,
});

export const buildChargeCategoryStatusRequest = ({
  id,
  body,
}: {
  id: string;
  body: { isActive: boolean; reason?: string | null };
}) => ({
  url: `/charge-categories/${id}/status`,
  method: 'PUT' as const,
  body,
});

export const chargeCategoryApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get charge categories data (paginated)
    getChargeCategories: builder.query({
      query: buildChargeCategoryListRequest,
      providesTags: [financeModuleType.chargeCategory],
    }),

    // Get charge category by id
    getChargeCategoryById: builder.query({
      query: ({ chargeCategoryId }: { chargeCategoryId: string }) => ({
        url: `/charge-categories/${chargeCategoryId}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.chargeCategory],
    }),

    // Post charge category
    postChargeCategory: builder.mutation({
      query: ({ academicYearId, body }: { academicYearId: string; body: any }) => ({
        url: `/charge-categories`,
        method: 'POST',
        body,
        params: {
          academicYearId,
        },
      }),
      invalidatesTags: [financeModuleType.chargeCategory],
    }),

    // Put charge category
    putChargeCategory: builder.mutation({
      query: ({ chargeCategoryId, body }: { chargeCategoryId: string; body: any }) => ({
        url: `/charge-categories/${chargeCategoryId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.chargeCategory],
    }),

    // Delete charge category
    deleteChargeCategory: builder.mutation({
      query: ({ chargeCategoryId }: { chargeCategoryId: string }) => ({
        url: `/charge-categories/${chargeCategoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.chargeCategory],
    }),

    // Update charge category status
    patchChargeCategoryStatus: builder.mutation({
      query: buildChargeCategoryStatusRequest,
      invalidatesTags: [financeModuleType.chargeCategory],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetChargeCategoriesQuery,
  useGetChargeCategoryByIdQuery,
  usePostChargeCategoryMutation,
  usePutChargeCategoryMutation,
  useDeleteChargeCategoryMutation,
  usePatchChargeCategoryStatusMutation,
} = chargeCategoryApi;

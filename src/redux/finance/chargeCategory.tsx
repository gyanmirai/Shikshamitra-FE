import { financeModuleApi } from './financeModuleApi';
import { financeModuleType } from 'src/redux/tagTypes';


export const chargeCategoryApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get charge categories data (paginated)
    getChargeCategories: builder.query({
      query: (params: {
        academicYearId: string;
        page?: number;
        pageSize?: number;
        search?: string;
      }) => ({
        url: '/charge-categories',
        method: 'GET',
        params,
      }),
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
        data: body,
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
        data: body,
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
  }),
  overrideExisting: false,
});

export const {
  useGetChargeCategoriesQuery,
  useGetChargeCategoryByIdQuery,
  usePostChargeCategoryMutation,
  usePutChargeCategoryMutation,
  useDeleteChargeCategoryMutation,
} = chargeCategoryApi;

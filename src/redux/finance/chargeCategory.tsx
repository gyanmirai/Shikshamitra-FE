import { financeModuleApi } from './financeModuleApi';

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
      providesTags: ['Charge-Category'],
    }),

    // Get charge category by id
    getChargeCategoryById: builder.query({
      query: ({ chargeCategoryId }: { chargeCategoryId: string }) => ({
        url: `/charge-categories/${chargeCategoryId}`,
        method: 'GET',
      }),
      providesTags: ['Charge-Category'],
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
      invalidatesTags: ['Charge-Category'],
    }),

    // Put charge category
    putChargeCategory: builder.mutation({
      query: ({ chargeCategoryId, body }: { chargeCategoryId: string; body: any }) => ({
        url: `/charge-categories/${chargeCategoryId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Charge-Category'],
    }),

    // Delete charge category
    deleteChargeCategory: builder.mutation({
      query: ({ chargeCategoryId }: { chargeCategoryId: string }) => ({
        url: `/charge-categories/${chargeCategoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Charge-Category'],
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

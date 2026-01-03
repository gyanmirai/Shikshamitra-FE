import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';
import chargeCategoryData from 'src/json/finance/settings/charges/chargeCategoryData.json';

const isDev = process.env.NODE_ENV === 'development';

export const ChargeCategoryApi = createApi({
  reducerPath: 'ChargeCategoryApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock routes
        if (url === '/chargeCategories') {
          return { data: chargeCategoryData.chargeCategories };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['charge-category'],
  endpoints: (builder) => ({
    // Get charge categories data
    getChargeCategory: builder.query({
      query: () => ({
        url: '/finance/charge-categories',
        method: 'GET',
      }),
      providesTags: ['charge-category'],
    }),

    // Get charge category by id
    getChargeCategoryById: builder.query({
      query: (academicYearId: string) => ({
        url: `/finance/charge-categories/${academicYearId}`,
        method: 'GET',
      }),
      providesTags: ['charge-category'],
    }),

    // Post charge category
    postChargeCategory: builder.mutation({
      query: (body) => ({
        url: `/finance/charge-categories`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['charge-category'],
    }),

    // Put charge category
    putChargeCategory: builder.mutation({
      query: ({ chargeCategoryId, body }) => ({
        url: `/finance/charge-categories/${chargeCategoryId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['charge-category'],
    }),

    // Delete charge category
    deleteChargeCategory: builder.mutation({
      query: (chargeCategoryId: string) => ({
        url: `/finance/charge-categories/${chargeCategoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['charge-category'],
    }),
  }),
});

export const {
  useGetChargeCategoryQuery,
  useGetChargeCategoryByIdQuery,
  usePostChargeCategoryMutation,
  usePutChargeCategoryMutation,
  useDeleteChargeCategoryMutation,
} = ChargeCategoryApi;

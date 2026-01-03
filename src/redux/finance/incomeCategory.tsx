import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';
import incomeCategoryDataJson from 'src/json/finance/expense/expenseTrackingData.json';

const isDev = process.env.NODE_ENV === 'development';

export const incomeCategoryApi = createApi({
  reducerPath: 'incomeCategoryApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock routes
        if (url === '/incomeCategoryData') {
          return { data: incomeCategoryDataJson.incomeCategoryData };
        }
        if (url === '/incomeOptions') {
          return { data: incomeCategoryDataJson.incomeOptions.budgetOptions };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['incomeCategoryData'],
  endpoints: (builder) => ({
    getIncomeCategories: builder.query({
      query: () => ({
        url: '/finance/income-categories',
        method: 'GET',
      }),
      providesTags: ['incomeCategoryData'],
    }),

    postIncomeCategory: builder.mutation({
      query: (body: any) => ({
        url: '/finance/income-categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['incomeCategoryData'],
    }),

    putIncomeCategory: builder.mutation({
      query: ({ incomeCategoryId, body }) => ({
        url: `/finance/income-categories/${incomeCategoryId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['incomeCategoryData'],
    }),

    deleteIncomeCategory: builder.mutation({
      query: (incomeCategoryId: string) => ({
        url: `/finance/income-categories/${incomeCategoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['incomeCategoryData'],
    }),

    getBudgetOptions: builder.query({
      query: () => ({
        url: '/incomeOptions',
        method: 'GET',
      }),
      providesTags: ['incomeCategoryData'],
    }),
  }),
});

export const {
  useGetIncomeCategoriesQuery,
  usePostIncomeCategoryMutation,
  usePutIncomeCategoryMutation,
  useDeleteIncomeCategoryMutation,
  useGetBudgetOptionsQuery,
} = incomeCategoryApi;

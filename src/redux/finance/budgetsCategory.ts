import { api } from 'src/redux/service';
import { budgetsCategoryType } from 'src/redux/tagTypes';

export const BudgetsCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBudgetCategory: builder.query({
      query: () => ({
        url: '/budgetsCategories',
        method: 'GET',
      }),
      providesTags: [budgetsCategoryType.budgetCategory],
    }),
    getBudgetSubCategory: builder.query({
      query: () => ({
        url: '/budgetsSubCategories',
        method: 'GET',
      }),
      providesTags: [budgetsCategoryType.budgetSubCategory],
    }),
  }),
});

export const { useGetBudgetCategoryQuery, useGetBudgetSubCategoryQuery } = BudgetsCategoryApi;

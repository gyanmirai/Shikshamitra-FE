import { budgetSubCategoryType } from 'src/redux/tagTypes';

// <-- mock JSON
import { api } from '../service';

export const budgetSubCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBudgetSubCategoryData: builder.query({
      query: () => ({
        url: '/budgetSubCategoryData',
        method: 'GET',
      }),
      providesTags: [budgetSubCategoryType.budgetSubCategoryData],
    }),
  }),
});

export const { useGetBudgetSubCategoryDataQuery } = budgetSubCategoryApi;

import { budgetType } from 'src/redux/tagTypes';

// <-- your mock JSON
import { api } from '../service';

export const budgetApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBudgetData: builder.query({
      query: () => ({
        url: '/budgetData',
        method: 'GET',
      }),
      providesTags: [budgetType.budget],
    }),
  }),
});

export const { useGetBudgetDataQuery } = budgetApi;

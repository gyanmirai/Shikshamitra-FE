import { api } from 'src/redux/service';
import { expenseType } from 'src/redux/tagTypes';

export const expenseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query({
      query: () => ({
        url: '/detailedExpenseTableData',
        method: 'GET',
      }),
      providesTags: [expenseType.expense],
    }),
  }),
});

export const { useGetExpensesQuery } = expenseApi;

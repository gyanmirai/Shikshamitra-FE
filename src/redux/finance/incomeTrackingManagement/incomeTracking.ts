import { financeModuleApi } from '../financeModuleApi';

export const incomeCategoryApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getIncomeCategories: builder.query({
      query: () => ({
        url: '/incomeCategoryOptions',
        method: 'GET',
      }),
      providesTags: ['IncomeCategories'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetIncomeCategoriesQuery } = incomeCategoryApi;

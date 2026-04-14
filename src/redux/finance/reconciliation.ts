import { api } from 'src/redux/service';
import { reconciliationType } from 'src/redux/tagTypes';

export const ReconciliationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReconciliationList: builder.query({
      query: ({
        month,
        year,
        paymentMethod,
      }: {
        month: string;
        year: string;
        paymentMethod: string;
      }) => ({
        url: `/finance/reconciliations?month=${month}&year=${year}&paymentMethod=${paymentMethod}`,
        method: 'GET',
      }),
      providesTags: [reconciliationType.reconciliation],
    }),
  }),
});

export const { useGetReconciliationListQuery } = ReconciliationApi;

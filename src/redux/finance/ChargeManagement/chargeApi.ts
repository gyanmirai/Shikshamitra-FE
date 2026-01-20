import { financeModuleApi } from '../financeModuleApi';

export const chargesApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharges: builder.query({
      query: () => ({
        url: '/chargesData',
        method: 'GET',
      }),
      providesTags: ['Charges'],
    }),
    deleteCharge: builder.mutation({
      query: (id) => ({
        url: `/chargesData/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Charges'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetChargesQuery, useDeleteChargeMutation } = chargesApi;

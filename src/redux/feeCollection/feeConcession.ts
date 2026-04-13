import { api } from 'src/redux/service';
import { feeConcessionType } from 'src/redux/tagTypes';

export const feeConcessionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFeeConcessions: builder.query({
      query: () => ({
        url: '/feeConcession',
        method: 'GET',
      }),
      providesTags: [feeConcessionType.feeConcession],
    }),
  }),
});

export const { useGetFeeConcessionsQuery } = feeConcessionApi;

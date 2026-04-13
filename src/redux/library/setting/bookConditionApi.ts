import { api } from 'src/redux/service';
import { bookConditionOptionsType } from 'src/redux/tagTypes';

export const bookConditionOptionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBookConditionOptions: builder.query({
      query: () => ({
        url: '/bookConditionData',
        method: 'GET',
      }),
      providesTags: [bookConditionOptionsType.bookConditionOptions],
    }),
  }),
});

export const { useGetBookConditionOptionsQuery } = bookConditionOptionsApi;

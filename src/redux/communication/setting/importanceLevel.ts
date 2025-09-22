import { communicationApi } from '../communicationApi';

export const importanceLevelOptionsApi = communicationApi.injectEndpoints({
  endpoints: (builder) => ({
    getImportanceLevelOptions: builder.query({
      query: () => ({
        url: '/importanceLevelData',
        method: 'GET',
      }),
      providesTags: ['ImportanceLevelOptions'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetImportanceLevelOptionsQuery } = importanceLevelOptionsApi;

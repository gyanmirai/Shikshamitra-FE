import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';

export const concessionTypeApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getConcessionTypes: builder.query({
      query: ({
        academicYearId,
        skipCount,
        maxResultCount,
        searchTerm,
      }: {
        academicYearId: string;
        skipCount?: number;
        maxResultCount?: number;
        searchTerm?: string;
      }) => ({
        url: `/${academicYearId}/concession-types`,
        method: 'GET',
        params: { skipCount, maxResultCount, searchTerm: searchTerm || undefined },
      }),
      providesTags: [financeModuleType.concessionType],
    }),
    getConcessionTypeById: builder.query({
      query: ({ concessionTypeId }) => ({
        url: `/concession-types/${concessionTypeId}`,
        method: 'GET',
      }),
      providesTags: [financeModuleType.concessionType],
    }),
    postConcessionType: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: `/${academicYearId}/concession-types`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionType],
    }),
    putConcessionType: builder.mutation({
      query: ({ concessionTypeId, body }) => ({
        url: `/concession-types/${concessionTypeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionType],
    }),
    deleteConcessionType: builder.mutation({
      query: ({ concessionTypeId }) => ({
        url: `/concession-types/${concessionTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.concessionType],
    }),
    patchConcessionTypeStatus: builder.mutation({
      query: ({ id, body }) => ({
        url: `/concession-types/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [financeModuleType.concessionType],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetConcessionTypesQuery,
  useGetConcessionTypeByIdQuery,
  usePostConcessionTypeMutation,
  usePutConcessionTypeMutation,
  useDeleteConcessionTypeMutation,
  usePatchConcessionTypeStatusMutation,
} = concessionTypeApi;

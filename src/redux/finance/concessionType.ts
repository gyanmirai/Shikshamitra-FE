import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from './financeModuleApi';

export interface ConcessionTypeVersionFieldChange {
  fieldName: string;
  originalValue?: string | null;
  newValue?: string | null;
}

export interface ConcessionTypeVersionHistoryItem {
  id: string;
  versionNumber: number;
  changeAction: string;
  changeTime: string;
  actorId?: string | null;
  actorName?: string | null;
  changedFields: ConcessionTypeVersionFieldChange[];
}

export interface ConcessionTypeVersionHistoryResponse {
  data: {
    totalCount: number;
    items: ConcessionTypeVersionHistoryItem[];
  };
}

export const concessionTypeApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getConcessionTypes: builder.query({
      query: ({
        academicYearId,
        skipCount,
        maxResultCount,
        searchTerm,
        includeInactive,
        isActive,
      }: {
        academicYearId: string;
        skipCount?: number;
        maxResultCount?: number;
        searchTerm?: string;
        includeInactive?: boolean;
        isActive?: boolean;
      }) => ({
        url: `/${academicYearId}/concession-types`,
        method: 'GET',
        params: {
          skipCount,
          maxResultCount,
          searchTerm: searchTerm || undefined,
          includeInactive,
          isActive,
        },
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
    getConcessionTypeVersionHistory: builder.query<
      ConcessionTypeVersionHistoryResponse,
      { concessionTypeId: string; skipCount?: number; maxResultCount?: number }
    >({
      query: ({ concessionTypeId, skipCount = 0, maxResultCount = 50 }) => ({
        url: `/concession-types/${concessionTypeId}/versions`,
        method: 'GET',
        params: { skipCount, maxResultCount },
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
  useGetConcessionTypeVersionHistoryQuery,
  usePostConcessionTypeMutation,
  usePutConcessionTypeMutation,
  useDeleteConcessionTypeMutation,
  usePatchConcessionTypeStatusMutation,
} = concessionTypeApi;

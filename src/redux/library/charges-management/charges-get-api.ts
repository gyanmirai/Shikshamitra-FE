import { api } from 'src/redux/service';
import { libraryChargeType } from 'src/redux/tagTypes';
import { libraryChargeMutationTags } from 'src/redux/library/library-cache-tags';
import {
  mapChargeDetailDto,
  mapChargeListItemDto,
  toLibraryPaginatedList,
} from 'src/redux/library/library-adapters';

import type {
  ChargeEditorPage,
  ChargeEditorLoan,
  ChargeEditorQuery,
  ChargeEditorMember,
  ChargeEditorContext,
  ChargeEditorCategory,
} from './charge-editor-types';

export const LibraryChargeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryChargeEditorCategories: builder.query<
      ChargeEditorPage<ChargeEditorCategory>,
      ChargeEditorQuery
    >({
      query: (params) => ({ url: '/library/charges/editor/categories', method: 'GET', params }),
      providesTags: [libraryChargeType.libraryCharge],
    }),
    searchLibraryChargeEditorMembers: builder.query<
      ChargeEditorPage<ChargeEditorMember>,
      ChargeEditorQuery
    >({
      query: (params) => ({ url: '/library/charges/editor/members', method: 'GET', params }),
      providesTags: [libraryChargeType.libraryCharge],
    }),
    resolveLibraryChargeEditorMember: builder.query<
      ChargeEditorMember,
      { academicYearId: string; identifier: string }
    >({
      query: (params) => ({ url: '/library/charges/editor/member', method: 'GET', params }),
      providesTags: [libraryChargeType.libraryCharge],
    }),
    getLibraryChargeEditorLoanSources: builder.query<
      ChargeEditorPage<ChargeEditorLoan>,
      ChargeEditorQuery & { memberId: string }
    >({
      query: (params) => ({ url: '/library/charges/editor/loans', method: 'GET', params }),
      providesTags: [libraryChargeType.libraryCharge],
    }),
    getLibraryChargeEditorContext: builder.query<ChargeEditorContext, { chargeId: string }>({
      query: ({ chargeId }) => ({ url: `/library/charges/${chargeId}/editor`, method: 'GET' }),
      providesTags: [libraryChargeType.libraryCharge],
    }),
    getLibraryCharges: builder.query({
      query: (params) => ({
        url: '/library/charges',
        method: 'GET',
        params,
      }),
      transformResponse: (response) => toLibraryPaginatedList(response, mapChargeListItemDto),
      providesTags: [libraryChargeType.libraryCharge],
    }),
    addLibraryCharge: builder.mutation({
      query: ({ body }) => ({
        url: '/library/charges',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, error) => (error ? [] : libraryChargeMutationTags),
    }),
    updateLibraryCharge: builder.mutation({
      query: ({ body, chargeId }) => ({
        url: `/library/charges/${chargeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, error) => (error ? [] : libraryChargeMutationTags),
    }),
    deleteLibraryCharge: builder.mutation({
      query: ({ chargeId }) => ({
        url: `/library/charges/${chargeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, error) => (error ? [] : libraryChargeMutationTags),
    }),
    getDetailedCharge: builder.query({
      query: ({ chargeId }) => ({
        url: `/library/charges/${chargeId}`,
        method: 'GET',
      }),
      transformResponse: mapChargeDetailDto,
      providesTags: [libraryChargeType.libraryCharge],
    }),
  }),
});

export const {
  useLazyGetLibraryChargeEditorCategoriesQuery,
  useLazySearchLibraryChargeEditorMembersQuery,
  useResolveLibraryChargeEditorMemberQuery,
  useLazyGetLibraryChargeEditorLoanSourcesQuery,
  useGetLibraryChargeEditorContextQuery,
  useLazyGetLibraryChargeEditorContextQuery,
  useGetLibraryChargesQuery,
  useAddLibraryChargeMutation,
  useUpdateLibraryChargeMutation,
  useDeleteLibraryChargeMutation,
  useGetDetailedChargeQuery,
  useLazyGetDetailedChargeQuery,
} = LibraryChargeApi;

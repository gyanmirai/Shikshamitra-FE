import { api } from 'src/redux/service';
import { libraryChargeType } from 'src/redux/tagTypes';
import {
  mapChargeDetailDto,
  mapChargeListItemDto,
  toLibraryPaginatedList,
} from 'src/redux/library/library-adapters';

export const LibraryChargeApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
      invalidatesTags: [libraryChargeType.libraryCharge],
    }),
    updateLibraryCharge: builder.mutation({
      query: ({ body, chargeId }) => ({
        url: `/library/charges/${chargeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [libraryChargeType.libraryCharge],
    }),
    deleteLibraryCharge: builder.mutation({
      query: ({ chargeId }) => ({
        url: `/library/charges/${chargeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [libraryChargeType.libraryCharge],
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
  useGetLibraryChargesQuery,
  useAddLibraryChargeMutation,
  useUpdateLibraryChargeMutation,
  useDeleteLibraryChargeMutation,
  useGetDetailedChargeQuery,
} = LibraryChargeApi;

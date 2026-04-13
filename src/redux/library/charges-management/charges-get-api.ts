import { api } from 'src/redux/service';
import { libraryChargeType } from 'src/redux/tagTypes';

export const LibraryChargeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryCharges: builder.query({
      query: () => ({
        url: '/library/charges',
        method: 'GET',
      }),
      providesTags: [libraryChargeType.libraryCharge],
    }),
    addLibraryCharge: builder.mutation({
      query: (data) => ({
        url: '/library/charges/create',
        method: 'POST',
        data,
      }),
      invalidatesTags: [libraryChargeType.libraryCharge],
    }),
    updateLibraryCharge: builder.mutation({
      query: ({ data, chargeId, academicYearId }) => ({
        url: `/library/charges/${chargeId}?academicYearId=${academicYearId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: [libraryChargeType.libraryCharge],
    }),
    deleteLibraryCharge: builder.mutation({
      query: ({ chargeId, academicYearId }) => ({
        url: `/library/charges/${chargeId}?academicYearId=${academicYearId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [libraryChargeType.libraryCharge],
    }),
    getDetailedCharge: builder.query({
      query: ({ chargeId, academicYearId }) => ({
        url: `/library/charges/details/${chargeId}?academicYearId=${academicYearId}`,
        method: 'GET',
      }),
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

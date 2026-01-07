import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

import libraryChargesData from '../../../../issueReturnData.json';

const isDev = process.env.NODE_ENV === 'development';

export const LibraryChargeApi = createApi({
  reducerPath: 'LibraryChargeApi',
  baseQuery: isDev
    ? axiosBaseQuery({ baseUrl: 'http://localhost:3001' })
    : async ({ url }) => {
        // Handle mock route
        if (url === '/libraryChargesData') {
          return { data: libraryChargesData.libraryChargesData };
        }
        return {
          error: {
            status: 404,
            data: 'No mock data found for this route',
          },
        };
      },
  tagTypes: ['LibraryCharge'],
  endpoints: (builder) => ({
    getLibraryCharges: builder.query({
      query: () => ({
        url: '/library/charges',
        method: 'GET',
      }),
      providesTags: ['LibraryCharge'],
    }),
    addLibraryCharge: builder.mutation({
      query: (data) => ({
        url: '/library/charges/create',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['LibraryCharge'],
    }),
    updateLibraryCharge: builder.mutation({
      query: ({ data, chargeId, academicYearId }) => ({
        url: `/library/charges/${chargeId}?academicYearId=${academicYearId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: ['LibraryCharge'],
    }),
    deleteLibraryCharge: builder.mutation({
      query: ({ chargeId, academicYearId }) => ({
        url: `/library/charges/${chargeId}?academicYearId=${academicYearId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LibraryCharge'],
    }),
    getDetailedCharge: builder.query({
      query: ({ chargeId, academicYearId }) => ({
        url: `/library/charges/details/${chargeId}?academicYearId=${academicYearId}`,
        method: 'GET',
      }),
      providesTags: ['LibraryCharge'],
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

import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const ProfessionalApi = createApi({
  reducerPath: 'ProfessionalApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['PF'],
  endpoints: (builder) => ({
    getProfessionalTax: builder.query({
      query: () => ({
        url: '/app/professional-tax',
        method: 'GET',
      }),
      providesTags: ['PF'],
    }),
    addProfessionalTax: builder.mutation({
      query: (data) => ({
        url: '/app/professional-tax',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['PF'],
    }),
    updateProfessionalTax: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/professional-tax/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['PF'],
    }),
    deleteProfessionalTax: builder.mutation({
      query: (id) => ({
        url: `/app/professional-tax/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PF'],
    }),
  }),
});

export const {
  useAddProfessionalTaxMutation,
  useDeleteProfessionalTaxMutation,
  useGetProfessionalTaxQuery,
  useUpdateProfessionalTaxMutation,
} = ProfessionalApi;

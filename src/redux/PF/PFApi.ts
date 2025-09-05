import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const PFApi = createApi({
  reducerPath: 'PFApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['PF'],
  endpoints: (builder) => ({
    getPF: builder.query({
      query: () => ({ url: '/app/provident-fund' }),
      providesTags: ['PF'],
    }),
    addPF: builder.mutation({
      query: (body) => ({
        url: '/app/provident-fund',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['PF'],
    }),
    updatePF: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/provident-fund/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['PF'],
    }),
    deletePF: builder.mutation({
      query: (id) => ({
        url: `/app/provident-fund/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PF'],
    }),
  }),
});

export const { useGetPFQuery, useAddPFMutation, useUpdatePFMutation, useDeletePFMutation } = PFApi;

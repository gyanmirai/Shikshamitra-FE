import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const earningComponentApi = createApi({
  reducerPath: 'earningComponentApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['EarningComponent'],
  endpoints: (builder) => ({
    getEarningComponents: builder.query({
      query: () => ({ url: '/payroll/earning-components' }),
      providesTags: ['EarningComponent'],
    }),

    createEarningComponent: builder.mutation({
      query: (body) => ({
        url: '/payroll/earning-components',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['EarningComponent'],
    }),

    updateEarningComponent: builder.mutation({
      query: ({ id, body }) => ({
        url: `/payroll/earning-components/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['EarningComponent'],
    }),

    deleteEarningComponent: builder.mutation({
      query: (id) => ({
        url: `/payroll/earning-components/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EarningComponent'],
    }),
  }),
});

export const {
  useGetEarningComponentsQuery,
  useCreateEarningComponentMutation,
  useUpdateEarningComponentMutation,
  useDeleteEarningComponentMutation,
} = earningComponentApi;

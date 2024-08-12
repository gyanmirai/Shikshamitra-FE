import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/httpService';

export const organizationApi = createApi({
  reducerPath: 'organizationApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['Organization'],
  endpoints: (builder) => ({
    getOrganization: builder.query({
      query: () => ({ url: '/app/education-medium-stage' }),
      providesTags: ['Organization'],
    }),
    getOrganizationById: builder.query({
      query: (id) => ({ url: `/app/education-medium-stage/${id}` }),
      providesTags: ['Organization'],
    }),
    addOrganization: builder.mutation({
      query: (body) => ({
        url: '/app/education-medium-stage',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Organization'],
    }),
    updateOrganization: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/education-medium-stage/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Organization'],
    }),
    deleteOrganization: builder.mutation({
      query: (id) => ({
        url: `/app/education-medium-stage/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Organization'],
    }),
  }),
});

export const {
  useAddOrganizationMutation,
  useDeleteOrganizationMutation,
  useGetOrganizationByIdQuery,
  useLazyGetOrganizationByIdQuery,
  useGetOrganizationQuery,
  useUpdateOrganizationMutation,
} = organizationApi;

import type { Division } from 'src/types/school';

import { divisionType } from 'src/redux/tagTypes';
import { academicReorderTags } from 'src/redux/academic-reorder-tags';

import { api } from '../service';

export const divisionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDivision: builder.query({
      query: () => ({ url: '/app/division', redirect: 'follow' }),
      providesTags: [divisionType.division],
    }),
    getDivisionById: builder.query<Division, string>({
      query: (id) => ({ url: `/app/division/${id}` }),
      providesTags: [divisionType.division],
    }),
    addDivision: builder.mutation({
      query: (body) => ({
        url: '/app/division',
        method: 'POST',
        body,
      }),
      invalidatesTags: [divisionType.division],
    }),
    updateDivision: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/division/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [divisionType.division],
    }),
    reorderDivisions: builder.mutation<void, { standardId: string; ids: string[] }>({
      query: ({ standardId, ids }) => ({
        url: `/standards/${standardId}/divisions/order`,
        method: 'PUT',
        body: { ids },
      }),
      invalidatesTags: academicReorderTags,
    }),
    deleteDivision: builder.mutation({
      query: (id) => ({
        url: `/app/division/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [divisionType.division],
    }),
  }),
});

export const {
  useGetDivisionQuery,
  useGetDivisionByIdQuery,
  useAddDivisionMutation,
  useUpdateDivisionMutation,
  useReorderDivisionsMutation,
  useDeleteDivisionMutation,
} = divisionApi;

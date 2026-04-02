import { classType } from 'src/redux/tagTypes';

import { api } from '../service';

export const classApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getClass: builder.query({
      query: () => ({ url: '/app/standard?Sorting=name asc', redirect: 'follow' }),
      providesTags: [classType.class],
    }),
    getClassById: builder.query({
      query: (id) => ({ url: `/app/standard/${id}` }),
      providesTags: [classType.class],
    }),
    addClass: builder.mutation({
      query: (body) => ({
        url: '/app/standard',
        method: 'POST',
        body,
      }),
      invalidatesTags: [classType.class],
    }),
    updateClass: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/standard/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [classType.class],
    }),
    deleteClass: builder.mutation({
      query: (id) => ({
        url: `/app/standard/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [classType.class],
    }),
    getClassByOrganizationId: builder.query({
      query: (id) => ({ url: `/education-medium/${id}/standards` }),
      providesTags: [classType.class],
    }),
    getClassByMedium: builder.query({
      query: (educationMediumId) => ({ url: `/education-medium/${educationMediumId}/standards` }),
      providesTags: [classType.class],
    }),
  }),
});

export const {
  useGetClassQuery,
  useGetClassByIdQuery,
  useLazyGetClassByIdQuery,
  useAddClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetClassByOrganizationIdQuery,
  useLazyGetClassByOrganizationIdQuery,
  useGetClassByMediumQuery,
  useLazyGetClassByMediumQuery,
} = classApi;

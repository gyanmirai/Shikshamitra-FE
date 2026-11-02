import { academicReorderTags } from 'src/redux/academic-reorder-tags';
import { classType, divisionType, organizationType } from 'src/redux/tagTypes';

import { api } from '../service';

export type StandardLookupDivision = { id: string; name: string };
export type StandardLookupOption = {
  id: string;
  name: string;
  divisions: StandardLookupDivision[];
};

export const classApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getClassLookup: builder.query<{ items: StandardLookupOption[] }, void>({
      query: () => ({ url: '/app/standard/lookup' }),
      providesTags: [
        classType.class,
        divisionType.division,
        organizationType.academicHierarchyOptions,
      ],
    }),
    getClass: builder.query({
      query: () => ({ url: '/app/standard', redirect: 'follow' }),
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
    reorderClasses: builder.mutation<void, { stageId: string; ids: string[] }>({
      query: ({ stageId, ids }) => ({
        url: `/education-medium-stages/${stageId}/standards/order`,
        method: 'PUT',
        body: { ids },
      }),
      invalidatesTags: academicReorderTags,
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
  useGetClassLookupQuery,
  useGetClassQuery,
  useGetClassByIdQuery,
  useLazyGetClassByIdQuery,
  useAddClassMutation,
  useUpdateClassMutation,
  useReorderClassesMutation,
  useDeleteClassMutation,
  useGetClassByOrganizationIdQuery,
  useLazyGetClassByOrganizationIdQuery,
  useGetClassByMediumQuery,
  useLazyGetClassByMediumQuery,
} = classApi;

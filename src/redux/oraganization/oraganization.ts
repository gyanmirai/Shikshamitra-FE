import { api } from 'src/redux/service';
import { organizationType } from 'src/redux/tagTypes';
import { academicReorderTags } from 'src/redux/academic-reorder-tags';

export const organizationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrganization: builder.query({
      query: () => ({ url: '/app/education-medium-stage' }),
      providesTags: [organizationType.organization],
    }),
    getOrganizationById: builder.query({
      query: (id) => ({ url: `/app/education-medium-stage/${id}` }),
      providesTags: [organizationType.organization],
    }),
    addOrganization: builder.mutation({
      query: (body) => ({
        url: '/app/education-medium-stage',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        organizationType.organization,
        organizationType.academicOrganizationOptions,
      ],
    }),
    updateOrganization: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/education-medium-stage/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [
        organizationType.organization,
        organizationType.academicOrganizationOptions,
      ],
    }),
    reorderStages: builder.mutation<void, { mediumId: string; ids: string[] }>({
      query: ({ mediumId, ids }) => ({
        url: `/education-mediums/${mediumId}/stages/order`,
        method: 'PUT',
        body: { ids },
      }),
      invalidatesTags: academicReorderTags,
    }),
    deleteOrganization: builder.mutation({
      query: (id) => ({
        url: `/app/education-medium-stage/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        organizationType.organization,
        organizationType.academicOrganizationOptions,
      ],
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
  useReorderStagesMutation,
} = organizationApi;

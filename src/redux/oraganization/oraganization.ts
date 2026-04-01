import { api } from 'src/redux/service';
import { organizationType } from 'src/redux/tagTypes';

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
        data: body,
      }),
      invalidatesTags: [organizationType.organization],
    }),
    updateOrganization: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/education-medium-stage/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [organizationType.organization],
    }),
    deleteOrganization: builder.mutation({
      query: (id) => ({
        url: `/app/education-medium-stage/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [organizationType.organization],
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

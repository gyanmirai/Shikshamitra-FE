import { academicApi } from '../../academicApi';

export const electiveGroupsApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all elective groups under academic medium
    getElectiveGroups: builder.query({
      query: ({ academicMediumId }) => ({
        url: `/academic-mediums/${academicMediumId}/elective-groups`,
        method: 'GET',
      }),
      providesTags: ['ElectiveGroup'],
    }),

    // Get specific elective group under academic medium
    getElectiveGroupById: builder.query({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/elective-groups/${id}`,
        method: 'GET',
      }),
      providesTags: ['ElectiveGroup'],
    }),

    // Add new elective group under medium
    addElectiveGroup: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/academic-mediums/${academicMediumId}/elective-groups`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['ElectiveGroup'],
    }),

    // Update elective group under medium
    updateElectiveGroup: builder.mutation({
      query: ({ academicMediumId, id, body }) => ({
        url: `/academic-mediums/${academicMediumId}/elective-groups/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['ElectiveGroup'],
    }),

    // Delete elective group under medium
    deleteElectiveGroup: builder.mutation({
      query: ({ academicMediumId, id }) => ({
        url: `/academic-mediums/${academicMediumId}/elective-groups/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ElectiveGroup'],
    }),
  }),
  overrideExisting: false,
});

// RTK query hooks
export const {
  useGetElectiveGroupsQuery,
  useGetElectiveGroupByIdQuery,
  useAddElectiveGroupMutation,
  useUpdateElectiveGroupMutation,
  useDeleteElectiveGroupMutation,
} = electiveGroupsApi;

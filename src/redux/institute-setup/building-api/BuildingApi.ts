import { instituteSetupApi } from '../instituteSetupApi';

export const buildingsApi = instituteSetupApi.injectEndpoints({
  endpoints: (builder) => ({
    getBuildings: builder.query({
      query: () => ({
        url: '/buildings',
        method: 'GET',
      }),
      providesTags: ['Buildings'],
    }),

    addBuilding: builder.mutation({
      query: (data) => ({
        url: '/buildings',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Buildings'],
    }),

    getBuildingById: builder.query({
      query: (id) => ({
        url: `/buildings/${id}`,
        method: 'GET',
      }),
      providesTags: ['Buildings'],
    }),

    updateBuilding: builder.mutation({
      query: ({ id, body }) => ({
        url: `/buildings/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Buildings'],
    }),

    deleteBuilding: builder.mutation({
      query: (id) => ({
        url: `/buildings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Buildings'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBuildingsQuery,
  useLazyGetBuildingsQuery,
  useAddBuildingMutation,
  useGetBuildingByIdQuery,
  useUpdateBuildingMutation,
  useDeleteBuildingMutation,
} = buildingsApi;

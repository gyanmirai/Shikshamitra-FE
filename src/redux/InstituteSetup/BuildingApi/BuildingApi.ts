import { api } from 'src/redux/service';
import { instituteSetupType } from 'src/redux/tagTypes';

export const buildingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBuildings: builder.query({
      query: () => ({
        url: '/institute-setup/buildings',
        method: 'GET',
      }),
      providesTags: [instituteSetupType.buildings],
    }),

    addBuilding: builder.mutation({
      query: (data) => ({
        url: '/institute-setup/buildings',
        method: 'POST',
        data,
      }),
      invalidatesTags: [instituteSetupType.buildings],
    }),

    getBuildingById: builder.query({
      query: (id) => ({
        url: `/institute-setup/buildings/${id}`,
        method: 'GET',
      }),
      providesTags: [instituteSetupType.buildings],
    }),

    updateBuilding: builder.mutation({
      query: ({ id, body }) => ({
        url: `/institute-setup/buildings/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              instituteSetupType.buildings,
              instituteSetupType.rooms,
              instituteSetupType.roomDetails,
            ],
    }),

    deleteBuilding: builder.mutation({
      query: (id) => ({
        url: `/institute-setup/buildings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              instituteSetupType.buildings,
              instituteSetupType.rooms,
              instituteSetupType.roomDetails,
            ],
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

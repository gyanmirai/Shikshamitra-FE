import { instituteSetupApi } from '../instituteSetupApi';
import { instituteSetupType } from 'src/redux/tagTypes';


export const buildingsApi = instituteSetupApi.injectEndpoints({
  endpoints: (builder) => ({
    getBuildings: builder.query({
      query: () => ({
        url: '/buildings',
        method: 'GET',
      }),
      providesTags: [instituteSetupType.buildings],
    }),

    addBuilding: builder.mutation({
      query: (data) => ({
        url: '/buildings',
        method: 'POST',
        data,
      }),
      invalidatesTags: [instituteSetupType.buildings],
    }),

    getBuildingById: builder.query({
      query: (id) => ({
        url: `/buildings/${id}`,
        method: 'GET',
      }),
      providesTags: [instituteSetupType.buildings],
    }),

    updateBuilding: builder.mutation({
      query: ({ id, body }) => ({
        url: `/buildings/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [instituteSetupType.buildings],
    }),

    deleteBuilding: builder.mutation({
      query: (id) => ({
        url: `/buildings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [instituteSetupType.buildings],
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

import { transportApi } from '../transportApi';

// ----------------------------------------------------------------------

export const stopManagementApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get stops (Paginated)
    getStops: builder.query({
      query: ({ pageNumber = 1, pageSize = 10, search, zoneId, status, academicMediumId }) => ({
        url: '/transport/stops',
        method: 'GET',
        params: { pageNumber, pageSize, search, zoneId, status, academicMediumId },
      }),
      providesTags: ['StopManagement'],
    }),

    // Create stop
    createStop: builder.mutation({
      query: ({ body, academicMediumId }) => ({
        url: '/transport/stops',
        method: 'POST',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: ['StopManagement'],
    }),

    // Update stop
    updateStop: builder.mutation({
      query: ({ stopId, body, academicMediumId }) => ({
        url: `/transport/stops/${stopId}`,
        method: 'PUT',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: ['StopManagement'],
    }),

    // Change stop status
    changeStopStatus: builder.mutation({
      query: ({ stopId, body, academicMediumId }) => ({
        url: `/transport/stops/${stopId}/status`,
        method: 'PUT',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: ['StopManagement'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStopsQuery,
  useCreateStopMutation,
  useUpdateStopMutation,
  useChangeStopStatusMutation,
} = stopManagementApi;

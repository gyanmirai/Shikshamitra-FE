import { transportType } from 'src/redux/tagTypes';

import { transportApi } from '../transportApi';

// ----------------------------------------------------------------------

type StopListQuery = {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  zoneId?: string;
  status?: number | string;
  academicMediumId?: string;
};

export const buildStopListRequest = (params?: StopListQuery | void) => {
  const { pageNumber = 1, pageSize = 10, search, zoneId, status, academicMediumId } = params ?? {};

  return {
    url: '/transport/stops',
    method: 'GET',
    params: { pageNumber, pageSize, search, zoneId, status, academicMediumId },
  };
};

export const normalizeStopListResponse = (response: any) => {
  const payload = response?.data ?? response;
  return {
    data: payload?.items ?? payload?.data ?? [],
    totalCount: payload?.totalCount ?? 0,
  };
};

export const stopManagementApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get stops (Paginated)
    getStops: builder.query<any, StopListQuery | void>({
      query: buildStopListRequest,
      transformResponse: normalizeStopListResponse,
      providesTags: [transportType.stopManagement],
    }),

    // Create stop
    createStop: builder.mutation({
      query: ({ body, academicMediumId }) => ({
        url: '/transport/stops',
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      invalidatesTags: [transportType.stopManagement],
    }),

    // Update stop
    updateStop: builder.mutation({
      query: ({ stopId, body, academicMediumId }) => ({
        url: `/transport/stops/${stopId}`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      invalidatesTags: [transportType.stopManagement],
    }),

    // Change stop status
    changeStopStatus: builder.mutation({
      query: ({ stopId, body, academicMediumId }) => ({
        url: `/transport/stops/${stopId}/status`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      invalidatesTags: [transportType.stopManagement],
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

import { transportType } from 'src/redux/tagTypes';

import { transportApi } from '../transportApi';

type StaffListQuery = {
  academicMediumId?: string;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  role?: number | string;
  status?: number | string;
};

type StaffOptionsQuery = {
  academicMediumId?: string;
  role?: number | string;
  onlyAssignable?: boolean;
};

const unwrapResult = (response: any) => response?.data ?? response;

export const normalizeStaffListResponse = (response: any) => {
  const payload = unwrapResult(response);
  return {
    data: payload?.items ?? payload?.data ?? [],
    totalCount: payload?.totalCount ?? 0,
  };
};

export const normalizeOptionsResponse = (response: any) => unwrapResult(response) ?? [];

export const buildStaffListRequest = (params?: StaffListQuery | void) => {
  const { academicMediumId, pageNumber = 1, pageSize = 10, search, role, status } = params ?? {};
  return {
    url: '/transport/staff',
    method: 'GET',
    params: { academicMediumId, pageNumber, pageSize, search, role, status },
  };
};

export const buildStaffOptionsRequest = (params?: StaffOptionsQuery | void) => {
  const { academicMediumId, role, onlyAssignable = false } = params ?? {};
  return {
    url: '/transport/staff/options',
    method: 'GET',
    params: { academicMediumId, role, onlyAssignable },
  };
};

export const driverConductorApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getDriverConductorData: builder.query<any, StaffListQuery | void>({
      query: buildStaffListRequest,
      transformResponse: normalizeStaffListResponse,
      providesTags: [transportType.driverConductorData],
    }),

    getDriverConductorById: builder.query({
      query: ({ staffId, academicMediumId }) => ({
        url: `/transport/staff/${staffId}`,
        method: 'GET',
        params: { academicMediumId },
      }),
      transformResponse: unwrapResult,
      providesTags: [transportType.driverConductorData],
    }),

    getStaffOptions: builder.query<any, StaffOptionsQuery | void>({
      query: buildStaffOptionsRequest,
      transformResponse: normalizeOptionsResponse,
      providesTags: [transportType.driverConductorData],
    }),

    addDriverConductor: builder.mutation({
      query: ({ body, academicMediumId }) => ({
        url: '/transport/staff',
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.driverConductorData],
    }),

    updateDriverConductor: builder.mutation({
      query: ({ staffId, body, academicMediumId }) => ({
        url: `/transport/staff/${staffId}`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.driverConductorData],
    }),

    changeDriverConductorStatus: builder.mutation({
      query: ({ staffId, body, academicMediumId }) => ({
        url: `/transport/staff/${staffId}/status`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.driverConductorData],
    }),

    getAvailableRoutes: builder.query<
      any,
      { academicMediumId?: string; pageNumber?: number; pageSize?: number } | void
    >({
      query: (params) => {
        const { academicMediumId, pageNumber = 1, pageSize = 100 } = params ?? {};
        return {
          url: '/transport/routes',
          method: 'GET',
          params: { academicMediumId, pageNumber, pageSize, status: 0 },
        };
      },
      transformResponse: (response: any) => {
        const payload = unwrapResult(response);
        return (payload?.items ?? payload?.data ?? []).map((route: any) => ({
          id: route.id,
          value: route.id,
          label: route.routeName || route.routeCode,
          name: route.routeName,
          code: route.routeCode,
        }));
      },
      providesTags: [transportType.availableRoutes, transportType.routeManagement],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDriverConductorDataQuery,
  useGetDriverConductorByIdQuery,
  useGetStaffOptionsQuery,
  useGetAvailableRoutesQuery,
  useAddDriverConductorMutation,
  useUpdateDriverConductorMutation,
  useChangeDriverConductorStatusMutation,
} = driverConductorApi;

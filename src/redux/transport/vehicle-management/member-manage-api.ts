import { transportType } from 'src/redux/tagTypes';

import { transportApi } from '../transportApi';

type PagedQuery = {
  academicMediumId?: string;
  pageNumber?: number;
  pageSize?: number;
  search?: string;
};

type ApplicationListQuery = PagedQuery & {
  memberType?: number | string;
  status?: number | string;
  applicationType?: number | string;
};

type CandidateListQuery = PagedQuery & {
  memberType?: number | string;
  excludeExisting?: boolean;
};

type MemberListQuery = PagedQuery & {
  memberType?: number | string;
  status?: number | string;
  routeId?: string;
  stopId?: string;
};

const unwrapResult = (response: any) => response?.data ?? response;

const normalizePagedPayload = (response: any) => {
  const payload = unwrapResult(response);
  return {
    data: payload?.items ?? payload?.data ?? [],
    totalCount: payload?.totalCount ?? 0,
  };
};

const normalizeApplicationRow = (row: any) => ({
  ...row,
  id: row.id,
  applicationId: row.id,
  selectedStudent: row.sourceId ?? row.studentId ?? row.employeeId ?? '',
  sourceId: row.sourceId ?? row.studentId ?? row.employeeId ?? '',
  studentId: row.studentId ?? '',
  employeeId: row.employeeId ?? '',
  memberId: row.memberId,
  avatarUrl: row.photoUrl,
  name: row.name ?? row.applicantName ?? '',
  class: row.className ?? '',
  division: row.divisionName ?? '',
  feeAmount: row.estimatedFeeAmount,
  rollNo: row.rollNo ?? '',
  role: row.role ?? '',
  grNo: row.memberCode ?? '',
  contactNo: row.phoneNo ?? '',
  searchStop: row.requestedStopName ?? row.assignedStopName ?? '',
  requestedStopId: row.requestedStopId,
  requestedStopName: row.requestedStopName,
  assignedStop: row.assignedStopId,
  assignedStopId: row.assignedStopId,
  assignedStopName: row.assignedStopName,
  assignedRoute: row.assignedRouteId,
  assignedRouteId: row.assignedRouteId,
  assignedRouteName: row.assignedRouteName,
  isStopExist: Boolean(row.assignedStopId),
  status: row.status,
  statusName: row.statusName,
});

const normalizeCandidateRow = (row: any) => ({
  ...row,
  id: row.sourceId,
  selectedStudent: row.sourceId,
  studentId: row.memberType === 0 ? row.sourceId : '',
  employeeId: row.memberType === 1 ? row.sourceId : '',
  sourceId: row.sourceId,
  name: row.name ?? '',
  class: row.className ?? '',
  division: row.divisionName ?? '',
  grNo: row.memberCode ?? '',
  rollNo: row.rollNo ?? '',
  contactNo: row.phoneNo ?? '',
});

export const buildTransportApplicationListRequest = (params?: ApplicationListQuery | void) => {
  const {
    academicMediumId,
    pageNumber = 1,
    pageSize = 10,
    search,
    memberType,
    status,
    applicationType,
  } = params ?? {};

  return {
    url: '/transport/applications',
    method: 'GET',
    params: { academicMediumId, pageNumber, pageSize, search, memberType, status, applicationType },
  };
};

export const buildTransportMemberCandidateRequest = (params?: CandidateListQuery | void) => {
  const {
    academicMediumId,
    pageNumber = 1,
    pageSize = 10,
    search,
    memberType,
    excludeExisting = true,
  } = params ?? {};

  return {
    url: '/transport/member-candidates',
    method: 'GET',
    params: { academicMediumId, memberType, search, pageNumber, pageSize, excludeExisting },
  };
};

export const buildTransportCandidateRequest = buildTransportMemberCandidateRequest;

export const buildTransportMemberListRequest = (params?: MemberListQuery | void) => {
  const {
    academicMediumId,
    pageNumber = 1,
    pageSize = 10,
    search,
    memberType,
    status,
    routeId,
    stopId,
  } = params ?? {};

  return {
    url: '/transport/members',
    method: 'GET',
    params: { academicMediumId, pageNumber, pageSize, search, memberType, status, routeId, stopId },
  };
};

export const normalizeTransportApplicationListResponse = (response: any) => {
  const payload = normalizePagedPayload(response);
  return {
    data: payload.data.map(normalizeApplicationRow),
    totalCount: payload.totalCount,
  };
};

export const normalizeTransportCandidateResponse = (response: any) => {
  const payload = normalizePagedPayload(response);
  return {
    data: payload.data.map(normalizeCandidateRow),
    totalCount: payload.totalCount,
  };
};

export const memberManageApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransportMembers: builder.query<any, ApplicationListQuery | void>({
      query: buildTransportApplicationListRequest,
      transformResponse: (response: any) =>
        normalizeTransportApplicationListResponse(response).data,
      providesTags: [transportType.member],
    }),
    getTransportApplications: builder.query<any, ApplicationListQuery | void>({
      query: buildTransportApplicationListRequest,
      transformResponse: normalizeTransportApplicationListResponse,
      providesTags: [transportType.member],
    }),
    getTransportMemberCandidates: builder.query<any, CandidateListQuery | void>({
      query: buildTransportMemberCandidateRequest,
      transformResponse: normalizeTransportCandidateResponse,
      providesTags: [transportType.member],
    }),
    getTransportMembersList: builder.query<any, MemberListQuery | void>({
      query: buildTransportMemberListRequest,
      transformResponse: normalizePagedPayload,
      providesTags: [transportType.member],
    }),
    getTransportMemberAssignments: builder.query({
      query: ({ memberId, academicMediumId, pageNumber = 1, pageSize = 10 }) => ({
        url: `/transport/members/${memberId}/assignments`,
        method: 'GET',
        params: { academicMediumId, pageNumber, pageSize },
      }),
      transformResponse: normalizePagedPayload,
      providesTags: [transportType.member],
    }),
    addTransportMember: builder.mutation({
      query: ({ body, academicMediumId }) => ({
        url: '/transport/applications',
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      transformResponse: (response: any) => normalizeApplicationRow(unwrapResult(response)),
      invalidatesTags: [transportType.member],
    }),
    updateTransportApplication: builder.mutation({
      query: ({ applicationId, body, academicMediumId }) => ({
        url: `/transport/applications/${applicationId}`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: (response: any) => normalizeApplicationRow(unwrapResult(response)),
      invalidatesTags: [transportType.member, transportType.routeStop],
    }),
    changeTransportMemberStatus: builder.mutation({
      query: ({ memberId, body, academicMediumId }) => ({
        url: `/transport/members/${memberId}/status`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      transformResponse: unwrapResult,
      invalidatesTags: [transportType.member],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTransportMembersQuery,
  useGetTransportApplicationsQuery,
  useGetTransportMemberCandidatesQuery,
  useGetTransportMembersListQuery,
  useGetTransportMemberAssignmentsQuery,
  useAddTransportMemberMutation,
  useUpdateTransportApplicationMutation,
  useChangeTransportMemberStatusMutation,
} = memberManageApi;

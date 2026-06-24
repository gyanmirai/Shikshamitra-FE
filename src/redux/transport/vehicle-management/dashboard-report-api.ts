import { transportType } from 'src/redux/tagTypes';

import { transportApi } from '../transportApi';

export type TransportDashboardQuery = {
  academicMediumId?: string;
  academicYearId?: string;
};

export type TransportDashboardAlertsQuery = TransportDashboardQuery & {
  pageNumber?: number;
  pageSize?: number;
  category?: string;
  severity?: string;
};

export type TransportReportQuery = TransportDashboardQuery & {
  reportKey?: string;
  pageNumber?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
  routeId?: string;
  stopId?: string;
  vehicleId?: string;
  staffId?: string;
  memberType?: number;
  status?: string;
};

export type TransportDashboardRouteUsage = {
  routeId: string;
  routeName: string;
  routeCode: string;
  capacity: number;
  occupiedSeats: number;
  remainingSeats: number;
  usagePercent: number;
  hasVehicleAssignment: boolean;
  vehicleRegistrationNo?: string | null;
  driverName?: string | null;
};

export type TransportDashboardOperationRow = {
  routeId: string;
  routeName: string;
  routeCode: string;
  status: string;
  stops: number;
  members: number;
  capacity: number;
  vehicle?: string | null;
  driver?: string | null;
  conductor?: string | null;
};

export type TransportDashboardSummary = {
  activeStops: number;
  inactiveStops: number;
  activeRoutes: number;
  inactiveRoutes: number;
  activeVehicles: number;
  inactiveVehicles: number;
  maintenanceVehicles: number;
  activeDrivers: number;
  activeConductors: number;
  inactiveStaff: number;
  activeMembers: number;
  inactiveMembers: number;
  studentMembers: number;
  employeeMembers: number;
  pendingApplications: number;
  approvedApplications: number;
  heldApplications: number;
  rejectedApplications: number;
  cancelledApplications: number;
  pendingFeeDues: number;
  postedFeeDues: number;
  pendingStudentDues: number;
  pendingEmployeeDues: number;
  pendingDueAmount: number;
  assignedRoutes: number;
  unassignedRoutes: number;
  routeCapacity: number;
  occupiedSeats: number;
  routeCapacityUsagePercent: number;
  missingRequiredDocuments: number;
  expiringComplianceItems: number;
  feeRunsPendingFinancePost: number;
  routeCapacityUsage: TransportDashboardRouteUsage[];
  activeRouteOperations: TransportDashboardOperationRow[];
};

export type TransportDashboardAlert = {
  id: string;
  category: string;
  severity: string;
  title: string;
  message: string;
  entityId?: string | null;
  entityType?: string | null;
  createdAt: string;
};

export type TransportReportCatalogItem = {
  key: string;
  title: string;
  category: string;
  description: string;
  isSupported: boolean;
};

export type TransportReportResult = {
  key: string;
  title: string;
  category: string;
  isSupported: boolean;
  message?: string | null;
  totalCount: number;
  columns: { key: string; label: string }[];
  items: Record<string, string | null>[];
};

const unwrapResult = (response: any) =>
  response && Object.prototype.hasOwnProperty.call(response, 'data')
    ? response.data
    : (response ?? []);

const reportParams = (params?: TransportReportQuery | void) => ({
  academicMediumId: params?.academicMediumId,
  academicYearId: params?.academicYearId,
  pageNumber: params?.pageNumber ?? 1,
  pageSize: params?.pageSize ?? 10,
  fromDate: params?.fromDate,
  toDate: params?.toDate,
  routeId: params?.routeId,
  stopId: params?.stopId,
  vehicleId: params?.vehicleId,
  staffId: params?.staffId,
  memberType: params?.memberType,
  status: params?.status,
});

export const buildTransportDashboardSummaryRequest = (params?: TransportDashboardQuery | void) => ({
  url: '/transport/dashboard/summary',
  method: 'GET',
  params: {
    academicMediumId: params?.academicMediumId,
    academicYearId: params?.academicYearId,
  },
});

export const buildTransportDashboardAlertsRequest = (
  params?: TransportDashboardAlertsQuery | void
) => ({
  url: '/transport/dashboard/alerts',
  method: 'GET',
  params: {
    academicMediumId: params?.academicMediumId,
    academicYearId: params?.academicYearId,
    pageNumber: params?.pageNumber ?? 1,
    pageSize: params?.pageSize ?? 10,
    category: params?.category,
    severity: params?.severity,
  },
});

export const buildTransportReportCatalogRequest = (params?: TransportDashboardQuery | void) => ({
  url: '/transport/reports/catalog',
  method: 'GET',
  params: {
    academicMediumId: params?.academicMediumId,
  },
});

export const buildTransportReportRowsRequest = (params?: TransportReportQuery | void) => ({
  url: `/transport/reports/${params?.reportKey}`,
  method: 'GET',
  params: reportParams(params),
});

export const buildTransportReportExportRequest = (params?: TransportReportQuery | void) => ({
  url: `/transport/reports/${params?.reportKey}/export`,
  method: 'GET',
  params: {
    ...reportParams(params),
    format: 'csv',
  },
  responseHandler: (response: Response) => response.blob(),
});

export const normalizeTransportPagedResponse = (response: any) => {
  const data = unwrapResult(response);
  return {
    data: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
  };
};

export const dashboardReportApi = transportApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransportDashboardSummary: builder.query<
      TransportDashboardSummary,
      TransportDashboardQuery | void
    >({
      query: buildTransportDashboardSummaryRequest,
      transformResponse: unwrapResult,
      providesTags: [transportType.transportDashboard],
    }),
    getTransportDashboardAlerts: builder.query<any, TransportDashboardAlertsQuery | void>({
      query: buildTransportDashboardAlertsRequest,
      transformResponse: normalizeTransportPagedResponse,
      providesTags: [transportType.transportDashboard],
    }),
    getTransportReportCatalog: builder.query<
      TransportReportCatalogItem[],
      TransportDashboardQuery | void
    >({
      query: buildTransportReportCatalogRequest,
      transformResponse: unwrapResult,
      providesTags: [transportType.transportReports],
    }),
    getTransportReport: builder.query<TransportReportResult, TransportReportQuery | void>({
      query: buildTransportReportRowsRequest,
      transformResponse: unwrapResult,
      providesTags: [transportType.transportReports],
    }),
    exportTransportReport: builder.query<Blob, TransportReportQuery | void>({
      query: buildTransportReportExportRequest,
      providesTags: [transportType.transportReports],
    }),
  }),
});

export const {
  useGetTransportDashboardSummaryQuery,
  useGetTransportDashboardAlertsQuery,
  useGetTransportReportCatalogQuery,
  useGetTransportReportQuery,
  useLazyExportTransportReportQuery,
} = dashboardReportApi;

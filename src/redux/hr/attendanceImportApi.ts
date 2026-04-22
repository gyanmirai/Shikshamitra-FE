import { employeeType } from 'src/redux/tagTypes';

import { api } from '../service';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AttendanceImportItem {
  id: string;
  fileName: string;
  importedByUserId: string;
  importedByName: string;
  importedAt: string;
  status: string;
  payrollMonth: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  createCount: number;
  replaceCount: number;
  processedRows: number;
  createdCount: number;
  replacedCount: number;
  canOpen: boolean;
  runSource: string;
  externalCorrelationId: string;
  integrationProvider: string;
  isBatchLocked: boolean;
}

export interface AttendanceImportListResponse {
  items: AttendanceImportItem[];
  totalCount: number;
}

export interface AttendanceImportDetail extends AttendanceImportItem {
  confirmedAt?: string;
  previewTokenExpiresAt?: string;
  errorsSummary?: string[];
  warningsSummary?: string[];
}

export interface AttendanceImportRow {
  rowNumber: number;
  action: string;
  attendanceDate: string;
  employeeCode: string;
  employeeName: string;
  contactNo: string;
  timeIn: string;
  timeOut: string;
  status: string;
  remarks: string;
  errors: string[];
  warnings: string[];
}

export interface AttendanceImportRowsResponse {
  items: AttendanceImportRow[];
  totalCount: number;
}

// ─── API ────────────────────────────────────────────────────────────────────────

export const attendanceImportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // 1. GET /api/hr/attendance/automated-runs
    getAttendanceImports: builder.query<
      AttendanceImportListResponse,
      {
        payrollMonth?: string;
        search?: string;
        skipCount?: number;
        maxResultCount?: number;
      }
    >({
      query: ({ payrollMonth, search, skipCount = 0, maxResultCount = 50 }) => ({
        url: '/hr/attendance/automated-runs',
        method: 'GET',
        params: { payrollMonth, search, skipCount, maxResultCount },
      }),
      providesTags: [employeeType.attendanceImport],
    }),

    // 2. GET /api/hr/attendance/automated-runs/{importId}
    getAttendanceImportById: builder.query<AttendanceImportDetail, { id: string }>({
      query: ({ id }) => ({
        url: `/hr/attendance/automated-runs/${id}`,
        method: 'GET',
      }),
      providesTags: [employeeType.attendanceImport],
    }),

    // 3. GET /api/hr/attendance/automated-runs/{importId}/rows
    getAttendanceImportRows: builder.query<
      AttendanceImportRowsResponse,
      {
        id: string;
        skipCount?: number;
        maxResultCount?: number;
      }
    >({
      query: ({ id, skipCount = 0, maxResultCount = 50 }) => ({
        url: `/hr/attendance/automated-runs/${id}/rows`,
        method: 'GET',
        params: { skipCount, maxResultCount },
      }),
      providesTags: [employeeType.attendanceImport],
    }),
  }),
});

export const {
  useGetAttendanceImportsQuery,
  useGetAttendanceImportByIdQuery,
  useGetAttendanceImportRowsQuery,
} = attendanceImportApi;

import type { AttendanceImportBatchStatus } from 'src/enums/attendance-import-batch-statusType';

import { employeeType } from 'src/redux/tagTypes';

import { api } from '../service';

// ─── Types ─────────────────────────────────────────────────────────────────────
export enum AttendanceImportRunSource {
  FileUpload = 0,
  Integration = 1,
  Internal = 2,
}

export interface AttendanceImportItem {
  id: string;
  fileName: string;
  importedByUserId: string;
  importedByName: string;
  importedAt: string;
  status: AttendanceImportBatchStatus;
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
  runSource: AttendanceImportRunSource;
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

export enum AttendanceImportRowStatusCode {
  Present = 0,
  Absent = 1,
  HalfDay = 2,
}

export interface AttendanceImportRow {
  id: string;
  employeeId?: string | null;
  rowNumber: number;
  action: string;
  attendanceDate: string;
  employeeCode: string;
  employeeName: string;
  contactNo: string;
  timeIn: string;
  timeOut: string;
  status: string;
  statusCode?: AttendanceImportRowStatusCode | null;
  remarks: string;
  errors: string[];
  warnings: string[];
}

export interface AttendanceImportRowsResponse {
  items: AttendanceImportRow[];
  totalCount: number;
}

export interface AttendanceImportRowsSaveEntry {
  rowId: string;
  employeeId: string;
  attendanceDate: string;
  statusWire: string;
  inTime?: string;
  outTime?: string;
  remarks?: string;
}

export interface AttendanceImportRowsSaveRequest {
  importId: string;
  entries: AttendanceImportRowsSaveEntry[];
}

export interface AttendanceImportRowsSaveResponse {
  upsertedCount: number;
}

export const buildAttendanceImportFileDownloadUrl = (importId: string) =>
  `/hr/attendance/automated-runs/${importId}/download-file`;

export const buildAttendanceImportErrorReportDownloadUrl = (importId: string) =>
  `/hr/attendance/automated-runs/${importId}/download-error-report`;

export const buildSaveAttendanceImportRowsQuery = ({
  importId,
  entries,
}: AttendanceImportRowsSaveRequest) => ({
  url: `/hr/attendance/automated-runs/${importId}/rows/save`,
  method: 'POST',
  body: { entries },
});

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

    lockAttendanceImportBatch: builder.mutation<void, { batchId: string }>({
      query: ({ batchId }) => ({
        url: `/hr/attendance/automated-runs/${batchId}/lock`,
        method: 'POST',
      }),
      invalidatesTags: [employeeType.attendanceImport],
    }),

    unlockAttendanceImportBatch: builder.mutation<void, { batchId: string }>({
      query: ({ batchId }) => ({
        url: `/hr/attendance/automated-runs/${batchId}/lock`,
        method: 'DELETE',
      }),
      invalidatesTags: [employeeType.attendanceImport],
    }),

    saveAttendanceImportRows: builder.mutation<
      AttendanceImportRowsSaveResponse,
      AttendanceImportRowsSaveRequest
    >({
      query: buildSaveAttendanceImportRowsQuery,
      invalidatesTags: [
        employeeType.attendanceImport,
        employeeType.attendance,
        employeeType.runPayroll,
      ],
    }),

    downloadAttendanceImportFile: builder.mutation<Blob, { importId: string }>({
      query: ({ importId }) => ({
        url: buildAttendanceImportFileDownloadUrl(importId),
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

    downloadAttendanceImportErrorReport: builder.mutation<Blob, { importId: string }>({
      query: ({ importId }) => ({
        url: buildAttendanceImportErrorReportDownloadUrl(importId),
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetAttendanceImportsQuery,
  useGetAttendanceImportByIdQuery,
  useGetAttendanceImportRowsQuery,
  useLockAttendanceImportBatchMutation,
  useUnlockAttendanceImportBatchMutation,
  useSaveAttendanceImportRowsMutation,
  useDownloadAttendanceImportFileMutation,
  useDownloadAttendanceImportErrorReportMutation,
} = attendanceImportApi;

import { employeeType } from 'src/redux/tagTypes';

import { api } from '../service';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AttendanceImportItem {
  id: string;
  fileName: string;
  importedByUserId: string;
  importedByName: string;
  importedAt: string;
  status: number; // 0=All, 1=Processed, 2=Failed, 3=Pending
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
  // status inherited as number from AttendanceImportItem
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
    // 1. GET /api/payroll/attendance-imports
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
        url: '/payroll/attendance-imports',
        method: 'GET',
        params: { payrollMonth, search, skipCount, maxResultCount },
      }),
      providesTags: [employeeType.attendanceImport],
    }),

    // 2. GET /api/payroll/attendance-imports/{importId}
    getAttendanceImportById: builder.query<AttendanceImportDetail, string>({
      query: (importId) => ({
        url: `/payroll/attendance-imports/${importId}`,
        method: 'GET',
      }),
      providesTags: [employeeType.attendanceImport],
    }),

    // 3. GET /api/payroll/attendance-imports/{importId}/rows
    getAttendanceImportRows: builder.query<
      AttendanceImportRowsResponse,
      {
        importId: string;
        skipCount?: number;
        maxResultCount?: number;
      }
    >({
      query: ({ importId, skipCount = 0, maxResultCount = 50 }) => ({
        url: `/payroll/attendance-imports/${importId}/rows`,
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

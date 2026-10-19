import { api } from 'src/redux/service';

export type HrTableExportStatus = {
  id: string;
  name?: string;
  status: 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';
  error: string | null;
  rowCount: number;
  expiresAt: string;
};

export const hrTableExportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createHrTableExport: builder.mutation<
      HrTableExportStatus,
      {
        table: string;
        query: Record<string, unknown>;
        columns: Array<{ id: string; label: string }>;
        format: 'excel' | 'pdf';
      }
    >({ query: (body) => ({ url: '/hr/table-exports', method: 'POST', body }) }),
    hrTableExportStatus: builder.query<HrTableExportStatus, string>({
      query: (id) => `/hr/table-exports/${id}`,
    }),
    downloadHrTableExport: builder.mutation<Blob, string>({
      query: (id) => ({
        url: `/hr/table-exports/${id}/download`,
        responseHandler: (response) => response.blob(),
      }),
    }),
    cancelHrTableExport: builder.mutation<void, string>({
      query: (id) => ({ url: `/hr/table-exports/${id}/cancel`, method: 'POST' }),
    }),
  }),
});

export const {
  useCreateHrTableExportMutation,
  useLazyHrTableExportStatusQuery,
  useDownloadHrTableExportMutation,
  useCancelHrTableExportMutation,
} = hrTableExportApi;

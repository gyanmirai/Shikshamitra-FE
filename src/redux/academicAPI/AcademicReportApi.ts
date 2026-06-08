import { academicType } from 'src/redux/tagTypes';

import { api } from '../service';

export const academicReportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/app/academic-report/options
    getAcademicReportOptions: builder.query({
      query: () => ({
        url: '/app/academic-report/options',
        method: 'GET',
      }),
      providesTags: [academicType.academicReport],
    }),

    // POST /api/app/academic-report/preview
    previewAcademicReport: builder.mutation({
      query: (body) => ({
        url: '/app/academic-report/preview',
        method: 'POST',
        body,
      }),
    }),

    // POST /api/app/academic-report/exports
    createAcademicReportExport: builder.mutation({
      query: (body) => ({
        url: '/app/academic-report/exports',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.academicReportExport],
    }),

    // GET /api/app/academic-report/exports
    getAcademicReportExports: builder.query({
      query: () => ({
        url: '/app/academic-report/exports',
        method: 'GET',
      }),
      providesTags: [academicType.academicReportExport],
    }),

    // GET /api/app/academic-report/exports/{jobId}
    getAcademicReportExportJob: builder.query({
      query: ({ jobId }: { jobId: string }) => ({
        url: `/app/academic-report/exports/${jobId}`,
        method: 'GET',
      }),
    }),

    // GET /api/app/academic-report/exports/{jobId}/download
    downloadAcademicReport: builder.query({
      query: ({ jobId }: { jobId: string }) => ({
        url: `/app/academic-report/exports/${jobId}/download`,
        method: 'GET',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAcademicReportOptionsQuery,
  usePreviewAcademicReportMutation,
  useCreateAcademicReportExportMutation,
  useGetAcademicReportExportsQuery,
  useGetAcademicReportExportJobQuery,
  useLazyGetAcademicReportExportJobQuery,
  useDownloadAcademicReportQuery,
  useLazyDownloadAcademicReportQuery,
} = academicReportApi;

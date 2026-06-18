import { studentReportType } from 'src/redux/tagTypes';

import { api } from '../../service';

export const studentReportApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // POST /app/student-report/preview
    previewStudentReport: builder.mutation({
      query: (body) => ({
        url: '/app/student-report/preview',
        method: 'POST',
        body,
      }),
    }),

    // POST /app/student-report/exports
    createStudentReportExport: builder.mutation({
      query: (body) => ({
        url: '/app/student-report/exports',
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentReportType.studentReportExport],
    }),

    // GET /app/student-report/exports
    getStudentReportExports: builder.query({
      query: () => ({
        url: '/app/student-report/exports',
        method: 'GET',
      }),
      providesTags: [studentReportType.studentReportExport],
    }),

    // GET /app/student-report/exports/{jobId}
    getStudentReportExportJob: builder.query({
      query: ({ jobId }: { jobId: string }) => ({
        url: `/app/student-report/exports/${jobId}`,
        method: 'GET',
      }),
    }),

    // GET /app/student-report/exports/{jobId}/download
    downloadStudentReport: builder.query({
      query: ({ jobId }: { jobId: string }) => ({
        url: `/app/student-report/exports/${jobId}/download`,
        method: 'GET',
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  usePreviewStudentReportMutation,
  useCreateStudentReportExportMutation,
  useGetStudentReportExportsQuery,
  useGetStudentReportExportJobQuery,
  useLazyGetStudentReportExportJobQuery,
  useDownloadStudentReportQuery,
  useLazyDownloadStudentReportQuery,
} = studentReportApi;

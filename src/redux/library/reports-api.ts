import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import {
  toLibraryPaginatedList,
  mapLibraryReportOptionsDto,
  mapLibraryReportPreviewDto,
  mapLibraryReportExportJobDto,
} from './library-adapters';

const readFileName = (contentDisposition: string | null) => {
  if (!contentDisposition) return 'library-report-export';

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1].replace(/"/g, ''));

  const plainMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return plainMatch?.[1] || 'library-report-export';
};

export const libraryReportsApi = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryReportOptions: builder.query({
      query: () => ({
        url: '/library/reports/options',
        method: 'GET',
      }),
      transformResponse: mapLibraryReportOptionsDto,
      providesTags: [libraryModuleType.reports],
    }),

    previewLibraryReport: builder.mutation({
      query: (body) => ({
        url: '/library/reports/preview',
        method: 'POST',
        body,
      }),
      transformResponse: mapLibraryReportPreviewDto,
    }),

    createLibraryReportExport: builder.mutation({
      query: (body) => ({
        url: '/library/reports/exports',
        method: 'POST',
        body,
      }),
      invalidatesTags: [libraryModuleType.reportExports],
    }),

    getLibraryReportExports: builder.query({
      query: (params) => ({
        url: '/library/reports/exports',
        method: 'GET',
        params,
      }),
      transformResponse: (response) =>
        toLibraryPaginatedList(response, mapLibraryReportExportJobDto),
      providesTags: [libraryModuleType.reportExports],
    }),

    getLibraryReportExport: builder.query({
      query: ({ jobId }) => ({
        url: `/library/reports/exports/${jobId}`,
        method: 'GET',
      }),
      transformResponse: mapLibraryReportExportJobDto,
      providesTags: (result, error, { jobId }) => [
        { type: libraryModuleType.reportExports, id: jobId },
      ],
    }),

    downloadLibraryReportExport: builder.query({
      query: ({ jobId }) => ({
        url: `/library/reports/exports/${jobId}/download`,
        method: 'GET',
        responseHandler: async (response: Response) => {
          const blob = await response.blob();
          const fileName = readFileName(response.headers.get('content-disposition'));
          return { blob, fileName };
        },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLibraryReportOptionsQuery,
  usePreviewLibraryReportMutation,
  useCreateLibraryReportExportMutation,
  useGetLibraryReportExportsQuery,
  useGetLibraryReportExportQuery,
  useLazyDownloadLibraryReportExportQuery,
} = libraryReportsApi;

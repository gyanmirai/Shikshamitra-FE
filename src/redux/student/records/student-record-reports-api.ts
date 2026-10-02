import { api } from 'src/redux/service';
import { studentType } from 'src/redux/tagTypes';

import { unwrapRecordsResult } from './student-records-api';

export type RecordsReportType = 'Directory' | 'Changes' | 'Documents' | 'Transitions';
export interface RecordsReportInput {
  reportType: RecordsReportType;
  academicYearId?: string;
  studentId?: string;
  status?: string;
  clientKey?: string;
  skipCount?: number;
  maxResultCount?: number;
}
export interface RecordsReportPreview { columns: string[]; rows: Record<string, string | null>[]; totalCount: number; asOf: string }
export interface RecordsReportJob {
  id: string; reportType: RecordsReportType; status: 'Queued' | 'Generating' | 'Completed' | 'Failed' | 'Expired' | 'Cancelled';
  errorCode?: string; rowCount?: number; creationTime: string; expiresAt: string; canDownload: boolean; request: RecordsReportInput;
}
const historyTag = [{ type: studentType.student, id: 'RECORDS-REPORTS' }];
export const recordsReportApi = api.injectEndpoints({
  endpoints: builder => ({
    getRecordsReportPreview: builder.query<RecordsReportPreview, RecordsReportInput>({
      query: params => ({ url: '/students/records/reports/preview', params }),
      transformResponse: (result: RecordsReportPreview | { data?: RecordsReportPreview }) => unwrapRecordsResult(result),
      providesTags: [{ type: studentType.student, id: 'RECORDS-DIRECTORY' }, { type: studentType.student, id: 'RECORDS-CHANGES' }, { type: studentType.student, id: 'RECORDS-TRANSITIONS' }, { type: studentType.student, id: 'RECORDS-DOCUMENTS' }],
    }),
    getRecordsReportJobs: builder.query<{ items: RecordsReportJob[]; totalCount: number }, { skipCount: number; maxResultCount: number }>({
      query: params => ({ url: '/students/records/reports', params }),
      transformResponse: (result: { items: RecordsReportJob[]; totalCount: number } | { data?: { items: RecordsReportJob[]; totalCount: number } }) => unwrapRecordsResult(result),
      providesTags: historyTag,
    }),
    createRecordsReport: builder.mutation<RecordsReportJob, RecordsReportInput>({
      query: body => ({ url: '/students/records/reports', method: 'POST', body }),
      transformResponse: (result: RecordsReportJob | { data?: RecordsReportJob }) => unwrapRecordsResult(result),
      invalidatesTags: (_result, error) => error ? [] : historyTag,
    }),
    cancelRecordsReport: builder.mutation<RecordsReportJob, string>({
      query: id => ({ url: `/students/records/reports/${encodeURIComponent(id)}/cancel`, method: 'POST' }),
      transformResponse: (result: RecordsReportJob | { data?: RecordsReportJob }) => unwrapRecordsResult(result),
      invalidatesTags: (_result, error) => error ? [] : historyTag,
    }),
    downloadRecordsReport: builder.mutation<Blob, string>({
      query: id => ({ url: `/students/records/reports/${encodeURIComponent(id)}/download`, method: 'GET', responseHandler: response => response.blob() }),
    }),
  }),
});
export const { useGetRecordsReportPreviewQuery, useGetRecordsReportJobsQuery, useCreateRecordsReportMutation, useCancelRecordsReportMutation, useDownloadRecordsReportMutation } = recordsReportApi;

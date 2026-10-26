import { api } from 'src/redux/service';
import { studentType, organizationType } from 'src/redux/tagTypes';

import { studentDirectoryQueryParams } from './student-directory-query';

import type {
  RecordsPage,
  SaveRecordsDraft,
  RecordsPolicyPreview,
  StudentDirectoryItem,
  StudentDirectoryInput,
  RecordsLegacyOverride,
  StudentRecordsSettings,
  StudentDirectoryOptions,
} from './student-records-types';

export const unwrapRecordsResult = <T>(response: T | { data?: T }): T =>
  response && typeof response === 'object' && 'data' in response && response.data !== undefined
    ? response.data
    : (response as T);
const settingsTag = (year?: string | null) => [
  { type: studentType.student, id: `RECORDS-SETTINGS-${year ?? 'school'}` },
];
const directoryTag = [{ type: studentType.student, id: 'RECORDS-DIRECTORY' }];
export const studentRecordsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentRecordsDirectoryOptions: builder.query<
      StudentDirectoryOptions,
      { academicYearId?: string }
    >({
      query: (params) => ({ url: '/students/records/directory/options', params }),
      transformResponse: (response: StudentDirectoryOptions | { data?: StudentDirectoryOptions }) =>
        unwrapRecordsResult(response),
      providesTags: [organizationType.academicHierarchyOptions],
    }),
    getStudentRecordsSettingsRoles: builder.query<{ items: { name: string }[] }, void>({
      query: () => '/students/records/settings/roles',
      transformResponse: (
        response: { items: { name: string }[] } | { data?: { items: { name: string }[] } }
      ) => unwrapRecordsResult(response),
      providesTags: [{ type: studentType.student, id: 'RECORDS-SETTINGS-ROLES' }],
    }),
    getStudentRecordsSettings: builder.query<
      StudentRecordsSettings,
      { academicYearId?: string } | void
    >({
      query: (params) => ({ url: '/students/records/settings', params: params ?? undefined }),
      transformResponse: (response: StudentRecordsSettings | { data?: StudentRecordsSettings }) =>
        unwrapRecordsResult(response),
      providesTags: (_result, _error, params) => settingsTag(params?.academicYearId),
    }),
    saveStudentRecordsDraft: builder.mutation<StudentRecordsSettings, SaveRecordsDraft>({
      query: (body) => ({ url: '/students/records/settings/draft', method: 'PUT', body }),
      transformResponse: (response: StudentRecordsSettings | { data?: StudentRecordsSettings }) =>
        unwrapRecordsResult(response),
      invalidatesTags: (_result, error, body) => (error ? [] : settingsTag(body.academicYearId)),
    }),
    previewStudentRecordsPolicy: builder.mutation<RecordsPolicyPreview, SaveRecordsDraft>({
      query: (body) => ({ url: '/students/records/settings/preview', method: 'POST', body }),
      transformResponse: (response: RecordsPolicyPreview | { data?: RecordsPolicyPreview }) =>
        unwrapRecordsResult(response),
    }),
    publishStudentRecordsPolicy: builder.mutation<
      StudentRecordsSettings,
      { academicYearId?: string | null; concurrencyStamp: string }
    >({
      query: (body) => ({ url: '/students/records/settings/publish', method: 'POST', body }),
      transformResponse: (response: StudentRecordsSettings | { data?: StudentRecordsSettings }) =>
        unwrapRecordsResult(response),
      invalidatesTags: (_result, error, body) => (error ? [] : [studentType.student]),
    }),
    getStudentRecordsDirectory: builder.query<
      RecordsPage<StudentDirectoryItem>,
      StudentDirectoryInput
    >({
      query: (params) => ({
        url: '/students/records/directory',
        params: studentDirectoryQueryParams(params),
      }),
      transformResponse: (
        response: RecordsPage<StudentDirectoryItem> | { data?: RecordsPage<StudentDirectoryItem> }
      ) => unwrapRecordsResult(response),
      providesTags: directoryTag,
    }),
    getStudentRecordsLegacyOverrides: builder.query<
      RecordsPage<RecordsLegacyOverride>,
      { skipCount?: number; maxResultCount?: number }
    >({
      query: (params) => ({ url: '/students/records/directory/legacy-overrides', params }),
      transformResponse: (
        response: RecordsPage<RecordsLegacyOverride> | { data?: RecordsPage<RecordsLegacyOverride> }
      ) => unwrapRecordsResult(response),
      providesTags: [{ type: studentType.student, id: 'RECORDS-LEGACY' }],
    }),
    getStudentRecordsLegacyCandidates: builder.query<
      RecordsPage<StudentDirectoryItem>,
      StudentDirectoryInput
    >({
      query: (params) => ({ url: '/students/records/directory/legacy-candidates', params }),
      transformResponse: (
        response: RecordsPage<StudentDirectoryItem> | { data?: RecordsPage<StudentDirectoryItem> }
      ) => unwrapRecordsResult(response),
      providesTags: [{ type: studentType.student, id: 'RECORDS-LEGACY' }],
    }),
    requestStudentRecordsLegacyOverride: builder.mutation<
      RecordsLegacyOverride,
      { studentId: string; reason: string; evidenceReference?: string }
    >({
      query: ({ studentId, ...body }) => ({
        url: `/students/records/directory/${studentId}/legacy-overrides`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: RecordsLegacyOverride | { data?: RecordsLegacyOverride }) =>
        unwrapRecordsResult(response),
      invalidatesTags: (_result, error) =>
        error ? [] : [{ type: studentType.student, id: 'RECORDS-LEGACY' }],
    }),
    approveStudentRecordsLegacyOverride: builder.mutation<
      RecordsLegacyOverride,
      { id: string; remarks?: string; concurrencyStamp?: string | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/students/records/directory/legacy-overrides/${id}/approve`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: RecordsLegacyOverride | { data?: RecordsLegacyOverride }) =>
        unwrapRecordsResult(response),
      invalidatesTags: (_result, error) =>
        error ? [] : [...directoryTag, { type: studentType.student, id: 'RECORDS-LEGACY' }],
    }),
    rejectStudentRecordsLegacyOverride: builder.mutation<
      RecordsLegacyOverride,
      { id: string; remarks?: string; concurrencyStamp?: string | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/students/records/directory/legacy-overrides/${id}/reject`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: RecordsLegacyOverride | { data?: RecordsLegacyOverride }) =>
        unwrapRecordsResult(response),
      invalidatesTags: (_result, error) =>
        error ? [] : [{ type: studentType.student, id: 'RECORDS-LEGACY' }],
    }),
  }),
});
export const {
  useGetStudentRecordsDirectoryOptionsQuery,
  useGetStudentRecordsSettingsRolesQuery,
  useGetStudentRecordsSettingsQuery,
  useSaveStudentRecordsDraftMutation,
  usePreviewStudentRecordsPolicyMutation,
  usePublishStudentRecordsPolicyMutation,
  useGetStudentRecordsDirectoryQuery,
  useGetStudentRecordsLegacyOverridesQuery,
  useGetStudentRecordsLegacyCandidatesQuery,
  useRequestStudentRecordsLegacyOverrideMutation,
  useApproveStudentRecordsLegacyOverrideMutation,
  useRejectStudentRecordsLegacyOverrideMutation,
} = studentRecordsApi;

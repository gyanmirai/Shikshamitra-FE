import { api } from 'src/redux/service';
import { studentType, studentOnboardingType } from 'src/redux/tagTypes';

import { unwrapRecordsResult } from './student-records-api';

import type { RecordsPage } from './student-records-types';

export type RecordSection =
  | 'general'
  | 'family'
  | 'communication'
  | 'additional'
  | 'medical'
  | 'bank'
  | 'previous-school'
  | 'placement'
  | 'status'
  | 'custom-details'
  | 'registration-form'
  | 'photo';
export type RecordChange = {
  id: string;
  studentId: string;
  studentName: string;
  academicYearId: string;
  requestedBy: string;
  requestedByName?: string | null;
  correctsChangeId?: string | null;
  policyVersionId?: string | null;
  section: RecordSection;
  action: string;
  reason: string;
  status: string;
  concurrencyStamp: string;
  effectiveAt: string;
  appliedAt?: string | null;
  creationTime: string;
  approvalCount: number;
  requiredApprovals: number;
  before?: Record<string, unknown> | null;
  proposed?: Record<string, unknown> | null;
  exceptionCode?: string | null;
  canApprove: boolean;
  canCancel: boolean;
  payloadMasked: boolean;
  photoPreviewUrl?: string | null;
  decisions: {
    actorId: string;
    actorName?: string | null;
    stage: number;
    decision: string;
    reason: string;
    creationTime: string;
  }[];
};
export type RecordSnapshot = {
  section: RecordSection;
  snapshot: string;
  data: Record<string, any>;
};
export type CreateRecordChange = {
  studentId: string;
  section: RecordSection;
  clientKey: string;
  reason: string;
  expectedSnapshot: string;
  payload: Record<string, unknown>;
  effectiveAt?: string;
  correctsChangeId?: string;
};
const changesTag = [{ type: studentType.student, id: 'RECORDS-CHANGES' }];
const refreshTags = [
  ...changesTag,
  { type: studentType.student, id: 'MODULE-DASHBOARD-records' },
  { type: studentType.student, id: 'RECORDS-DIRECTORY' },
  { type: studentType.student, id: 'LIST' },
];
export const studentRecordChangesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentRecordPhotoPreview: builder.query<Blob, { studentId: string; draftId: string }>({
      query: ({ studentId, draftId }) => ({
        url: `/students/records/changes/students/${studentId}/photo-drafts/${draftId}`,
        responseHandler: (response) => response.blob(),
      }),
      providesTags: [{ type: studentType.student, id: 'RECORDS-CHANGES' }],
    }),
    uploadStudentRecordPhotoDraft: builder.mutation<
      { id: string; photoUrl: string },
      { studentId: string; body: FormData }
    >({
      query: ({ studentId, body }) => ({
        url: `/students/records/changes/students/${studentId}/photo-drafts`,
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: { id: string; photoUrl: string } | { data?: { id: string; photoUrl: string } }
      ) => unwrapRecordsResult(response),
    }),
    getStudentRecordChanges: builder.query<
      RecordsPage<RecordChange>,
      {
        studentId?: string;
        academicYearId?: string;
        approvableOnly?: boolean;
        boardId?: string;
        mediumId?: string;
        standardId?: string;
        divisionId?: string;
        status?: string;
        skipCount?: number;
        maxResultCount?: number;
      }
    >({
      query: (params) => ({ url: '/students/records/changes', params }),
      transformResponse: (
        response: RecordsPage<RecordChange> | { data?: RecordsPage<RecordChange> }
      ) => unwrapRecordsResult(response),
      providesTags: changesTag,
    }),
    getStudentRecordChange: builder.query<RecordChange, string>({
      query: (id) => `/students/records/changes/${id}`,
      transformResponse: (response: RecordChange | { data?: RecordChange }) =>
        unwrapRecordsResult(response),
      providesTags: changesTag,
    }),
    getStudentRecordSnapshot: builder.query<
      RecordSnapshot,
      { studentId: string; section: RecordSection }
    >({
      query: ({ studentId, section }) =>
        `/students/records/changes/students/${studentId}/snapshot/${section}`,
      transformResponse: (response: RecordSnapshot | { data?: RecordSnapshot }) =>
        'section' in response ? response : unwrapRecordsResult<RecordSnapshot>(response),
      providesTags: (_result, _error, { studentId, section }) => [
        { type: studentType.student, id: `RECORDS-SNAPSHOT-${studentId}-${section}` },
        ...(section === 'placement' ? [studentOnboardingType.rollNumberBatch] : []),
      ],
    }),
    createStudentRecordChange: builder.mutation<RecordChange, CreateRecordChange>({
      query: (body) => ({ url: '/students/records/changes', method: 'POST', body }),
      transformResponse: (response: RecordChange | { data?: RecordChange }) =>
        unwrapRecordsResult(response),
      invalidatesTags: (_result, error, body) =>
        error
          ? []
          : [
              ...refreshTags,
              { type: studentType.student, id: `RECORDS-DETAILS-${body.studentId}` },
              { type: studentType.student, id: `RECORDS-PROFILE-${body.studentId}` },
              {
                type: studentType.student,
                id: `RECORDS-SNAPSHOT-${body.studentId}-${body.section}`,
              },
            ],
    }),
    decideStudentRecordChange: builder.mutation<
      RecordChange,
      {
        id: string;
        command: 'approve' | 'reject' | 'cancel';
        reason: string;
        concurrencyStamp: string;
      }
    >({
      query: ({ id, command, ...body }) => ({
        url: `/students/records/changes/${id}/${command}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: RecordChange | { data?: RecordChange }) =>
        unwrapRecordsResult(response),
      invalidatesTags: (_result, error) => (error ? [] : [studentType.student]),
    }),
  }),
});
export const {
  useGetStudentRecordPhotoPreviewQuery,
  useUploadStudentRecordPhotoDraftMutation,
  useGetStudentRecordChangesQuery,
  useGetStudentRecordChangeQuery,
  useGetStudentRecordSnapshotQuery,
  useCreateStudentRecordChangeMutation,
  useDecideStudentRecordChangeMutation,
} = studentRecordChangesApi;

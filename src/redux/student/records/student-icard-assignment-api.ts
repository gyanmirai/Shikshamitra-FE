import type { IdentityCardPhotoEdit } from 'src/components/identity-card-designer/types';

import { api } from 'src/redux/service';

import { unwrapRecordsResult } from './student-records-api';
import { studentDirectoryQueryParams } from './student-directory-query';
import { documentTags, iCardRosterTag, iCardAssignmentTag } from './student-record-documents-api';

import type { RecordsPage } from './student-records-types';
import type { IdCard } from './student-record-documents-api';

export type ICardAssignmentClass = {
  standardId: string;
  standardName: string;
  stageName?: string | null;
  templateId?: string | null;
  templateName?: string | null;
  concurrencyStamp?: string | null;
  templateConcurrencyStamp?: string | null;
  canManage: boolean;
};

export type ICardAssignmentStudent = {
  studentId: string;
  studentName: string;
  grNumber?: string | null;
  divisionName?: string | null;
  rollNumber?: number | null;
  hasPhoto?: boolean;
  hasValidIssuedCard: boolean;
};

export type ICardRosterFilter = {
  column: 'studentName' | 'grNumber' | 'rollNumber' | 'hasValidIssuedCard';
  operator:
    'contains' | 'equals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';
  value?: string;
  min?: number;
  max?: number;
};

type PageRequest = { skipCount: number; maxResultCount: number; search?: string };
type ClassContext = { academicYearId: string; standardId: string };
type ClassListRequest = PageRequest & {
  academicYearId: string;
  boardId: string;
  mediumId: string;
  standardId?: string;
};
export type ICardAssignmentRosterRequest = PageRequest &
  ClassContext & {
    divisionId?: string;
    columnFilters?: ICardRosterFilter[];
  };
type AssignmentWrite = ClassContext & { templateId: string; concurrencyStamp?: string };
type AssignmentDelete = ClassContext & { concurrencyStamp: string };
export type AssignedICardRequest = ClassContext & {
  studentIds: string[];
  concurrencyStamp: string;
  templateConcurrencyStamp: string;
};

const assignmentsUrl = '/students/records/ids/assignments';
const classUrl = (yearId: string, standardId: string) =>
  `${assignmentsUrl}/${yearId}/${standardId}`;

export function isICardAssignmentConflict(error: unknown) {
  return typeof error === 'object' && error !== null && 'status' in error && error.status === 409;
}

export const studentICardAssignmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getICardAssignmentClasses: builder.query<RecordsPage<ICardAssignmentClass>, ClassListRequest>({
      query: (params) => ({ url: assignmentsUrl, params }),
      transformResponse: unwrapRecordsResult<RecordsPage<ICardAssignmentClass>>,
      providesTags: [iCardAssignmentTag],
    }),
    getICardAssignmentRoster: builder.query<
      RecordsPage<ICardAssignmentStudent>,
      ICardAssignmentRosterRequest
    >({
      query: ({ academicYearId, standardId, ...params }) => ({
        url: `${classUrl(academicYearId, standardId)}/roster`,
        params: studentDirectoryQueryParams(params),
      }),
      transformResponse: unwrapRecordsResult<RecordsPage<ICardAssignmentStudent>>,
      providesTags: [iCardRosterTag],
    }),
    putICardAssignment: builder.mutation<ICardAssignmentClass, AssignmentWrite>({
      query: ({ academicYearId, standardId, ...body }) => ({
        url: classUrl(academicYearId, standardId),
        method: 'PUT',
        body,
      }),
      transformResponse: unwrapRecordsResult<ICardAssignmentClass>,
      invalidatesTags: (_result, error) => (error ? [] : [iCardAssignmentTag]),
    }),
    deleteICardAssignment: builder.mutation<void, AssignmentDelete>({
      query: ({ academicYearId, standardId, concurrencyStamp }) => ({
        url: classUrl(academicYearId, standardId),
        method: 'DELETE',
        params: { concurrencyStamp },
      }),
      invalidatesTags: (_result, error) => (error ? [] : [iCardAssignmentTag]),
    }),
    previewAssignedICards: builder.mutation<IdCard[], AssignedICardRequest>({
      query: ({ academicYearId, standardId, ...body }) => ({
        url: `${classUrl(academicYearId, standardId)}/preview`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapRecordsResult<IdCard[]>,
    }),
    exportAssignedICards: builder.mutation<
      Blob,
      AssignedICardRequest & { cardsPerPage: number; photoEdits?: IdentityCardPhotoEdit[] }
    >({
      query: ({ academicYearId, standardId, ...body }) => ({
        url: `${classUrl(academicYearId, standardId)}/export`,
        method: 'POST',
        body,
        responseHandler: (response) => (response.ok ? response.blob() : response.json()),
      }),
    }),
    issueAssignedICards: builder.mutation<
      IdCard[],
      AssignedICardRequest & { idempotencyKey: string; photoEdits?: IdentityCardPhotoEdit[] }
    >({
      query: ({ academicYearId, standardId, ...body }) => ({
        url: `${classUrl(academicYearId, standardId)}/issue`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrapRecordsResult<IdCard[]>,
      invalidatesTags: (_result, error) => (error ? [] : [...documentTags, iCardRosterTag]),
    }),
  }),
});

export const {
  useGetICardAssignmentClassesQuery,
  useGetICardAssignmentRosterQuery,
  usePutICardAssignmentMutation,
  useDeleteICardAssignmentMutation,
  usePreviewAssignedICardsMutation,
  useExportAssignedICardsMutation,
  useIssueAssignedICardsMutation,
} = studentICardAssignmentApi;

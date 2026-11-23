import { api } from 'src/redux/service';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { unwrapRecordsResult } from './student-records-api';

export type StudentAppAccessRelationship = 'self' | 'father' | 'mother';

export type StudentAppAccessRecipient = {
  recipientKey: string;
  relationship: StudentAppAccessRelationship;
  displayName?: string | null;
  status: 'on' | 'off' | 'not-set-up';
  canUpdate: boolean;
  concurrencyStamp: string;
};

export type StudentAppAccessSnapshot = {
  studentId: string;
  recipients: StudentAppAccessRecipient[];
  history: {
    id: string;
    relationship: StudentAppAccessRelationship;
    displayName?: string | null;
    enabled: boolean;
    reason: string;
    changedAt: string;
    changedByName?: string | null;
  }[];
};

type UpdateStudentAppAccess = {
  studentId: string;
  recipientKey: string;
  enabled: boolean;
  reason: string;
  concurrencyStamp: string;
};

const accessUrl = (studentId: string) =>
  `/students/records/${encodeURIComponent(studentId)}/app-access`;
type AccessResult = StudentAppAccessSnapshot | { data?: StudentAppAccessSnapshot };

export const studentRecordAppAccessApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentRecordAppAccess: builder.query<StudentAppAccessSnapshot | null, string>({
      keepUnusedDataFor: 0,
      async queryFn(studentId, _api, _options, fetchWithSession) {
        const { data, error } = await fetchWithSession(accessUrl(studentId));
        if (error) {
          const status = error.status === 'PARSING_ERROR' ? error.originalStatus : error.status;
          const { errorCode } = parseApiProblemDetail(error);
          if (
            status === 401 ||
            status === 403 ||
            status === 404 ||
            errorCode === 'Students:Records:AppAccessEnrollmentRequired' ||
            errorCode === 'Students:Records:AppAccessIdentityRestricted'
          ) {
            // Replace any previously authorized snapshot in the shared cache.
            return { data: null };
          }
          return { error };
        }
        return { data: unwrapRecordsResult(data as AccessResult) };
      },
    }),
    updateStudentRecordAppAccess: builder.mutation<
      StudentAppAccessSnapshot,
      UpdateStudentAppAccess
    >({
      query: ({ studentId, recipientKey, ...body }) => ({
        url: `${accessUrl(studentId)}/${encodeURIComponent(recipientKey)}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: AccessResult) => unwrapRecordsResult(response),
    }),
  }),
});

export const { useGetStudentRecordAppAccessQuery, useUpdateStudentRecordAppAccessMutation } =
  studentRecordAppAccessApi;

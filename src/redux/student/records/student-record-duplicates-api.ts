import { api } from 'src/redux/service';
import { studentType } from 'src/redux/tagTypes';

import { unwrapRecordsResult } from './student-records-api';

import type { RecordsPage } from './student-records-types';

export type StudentDuplicateReview = {
  id: string;
  studentId: string;
  otherStudentId: string;
  studentName: string;
  otherStudentName: string;
  reason: string;
  reviewReason?: string | null;
  status: 'Open' | 'ConfirmedDuplicate' | 'NotDuplicate';
  concurrencyStamp: string;
  requestedBy: string;
  reviewedBy?: string | null;
  creationTime: string;
  canReview: boolean;
};
const tags = [{ type: studentType.student, id: 'RECORDS-DUPLICATES' }];
export const studentRecordDuplicatesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentDuplicateReviews: builder.query<
      RecordsPage<StudentDuplicateReview>,
      { studentId?: string; status?: string; skipCount?: number; maxResultCount?: number }
    >({
      query: (params) => ({ url: '/students/records/duplicates', params }),
      transformResponse: (
        response:
          RecordsPage<StudentDuplicateReview> | { data?: RecordsPage<StudentDuplicateReview> }
      ) => unwrapRecordsResult(response),
      providesTags: tags,
    }),
    flagStudentDuplicate: builder.mutation<
      StudentDuplicateReview,
      { studentId: string; otherStudentId: string; reason: string }
    >({
      query: (body) => ({ url: '/students/records/duplicates', method: 'POST', body }),
      transformResponse: (response: StudentDuplicateReview | { data?: StudentDuplicateReview }) =>
        unwrapRecordsResult(response),
      invalidatesTags: (_result, error) => (error ? [] : tags),
    }),
    resolveStudentDuplicate: builder.mutation<
      StudentDuplicateReview,
      { id: string; concurrencyStamp: string; reason: string; confirmedDuplicate: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/students/records/duplicates/${id}/resolve`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: StudentDuplicateReview | { data?: StudentDuplicateReview }) =>
        unwrapRecordsResult(response),
      invalidatesTags: (_result, error) => (error ? [] : tags),
    }),
  }),
});
export const {
  useGetStudentDuplicateReviewsQuery,
  useFlagStudentDuplicateMutation,
  useResolveStudentDuplicateMutation,
} = studentRecordDuplicatesApi;

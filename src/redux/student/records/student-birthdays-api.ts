import { api } from 'src/redux/service';
import { studentType, organizationType } from 'src/redux/tagTypes';

import { unwrapRecordsResult } from './student-records-api';

import type { RecordsPage, StudentDirectoryOptions } from './student-records-types';

export type BirthdayPeriod = 'today' | 'next7Days' | 'thisMonth' | 'custom';

interface BirthdayInput {
  academicYearId: string;
  boardId?: string;
  mediumId?: string;
  standardId?: string;
  divisionId?: string;
  period: BirthdayPeriod;
  startDate?: string;
  endDate?: string;
  search?: string;
  skipCount: number;
  maxResultCount: number;
  /** Separates relative-period caches across IST midnight without changing the server request. */
  schoolDayKey?: string;
}

export interface StudentBirthdayOccurrence {
  studentId: string;
  studentName: string;
  standardName?: string | null;
  divisionName?: string | null;
  occurrenceDate: string;
  canOpenProfile: boolean;
}

interface BirthdayPage extends RecordsPage<StudentBirthdayOccurrence> {
  schoolDate: string;
  startDate: string;
  endDate: string;
}

export const studentBirthdaysApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentBirthdayOptions: builder.query<StudentDirectoryOptions, { academicYearId: string }>({
      query: (params) => ({ url: '/students/records/birthdays/options', params }),
      transformResponse: (response: StudentDirectoryOptions | { data?: StudentDirectoryOptions }) =>
        unwrapRecordsResult(response),
      providesTags: [organizationType.academicHierarchyOptions],
    }),
    getStudentBirthdays: builder.query<BirthdayPage, BirthdayInput>({
      query: ({ schoolDayKey: _schoolDayKey, ...params }) => ({
        url: '/students/records/birthdays',
        params,
      }),
      transformResponse: (response: BirthdayPage | { data?: BirthdayPage }) =>
        unwrapRecordsResult(response),
      providesTags: [{ type: studentType.student, id: 'RECORDS-DIRECTORY' }],
      keepUnusedDataFor: 30,
    }),
  }),
});

export const { useGetStudentBirthdayOptionsQuery, useGetStudentBirthdaysQuery } =
  studentBirthdaysApi;

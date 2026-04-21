import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../academicApi';

export interface TimetableManagementItem {
  id: string;
  className: string;
  division: string;
  divisionName: string;
  divisionId: string;
  status: number;
}

export interface TimetableSlotPayload {
  sequence: number;
  startTime: string;
  endTime: string;
  type: number;
  breakType: number;
  subjectType: number;
  electiveGroupId: string | null;
  subjects: Array<{
    subjectId: string;
    teacherId: string;
    roomId: string;
  }>;
}

export interface CreateTimetablePayload {
  status: number;
  timetable: Record<string, TimetableSlotPayload[]>;
}

export const timetableManagementApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getTimetableManagementByStandard: builder.query({
      query: (standardId: string) => ({
        url: `academics/timetable/management/by-standard/${standardId}`,
        method: 'GET',
      }),
      providesTags: [academicType.timetableManagement],
    }),

    getTimetableByStandardDivision: builder.query({
      query: ({ standardId, divisionId }: { standardId: string; divisionId: string }) => ({
        url: `academics/timetable/by-standard/${standardId}/division/${divisionId}`,
        method: 'GET',
      }),
      providesTags: [academicType.timetableManagement],
    }),

    createTimetable: builder.mutation({
      query: ({
        standardId,
        divisionId,
        body,
      }: {
        standardId: string;
        divisionId: string;
        body: CreateTimetablePayload;
      }) => ({
        url: `academics/timetable/by-standard/${standardId}/division/${divisionId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.timetableManagement],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTimetableManagementByStandardQuery,
  useGetTimetableByStandardDivisionQuery,
  useCreateTimetableMutation,
} = timetableManagementApi;

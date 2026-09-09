import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../academicApi';

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

    getTimetableByEmployee: builder.query({
      query: ({ employeeId, academicYearId }: { employeeId: string; academicYearId?: string }) => ({
        url: `academics/timetable/by-employee/${employeeId}`,
        method: 'GET',
        params: academicYearId ? { academicYearId } : undefined,
      }),
      providesTags: [academicType.timetableManagement],
    }),

    createTimetable: builder.mutation({
      query: ({ standardId, divisionId, body }) => ({
        url: `academics/timetable/by-standard/${standardId}/division/${divisionId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.timetableManagement, academicType.lessonPlan],
    }),

    validateTimetable: builder.mutation({
      query: ({ standardId, divisionId, body }) => ({
        url: `academics/timetable/by-standard/${standardId}/division/${divisionId}/validate`,
        method: 'POST',
        body,
      }),
    }),

    assignTeachers: builder.mutation({
      query: (body: {
        standardId: string;
        divisionId: string;
        day: string;
        startTime: string;
        endTime: string;
        subjectType: number;
        electiveGroupId?: string | null;
        subjects: { subjectId: string; teacherId: string | null }[];
      }) => ({
        url: 'academics/timetable/assign-teachers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.timetableManagement, academicType.lessonPlan],
    }),

    assignRooms: builder.mutation({
      query: (body: {
        standardId: string;
        divisionId: string;
        day: string;
        startTime: string;
        endTime: string;
        subjectType: number;
        electiveGroupId?: string | null;
        subjects: { subjectId: string; roomId: string | null }[];
      }) => ({
        url: 'academics/timetable/assign-rooms',
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
  useGetTimetableByEmployeeQuery,
  useCreateTimetableMutation,
  useValidateTimetableMutation,
  useAssignTeachersMutation,
  useAssignRoomsMutation,
} = timetableManagementApi;

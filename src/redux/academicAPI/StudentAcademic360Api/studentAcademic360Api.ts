import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../academicApi';

export const studentAcademic360Api = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentAcademic360: builder.query({
      query: ({
        studentId,
        academicYearId,
        attendanceStartDate,
        attendanceEndDate,
        includeHistorical = false,
        taskSkipCount = 0,
        taskMaxResultCount = 0,
        examSkipCount = 0,
        examMaxResultCount = 0,
        recentTaskCount = 10,
        recentExamCount = 5,
      }: {
        studentId: string;
        academicYearId?: string;
        attendanceStartDate?: string;
        attendanceEndDate?: string;
        includeHistorical?: boolean;
        taskSkipCount?: number;
        taskMaxResultCount?: number;
        examSkipCount?: number;
        examMaxResultCount?: number;
        recentTaskCount?: number;
        recentExamCount?: number;
      }) => {
        const params = new URLSearchParams();
        if (academicYearId) params.set('academicYearId', academicYearId);
        params.set('includeHistorical', String(includeHistorical));
        params.set('taskSkipCount', String(taskSkipCount));
        params.set('taskMaxResultCount', String(taskMaxResultCount));
        params.set('examSkipCount', String(examSkipCount));
        params.set('examMaxResultCount', String(examMaxResultCount));
        params.set('recentTaskCount', String(recentTaskCount));
        params.set('recentExamCount', String(recentExamCount));
        if (attendanceStartDate) params.set('attendanceStartDate', attendanceStartDate);
        if (attendanceEndDate) params.set('attendanceEndDate', attendanceEndDate);

        return {
          url: `academics/student-academic-360/${studentId}?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: [academicType.academic360],
    }),
    getStudentAcademic360Tab: builder.query({
      query: ({ studentId, tab }: { studentId: string; tab: string }) => ({
        url: `academics/student-academic-360/${studentId}/tabs/${tab}`,
        method: 'GET',
      }),
      providesTags: [academicType.academic360],
    }),
  }),
  overrideExisting: false,
});

export const { useGetStudentAcademic360Query, useGetStudentAcademic360TabQuery } = studentAcademic360Api;

import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../academicApi';

export const studentAcademic360Api = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentAcademic360: builder.query({
      query: ({
        studentId,
        attendanceStartDate,
        attendanceEndDate,
        recentTaskCount = 10,
        recentExamCount = 5,
      }: {
        studentId: string;
        attendanceStartDate?: string;
        attendanceEndDate?: string;
        recentTaskCount?: number;
        recentExamCount?: number;
      }) => {
        const params = new URLSearchParams();
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
  }),
  overrideExisting: false,
});

export const { useGetStudentAcademic360Query } = studentAcademic360Api;

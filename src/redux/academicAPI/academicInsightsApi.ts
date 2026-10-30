import { studentType, academicType, classManagementType, academicCalendarType, studentTakeAttendanceType } from 'src/redux/tagTypes';

import { academicApi } from './academicApi';
import { parseAcademicInsightsResponse } from './academicInsightsResponse';

import type { AcademicInsightsInput, AcademicInsightsResponse } from './academicInsightsTypes';

export type AcademicInsightsQuery = AcademicInsightsInput & { accessKey: string };

export const academicInsightsApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getAcademicInsights: builder.query<AcademicInsightsResponse, AcademicInsightsQuery>({
      async queryFn(input, _queryApi, _options, baseQuery) {
        const { academicYearId, boardId, educationMediumId, standardId, divisionId, studentId } = input;
        const result = await baseQuery({
          url: '/academic/dashboard/insights', method: 'GET',
          params: { academicYearId, boardId, educationMediumId, standardId, divisionId, studentId },
        });
        if (result.error) return { error: result.error };
        const data = parseAcademicInsightsResponse(result.data);
        return data ? { data } : {
          error: { status: 'CUSTOM_ERROR', error: 'Academic Insights returned an invalid response.' },
        };
      },
      providesTags: [...Object.values(academicType), ...Object.values(academicCalendarType),
        classManagementType.classTeacherAssignment, classManagementType.studentElectiveAssignment,
        classManagementType.teacherAssignment, classManagementType.subjectProgress,
        classManagementType.class, classManagementType.division,
        { type: studentType.student, id: 'RECORDS-DIRECTORY' },
        ...Object.values(studentTakeAttendanceType)],
    }),
  }),
});

export const { useGetAcademicInsightsQuery } = academicInsightsApi;

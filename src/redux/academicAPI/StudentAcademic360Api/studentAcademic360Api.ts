import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../academicApi';

export type StudentAcademic360SmartFilter =
  'All' | 'NeedsAttention' | 'LowAttendance' | 'OverdueHomework' | 'PerformanceDecline' | 'NoData';

export type StudentAcademic360ListInput = {
  academicYearId: string;
  boardId: string;
  educationMediumId: string;
  standardId?: string;
  divisionId?: string;
  searchTerm?: string;
  smartFilter: StudentAcademic360SmartFilter;
  sorting?: string;
  skipCount: number;
  maxResultCount: number;
};

export type StudentAcademic360ListMetric = {
  percentage?: number | null;
  completed?: number | null;
  total?: number | null;
  pending?: number | null;
  count?: number | null;
  status?: string | null;
};

export type StudentAcademic360ListItem = {
  studentId: string;
  studentName: string;
  photoUrl?: string | null;
  grNo?: number | null;
  rollNo?: number | null;
  standardId?: string;
  standardName: string;
  divisionId?: string;
  divisionName: string;
  attendance?: StudentAcademic360ListMetric | null;
  homework?: StudentAcademic360ListMetric | null;
  examAverage?: StudentAcademic360ListMetric | null;
  trend: string;
  academicHealth: string;
  academicHealthReasons: string[];
  alertCount: number;
  dataCompleteness: string;
  lastUpdatedAt?: string | null;
};

export type StudentAcademic360ListSummary = {
  totalStudents: number;
  needsAttention: number;
  averageAttendance?: number | null;
  homeworkCompletion?: number | null;
  averageExamScore?: number | null;
};

export type StudentAcademic360ListResult = {
  totalCount: number;
  items: StudentAcademic360ListItem[];
  summary: StudentAcademic360ListSummary;
};

export const studentAcademic360Api = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentAcademic360List: builder.query<
      StudentAcademic360ListResult,
      StudentAcademic360ListInput
    >({
      query: (params) => ({
        url: 'academics/student-academic-360',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.academic360],
    }),
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

export const {
  useGetStudentAcademic360ListQuery,
  useGetStudentAcademic360Query,
  useGetStudentAcademic360TabQuery,
} = studentAcademic360Api;

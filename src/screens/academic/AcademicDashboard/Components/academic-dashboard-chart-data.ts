import type { AdminAcademicDashboardAnalyticsData } from 'src/redux/academicAPI/academicDashboardApi';

type ExamResultData = AdminAcademicDashboardAnalyticsData['subjectPassFailChart'];
type ClassProgressData = AdminAcademicDashboardAnalyticsData['classSyllabusProgressChart'];

export type ExamResultRow = {
  assessment: string;
  passed: number;
  failed: number;
  total: number;
};

export type ClassProgressRow = {
  classDivision: string;
  completion: number;
};

const toNonNegativeInteger = (value: unknown) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.max(0, Math.round(numericValue)) : 0;
};

export function buildExamResultRows(chartData: ExamResultData): ExamResultRow[] {
  return chartData.subjectNames
    .map((assessment, index) => {
      const passed = toNonNegativeInteger(chartData.passCounts[index]);
      const failed = toNonNegativeInteger(chartData.failCounts[index]);

      return {
        assessment: assessment?.trim() || `Assessment ${index + 1}`,
        passed,
        failed,
        total: passed + failed,
      };
    })
    .filter((row) => row.total > 0);
}

export function buildClassProgressRows(chartData: ClassProgressData): ClassProgressRow[] {
  return chartData.classNames
    .map((classDivision, index) => ({
      classDivision: classDivision?.trim() || `Class ${index + 1}`,
      completion: Math.min(100, toNonNegativeInteger(chartData.completionPercentages[index])),
    }))
    .filter((row) => Boolean(row.classDivision));
}

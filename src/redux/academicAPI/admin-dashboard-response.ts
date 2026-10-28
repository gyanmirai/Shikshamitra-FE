import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import type {
  AdminAcademicDashboardTimetableData,
  AdminAcademicDashboardCurriculumData,
  AdminAcademicDashboardAssessmentData,
} from './academicDashboardApi';

type SectionData = {
  curriculum: AdminAcademicDashboardCurriculumData;
  timetable: AdminAcademicDashboardTimetableData;
  assessment: AdminAcademicDashboardAssessmentData;
};

const fields = {
  curriculum: {
    numbers: [
      'curriculumCompletion',
      'totalStudents',
      'totalTeachers',
      'assignedSubjects',
      'electiveGroups',
      'pendingElectiveGroups',
    ],
    arrays: ['insights', 'configurationStatus'],
  },
  timetable: {
    numbers: ['timetableRate', 'activeTimetables', 'pendingTimetables', 'conflictsCount'],
    arrays: ['insights', 'configurationStatus', 'operationalStatus'],
  },
  assessment: {
    numbers: ['readinessRate', 'pendingGradeEntries', 'pendingEvaluations', 'upcomingExams'],
    arrays: ['insights', 'operationalStatus'],
  },
} as const;

export function readAdminDashboardSection<T extends keyof SectionData>(
  section: T,
  value: unknown
): { data: SectionData[T] } | { error: FetchBaseQueryError } {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const validNumbers = fields[section].numbers.every(
      (key) => typeof record[key] === 'number' && Number.isFinite(record[key])
    );
    const validArrays = fields[section].arrays.every((key) => Array.isArray(record[key]));
    if (validNumbers && validArrays) return { data: value as SectionData[T] };
  }
  return {
    error: {
      status: 'CUSTOM_ERROR',
      error: `Invalid Academic dashboard ${section} data. Retry this section.`,
    },
  };
}

import type { ApiAffectedLecture } from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

export type QuickSubstitutionContext = {
  teacherId: string;
  teacherName: string;
  departmentName: string;
  date: string;
  startTime: string;
  endTime: string;
  isFullDay: boolean;
  reason: string;
  remarks?: string;
  source: number;
  academicYearId?: string;
  academicMediumId?: string;
};

export type QuickSubstitutionLecture = ApiAffectedLecture & { key: string };

import type {
  StudentDashboardSectionKey,
  StudentModuleDashboardSection,
} from 'src/redux/student/dashboard/student-module-dashboard-types';

import { useGetStudentModuleDashboardSectionQuery } from 'src/redux/student/dashboard/student-module-dashboard-api';

export type StudentSectionQuery = {
  currentData?: StudentModuleDashboardSection;
  isFetching: boolean;
  isError: boolean;
  isUninitialized: boolean;
  refetch: () => unknown;
};
export type StudentSectionQueries = Record<StudentDashboardSectionKey, StudentSectionQuery>;

export function useStudentDashboardSections(
  sections: StudentDashboardSectionKey[],
  identityKey: string,
  academicYearId?: string
): StudentSectionQueries {
  const options = (section: StudentDashboardSectionKey) => ({
    skip: !academicYearId || !sections.includes(section),
    refetchOnMountOrArgChange: true,
  });
  const input = (section: StudentDashboardSectionKey) => ({
    identityKey,
    academicYearId: academicYearId ?? '',
    section,
  });
  const records = useGetStudentModuleDashboardSectionQuery(input('records'), options('records'));
  const admissions = useGetStudentModuleDashboardSectionQuery(
    input('admissions'),
    options('admissions')
  );
  const attendance = useGetStudentModuleDashboardSectionQuery(
    input('attendance'),
    options('attendance')
  );
  return { records, admissions, attendance };
}

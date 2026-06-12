import type { Board, Medium, AcademicYear } from 'src/types/school';
import type { GlobalAcademicSearchOption as SharedGlobalAcademicSearchOption } from 'src/utils/academicHierarchyUtils';

export type GlobalAcademicSearchOption = SharedGlobalAcademicSearchOption<
  AcademicYear,
  Board,
  Medium
>;

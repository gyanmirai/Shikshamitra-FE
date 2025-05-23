import type { Board, Medium, AcademicYear } from 'src/types/school';

export interface GlobalAcademicSearchOption {
  label: string;
  value: string;
  academicYear: AcademicYear;
  board: Board;
  medium: Medium;
}

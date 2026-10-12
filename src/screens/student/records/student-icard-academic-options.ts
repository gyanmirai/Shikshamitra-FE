import type { StudentDirectoryOptions } from 'src/redux/student/records/student-records-types';

type AcademicScope = {
  boardIds: string[];
  mediumIds: string[];
  standardIds: string[];
};

/**
 * Directory options are flattened across academic years unless the API is scoped.
 * Still validate every parent ID on the client so a stale or unscoped response
 * cannot offer another year's Board/Medium/Class/Division in the I-Card builder.
 */
export function getStudentICardAcademicOptions(
  options: StudentDirectoryOptions | undefined,
  academicYearId: string,
  scope: AcademicScope
) {
  const boards = (options?.boards ?? []).filter(
    (board) => !!academicYearId && board.parentId === academicYearId
  );
  const boardIds = new Set(boards.map((board) => board.id));

  const mediums = (options?.mediums ?? []).filter(
    (medium) =>
      !!medium.parentId &&
      boardIds.has(medium.parentId) &&
      (!scope.boardIds.length || scope.boardIds.includes(medium.parentId))
  );
  const mediumIds = new Set(mediums.map((medium) => medium.id));

  const standards = (options?.standards ?? []).filter(
    (standard) =>
      !!standard.parentId &&
      mediumIds.has(standard.parentId) &&
      (!scope.mediumIds.length || scope.mediumIds.includes(standard.parentId))
  );
  const standardIds = new Set(standards.map((standard) => standard.id));

  const divisions = (options?.divisions ?? []).filter(
    (division) =>
      !!division.parentId &&
      standardIds.has(division.parentId) &&
      (!scope.standardIds.length || scope.standardIds.includes(division.parentId))
  );

  return { boards, mediums, standards, divisions };
}

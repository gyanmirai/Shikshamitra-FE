import type { UserScopeHierarchy } from 'src/redux/userScope/types';

export function getStudentAcademicYears<TYear extends { id: string }>(
  years: TYear[],
  scope: UserScopeHierarchy | undefined
): TYear[] {
  if (scope?.isAdmin) return years;
  // The hierarchy also contains unassigned years for the scope editor.
  const allowedIds = new Set(
    scope?.accessibleHierarchy
      .filter((year) => year.hasFullBoardAccess || year.boards.some((board) => board.hasAccess))
      .map((year) => year.academicYearId)
  );
  return years.filter((year) => allowedIds.has(year.id));
}

import type { HouseAssignment } from 'src/redux/student/house-management/house-management-types';

export type HouseTab = 'houses' | 'divisions';
export function houseWorkspaceState(params: URLSearchParams) {
  const requested = params.get('tab');
  const tab: HouseTab =
    requested === 'students' || requested === 'divisions' ? 'divisions' : 'houses';
  const page = Number(params.get('page') ?? 0);
  const pageSize = Number(params.get('pageSize') ?? 25);
  const fields = tab === 'divisions' ? ['studentName', 'standardName', 'houseName'] : ['name'];
  const [field, direction] = (params.get('sort') ?? '').split(' ');
  return {
    tab,
    page: Number.isSafeInteger(page) && page >= 0 && page <= 100000 ? page : 0,
    pageSize: [10, 25, 50, 100].includes(pageSize) ? pageSize : 25,
    search: params.get('search') ?? '',
    sorting:
      fields.includes(field) && ['asc', 'desc'].includes(direction)
        ? `${field} ${direction}`
        : `${fields[0]} asc`,
  };
}
export function selectionForContext(
  selection: { context: string; ids: string[] },
  context: string
) {
  return selection.context === context ? selection.ids : [];
}
export function assignmentInput(
  academicMediumId: string,
  divisionId: string,
  houseId: string,
  ids: string[]
): HouseAssignment {
  if (!divisionId) throw new Error('Select a division to change house membership.');
  const enrollmentIds = [...new Set(ids)];
  if (!enrollmentIds.length) throw new Error('Select at least one student.');
  if (enrollmentIds.length > 500) throw new Error('Select up to 500 students per change.');
  return { academicMediumId, divisionId, houseId: houseId || null, enrollmentIds };
}

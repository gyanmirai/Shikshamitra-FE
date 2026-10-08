import type { IStudentOption } from './types';

export const emptyStudentFilters = {
  division: '',
  gender: '',
  rollFrom: '',
  rollTo: '',
  assigned: '',
  charged: '',
};
export type StudentFilters = typeof emptyStudentFilters;

export function filterChargeStudents(
  students: IStudentOption[],
  search: string,
  filters: StudentFilters
) {
  const query = search.trim().toLowerCase();
  return students.filter(
    (student) =>
      (!query ||
        student.label.toLowerCase().includes(query) ||
        student.grNumber?.includes(query) ||
        student.rollNumber?.toString().includes(query)) &&
      (!filters.division || student.divisionId === filters.division) &&
      (!filters.gender || student.gender?.toString() === filters.gender) &&
      (!filters.rollFrom ||
        (student.rollNumber != null && student.rollNumber >= Number(filters.rollFrom))) &&
      (!filters.rollTo ||
        (student.rollNumber != null && student.rollNumber <= Number(filters.rollTo))) &&
      (!filters.assigned || student.hasFeeStructureAssignment === (filters.assigned === 'yes')) &&
      (!filters.charged || student.hasChargeInCategory === (filters.charged === 'yes'))
  );
}

export function toggleFilteredStudents(selected: string[], filtered: string[]) {
  const filteredSet = new Set(filtered);
  return filtered.length > 0 && filtered.every((id) => selected.includes(id))
    ? selected.filter((id) => !filteredSet.has(id))
    : Array.from(new Set([...selected, ...filtered]));
}

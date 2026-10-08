import { describe, expect, it } from 'vitest';
import {
  emptyStudentFilters,
  filterChargeStudents,
  toggleFilteredStudents,
} from './studentFilters';

const students = [
  {
    id: 'a',
    studentId: 'a',
    name: 'Diya',
    label: 'Diya',
    grNumber: '10092',
    rollNumber: 2,
    divisionId: 'A',
    gender: 1,
    hasFeeStructureAssignment: true,
    hasChargeInCategory: false,
  },
  {
    id: 'b',
    studentId: 'b',
    name: 'Jay',
    label: 'Jay',
    grNumber: '10093',
    rollNumber: 12,
    divisionId: 'B',
    gender: 0,
    hasFeeStructureAssignment: true,
    hasChargeInCategory: true,
  },
];

describe('charge student filters', () => {
  it('combines search, academic and authoritative finance metadata', () => {
    expect(
      filterChargeStudents(students, '1009', {
        ...emptyStudentFilters,
        division: 'A',
        gender: '1',
        rollFrom: '1',
        rollTo: '3',
        assigned: 'yes',
        charged: 'no',
      }).map((s) => s.id)
    ).toEqual(['a']);
    expect(
      filterChargeStudents(students, 'Diya', { ...emptyStudentFilters, charged: 'yes' })
    ).toEqual([]);
  });
  it('retains selections outside filtered results when selecting and deselecting all', () => {
    expect(toggleFilteredStudents(['b'], ['a'])).toEqual(['b', 'a']);
    expect(toggleFilteredStudents(['b', 'a'], ['a'])).toEqual(['b']);
    expect(toggleFilteredStudents(['b'], [])).toEqual(['b']);
  });
  it('keeps unknown gender and roll number from matching concrete filters', () => {
    const unknown = [{ ...students[0], gender: undefined, rollNumber: undefined }];
    expect(filterChargeStudents(unknown, '', { ...emptyStudentFilters, gender: '1' })).toEqual([]);
    expect(filterChargeStudents(unknown, '', { ...emptyStudentFilters, rollFrom: '1' })).toEqual(
      []
    );
  });
});

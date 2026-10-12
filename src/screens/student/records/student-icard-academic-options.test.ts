import { describe, expect, it } from 'vitest';

import type { StudentDirectoryOptions } from 'src/redux/student/records/student-records-types';

import { getStudentICardAcademicOptions } from './student-icard-academic-options';

const options: StudentDirectoryOptions = {
  academicYears: [
    { id: 'year-25', name: '2025-2026' },
    { id: 'year-26', name: '2026-2027' },
  ],
  boards: [
    { id: 'cbse-25', name: 'CBSE', parentId: 'year-25' },
    { id: 'cbse-26', name: 'CBSE', parentId: 'year-26' },
    { id: 'gseb-26', name: 'GSEB', parentId: 'year-26' },
  ],
  mediums: [
    { id: 'english-25', name: 'English', parentId: 'cbse-25' },
    { id: 'english-26', name: 'English', parentId: 'cbse-26' },
    { id: 'gujarati-26', name: 'Gujarati', parentId: 'gseb-26' },
  ],
  standards: [
    { id: 'class1-25', name: 'Class 1', parentId: 'english-25' },
    { id: 'class1-cbse-26', name: 'Class 1', parentId: 'english-26' },
    { id: 'class1-gseb-26', name: 'Class 1', parentId: 'gujarati-26' },
  ],
  divisions: [
    { id: 'division-25', name: 'A', parentId: 'class1-25' },
    { id: 'division-cbse-26', name: 'A', parentId: 'class1-cbse-26' },
    { id: 'division-gseb-26', name: 'B', parentId: 'class1-gseb-26' },
  ],
};
const noSelection = { boardIds: [], mediumIds: [], standardIds: [] };

describe('Student I-Card academic hierarchy', () => {
  it('shows each board, medium, class, and division only from the global academic year', () => {
    const result = getStudentICardAcademicOptions(options, 'year-26', noSelection);

    expect(result.boards.map((item) => item.id)).toEqual(['cbse-26', 'gseb-26']);
    expect(result.mediums.map((item) => item.id)).toEqual(['english-26', 'gujarati-26']);
    expect(result.standards.map((item) => item.id)).toEqual(['class1-cbse-26', 'class1-gseb-26']);
    expect(result.divisions.map((item) => item.id)).toEqual(['division-cbse-26', 'division-gseb-26']);
  });

  it('cascades multi-select board, medium, and class filters by IDs, not repeated names', () => {
    const onlyCbse = getStudentICardAcademicOptions(options, 'year-26', {
      boardIds: ['cbse-26'],
      mediumIds: [],
      standardIds: [],
    });
    expect(onlyCbse.mediums.map((item) => item.id)).toEqual(['english-26']);
    expect(onlyCbse.standards.map((item) => item.id)).toEqual(['class1-cbse-26']);
    expect(onlyCbse.divisions.map((item) => item.id)).toEqual(['division-cbse-26']);

    const filteredClass = getStudentICardAcademicOptions(options, 'year-26', {
      boardIds: ['cbse-26', 'gseb-26'],
      mediumIds: ['gujarati-26'],
      standardIds: ['class1-gseb-26'],
    });
    expect(filteredClass.standards.map((item) => item.id)).toEqual(['class1-gseb-26']);
    expect(filteredClass.divisions.map((item) => item.id)).toEqual(['division-gseb-26']);
  });

  it('fails closed when there is no global year or a stale parent from another year', () => {
    const missingYear = getStudentICardAcademicOptions(options, '', noSelection);
    expect(Object.values(missingYear).every((items) => items.length === 0)).toBe(true);

    const stale = getStudentICardAcademicOptions(options, 'year-26', {
      boardIds: ['cbse-25'],
      mediumIds: ['english-25'],
      standardIds: ['class1-25'],
    });
    expect(stale.boards.map((item) => item.id)).toEqual(['cbse-26', 'gseb-26']);
    expect(stale.mediums).toHaveLength(0);
    expect(stale.standards).toHaveLength(0);
    expect(stale.divisions).toHaveLength(0);
  });
});

import { vi, it, expect, describe } from 'vitest';

import { getElectiveAssignmentColumns } from './electiveAssignmentColumns';

import type { StudentElectiveRow } from '../types';

const students: StudentElectiveRow[] = [
  {
    studentId: 'student-one',
    studentName: 'Student One',
    rollNo: '1',
    selectedSubjectId: 'pt',
    selectableSubjects: [{ subjectId: 'pt', subjectName: 'PT' }],
  },
];

const createColumns = (isLocked: boolean) =>
  getElectiveAssignmentColumns({
    isLocked,
    students,
    selectedRowIds: new Set(),
    studentSelections: { 'student-one': 'pt' },
    onToggleRow: vi.fn(),
    onToggleAllRows: vi.fn(),
    onToggleSubject: vi.fn(),
    getPreferenceMatch: () => 'noPreference',
    getRowStatus: () => 'assigned',
  });

describe('elective assignment columns', () => {
  it('removes selection and duplicate row status columns after locking', () => {
    expect(createColumns(true).map((column) => column.id)).toEqual([
      'studentName',
      'rollNo',
      'preference',
      'electiveSubjects',
    ]);
  });

  it('keeps selection and assignment status controls while editing', () => {
    const columns = createColumns(false);

    expect(columns.map((column) => column.id)).toEqual([
      'rowSelect',
      'studentName',
      'rollNo',
      'preference',
      'electiveSubjects',
      'status',
    ]);
    expect(columns.find((column) => column.id === 'electiveSubjects')?.label).toBe(
      'Choose elective subject'
    );
  });
});

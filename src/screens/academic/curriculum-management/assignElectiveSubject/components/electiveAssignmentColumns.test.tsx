import type { IData } from 'src/components/customizabaleTable/types';

import { isValidElement } from 'react';
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
  it('lets pinned identity, selection, and status columns scroll away on phones', () => {
    expect(createColumns(false).filter((column) => column.sticky)
      .every((column) => column.stickyOnMobile === false)).toBe(true);
  });
  it('disables subject controls only for locked rows in a mixed roster', () => {
    const subjectColumn = createColumns(false).find((column) => column.id === 'electiveSubjects');
    const lockedControl = subjectColumn?.render?.(undefined, {
      ...students[0],
      isLocked: true,
    } as IData);
    const newControl = subjectColumn?.render?.(undefined, {
      ...students[0],
      isLocked: false,
    } as IData);
    expect(
      isValidElement<{ disabled?: boolean }>(lockedControl) && lockedControl.props.disabled
    ).toBe(true);
    expect(isValidElement<{ disabled?: boolean }>(newControl) && newControl.props.disabled).toBe(
      false
    );
  });

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

import { it, expect, describe } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import useElectiveAssignmentState from './useElectiveAssignmentState';

import type { StudentElectiveRow } from '../types';

const subjects = [
  { subjectId: 'computer-science', subjectName: 'Computer Science' },
  { subjectId: 'pt', subjectName: 'PT' },
];

const students: StudentElectiveRow[] = [
  {
    studentId: 'student-one',
    studentName: 'Student One',
    rollNo: '1',
    selectedSubjectId: 'computer-science',
    selectableSubjects: subjects,
  },
  {
    studentId: 'student-two',
    studentName: 'Student Two',
    rollNo: '2',
    selectableSubjects: subjects,
  },
];

describe('useElectiveAssignmentState dirty tracking', () => {
  it('searches students by name, roll number, and GR number', () => {
    const searchableStudents: StudentElectiveRow[] = [
      { ...students[0], grNo: 'GR-101' },
      { ...students[1], studentName: 'Mira Chauhan', rollNo: '42', grNo: 'GR-202' },
    ];
    const { result } = renderHook(() =>
      useElectiveAssignmentState({
        students: searchableStudents,
        serverRecords: searchableStudents,
        isLocked: true,
      })
    );

    act(() => result.current.setSearchTerm('mira'));
    expect(result.current.filteredStudents.map((student) => student.studentId)).toEqual([
      'student-two',
    ]);

    act(() => result.current.setSearchTerm('42'));
    expect(result.current.filteredStudents.map((student) => student.studentId)).toEqual([
      'student-two',
    ]);

    act(() => result.current.setSearchTerm('gr-101'));
    expect(result.current.filteredStudents.map((student) => student.studentId)).toEqual([
      'student-one',
    ]);
  });

  it('keeps initial server hydration and empty context transitions pristine', async () => {
    const { result, rerender } = renderHook(
      ({ visibleStudents, serverRecords }) =>
        useElectiveAssignmentState({
          students: visibleStudents,
          serverRecords,
          isLocked: false,
        }),
      { initialProps: { visibleStudents: students, serverRecords: students } }
    );

    expect(result.current.hasUnsavedChanges).toBe(false);
    await waitFor(() => {
      expect(result.current.studentSelections).toEqual({
        'student-one': 'computer-science',
      });
    });
    expect(result.current.hasUnsavedChanges).toBe(false);

    rerender({ visibleStudents: [], serverRecords: students });

    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.unsavedChangesCount).toBe(0);
  });

  it('guards real edits and becomes pristine after reverting or discarding them', async () => {
    const { result } = renderHook(() =>
      useElectiveAssignmentState({ students, serverRecords: students, isLocked: false })
    );

    await waitFor(() => {
      expect(result.current.studentSelections['student-one']).toBe('computer-science');
    });

    act(() => result.current.toggleSubject('student-one', 'pt'));
    expect(result.current.hasUnsavedChanges).toBe(true);
    expect(result.current.unsavedChangesCount).toBe(1);

    act(() => result.current.toggleSubject('student-one', 'computer-science'));
    expect(result.current.hasUnsavedChanges).toBe(false);

    act(() => result.current.toggleSubject('student-two', 'pt'));
    expect(result.current.hasUnsavedChanges).toBe(true);

    act(() => result.current.resetSelections());
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('unassigns a student when the selected subject is toggled again', async () => {
    const { result } = renderHook(() =>
      useElectiveAssignmentState({ students, serverRecords: students, isLocked: false })
    );

    await waitFor(() => {
      expect(result.current.studentSelections['student-one']).toBe('computer-science');
    });

    act(() => result.current.toggleSubject('student-one', 'computer-science'));

    expect(result.current.studentSelections['student-one']).toBeUndefined();
    expect(result.current.rowStatus(students[0])).toBe('unassigned');
    expect(result.current.summary).toMatchObject({ assigned: 0, unassigned: 2 });
    expect(result.current.hasUnsavedChanges).toBe(true);
  });
});

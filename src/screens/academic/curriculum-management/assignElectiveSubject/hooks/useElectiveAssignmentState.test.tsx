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
  it('protects locked students during individual, bulk, and clear operations while admitting new edits', async () => {
    const mixedStudents = [
      { ...students[0], isLocked: true },
      { ...students[1], isLocked: false },
    ];
    const { result } = renderHook(() =>
      useElectiveAssignmentState({
        students: mixedStudents,
        serverRecords: mixedStudents,
        isLocked: false,
      })
    );
    await waitFor(() =>
      expect(result.current.studentSelections['student-one']).toBe('computer-science')
    );
    act(() => result.current.toggleRowSelected('student-one'));
    expect(result.current.selectedRowIds.size).toBe(0);
    act(() => result.current.toggleAllRowsSelected(['student-one', 'student-two'], true));
    expect(Array.from(result.current.selectedRowIds)).toEqual(['student-two']);
    act(() => result.current.toggleSubject('student-one', 'pt'));
    expect(result.current.studentSelections['student-one']).toBe('computer-science');
    act(() => result.current.bulkAssignSubject(['student-one', 'student-two'], 'pt'));
    expect(result.current.studentSelections).toEqual({
      'student-one': 'computer-science',
      'student-two': 'pt',
    });
    act(() => result.current.clearSelections());
    expect(result.current.studentSelections).toEqual({ 'student-one': 'computer-science' });
    act(() => result.current.toggleSubject('student-two', 'pt'));
    expect(result.current.unsavedChangesCount).toBe(1);
  });

  it('preserves selections when the entire page is locked or read-only', async () => {
    const { result } = renderHook(() =>
      useElectiveAssignmentState({ students, serverRecords: students, isLocked: true })
    );
    await waitFor(() => expect(result.current.studentSelections['student-one']).toBe('computer-science'));
    act(() => {
      result.current.toggleSubject('student-two', 'pt');
      result.current.bulkAssignSubject(['student-one', 'student-two'], 'pt');
      result.current.clearSelections();
      result.current.toggleAllRowsSelected(['student-two'], true);
    });
    expect(result.current.studentSelections).toEqual({ 'student-one': 'computer-science' });
    expect(result.current.selectedRowIds.size).toBe(0);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

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

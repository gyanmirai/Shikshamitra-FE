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

    act(() => result.current.assignSubject('student-one', 'pt'));
    expect(result.current.hasUnsavedChanges).toBe(true);
    expect(result.current.unsavedChangesCount).toBe(1);

    act(() => result.current.assignSubject('student-one', 'computer-science'));
    expect(result.current.hasUnsavedChanges).toBe(false);

    act(() => result.current.assignSubject('student-two', 'pt'));
    expect(result.current.hasUnsavedChanges).toBe(true);

    act(() => result.current.resetSelections());
    expect(result.current.hasUnsavedChanges).toBe(false);
  });
});

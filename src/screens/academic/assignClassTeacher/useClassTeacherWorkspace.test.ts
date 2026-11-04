import type { ClassTeacherAssignmentRowDto } from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useClassTeacherWorkspace } from './useClassTeacherWorkspace';

const fixture = vi.hoisted(() => ({
  currentData: undefined as
    { items: ClassTeacherAssignmentRowDto[]; eligibleTeachers: [] } | undefined,
}));
vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      auth: {
        permissions: [
          { name: 'ClassManagement.ClassTeacherAssignment.View', isGranted: true },
          { name: 'ClassManagement.ClassTeacherAssignment.Add', isGranted: true },
        ],
      },
      globalState: {
        currentMedium: {
          educationMediumStages: [
            { id: 'one', name: 'Primary' },
            { id: 'two', name: 'Secondary' },
          ],
        },
      },
    }),
}));
vi.mock('src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi', () => ({
  useGetClassTeacherWorkspaceQuery: () => ({ currentData: fixture.currentData, refetch: vi.fn() }),
}));

const row: ClassTeacherAssignmentRowDto = {
  classId: 'class-one',
  divisionId: 'division-one',
  className: 'Class 1',
  divisionName: 'A',
  studentCount: 35,
  assignmentStatus: 'Unassigned',
  approvalStatus: '',
  acknowledgmentStatus: '',
  handoverStatus: '',
  assignmentType: 'Permanent',
  conflictCount: 0,
  issues: [],
};

describe('class teacher workspace draft and scope', () => {
  beforeEach(() => {
    fixture.currentData = { items: [row], eligibleTeachers: [] };
  });

  it('retains unsaved edits when the same organization refreshes and restores saved values on discard', () => {
    const { result, rerender } = renderHook(useClassTeacherWorkspace);
    act(() =>
      result.current.updateRow('class-one-division-one', { assignmentTypeDraft: 'Temporary' })
    );
    fixture.currentData = { items: [{ ...row, studentCount: 36 }], eligibleTeachers: [] };
    rerender();
    expect(result.current.tableData[0].assignmentTypeDraft).toBe('Temporary');
    expect(result.current.hasChanges).toBe(true);
    act(() => result.current.discard());
    expect(result.current.tableData[0].assignmentTypeDraft).toBe('Permanent');
    expect(result.current.hasChanges).toBe(false);
  });

  it('clears previous-organization rows while the next scope loads', () => {
    const { result } = renderHook(useClassTeacherWorkspace);
    expect(result.current.tableData).toHaveLength(1);
    fixture.currentData = undefined;
    act(() => result.current.setOrganization('two'));
    expect(result.current.tableData).toEqual([]);
    expect(result.current.summary.totalClasses).toBe(0);
    expect(result.current.pendingRows).toEqual([]);
  });

  it('resets pagination for status changes without throwing away the draft', () => {
    const { result } = renderHook(useClassTeacherWorkspace);
    act(() => {
      result.current.updateRow('class-one-division-one', { assignmentTypeDraft: 'Temporary' });
      result.current.setPage(3);
    });
    act(() => result.current.setStatusFilter('temporary'));
    expect(result.current.page).toBe(0);
    expect(result.current.filteredData).toHaveLength(1);
    expect(result.current.hasChanges).toBe(true);
  });
});

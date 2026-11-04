import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useClassTeacherActions } from './useClassTeacherActions';

import type { AssignmentTableRow } from './classTeacherAssignmentModel';
import type { useClassTeacherWorkspace } from './useClassTeacherWorkspace';

const fixture = vi.hoisted(() => ({ save: vi.fn(), validate: vi.fn(), error: vi.fn() }));
vi.mock('src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi', () => ({
  useUpdateClassTeacherAssignmentsMutation: () => [fixture.save, {}],
  useValidateClassTeacherAssignmentsMutation: () => [fixture.validate, {}],
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: fixture.error },
}));

const row = {
  classId: 'class',
  divisionId: 'division',
  classTeacher: 'teacher',
  assignmentTypeDraft: 'Temporary',
  effectiveFromDraft: '2026-11-04',
  changeReasonDraft: 'Transfer',
} as AssignmentTableRow;

function workspace() {
  return {
    organization: 'organization',
    canAdd: true,
    hasChanges: true,
    isError: false,
    tableData: [row],
    pendingRows: [row],
    markSaved: vi.fn(),
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useClassTeacherWorkspace>;
}

describe('class teacher mutation safety', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends the existing organization-scoped payload once during duplicate save attempts', async () => {
    const w = workspace();
    let resolveSave!: () => void;
    const pending = new Promise<void>((resolve) => {
      resolveSave = resolve;
    });
    fixture.save.mockReturnValue({ unwrap: () => pending });
    const { result } = renderHook(() => useClassTeacherActions(w));
    let first!: Promise<void>;
    act(() => {
      first = result.current.saveDraft();
    });
    await act(() => result.current.saveDraft());
    expect(fixture.save).toHaveBeenCalledOnce();
    expect(fixture.save).toHaveBeenCalledWith({
      organizationId: 'organization',
      saveAsDraft: true,
      assignments: [
        {
          classId: 'class',
          divisionId: 'division',
          teacherId: 'teacher',
          assignmentType: 'Temporary',
          effectiveFrom: '2026-11-04',
          changeReason: 'Transfer',
        },
      ],
    });
    await act(async () => {
      resolveSave();
      await first;
    });
    expect(w.markSaved).toHaveBeenCalledOnce();
    expect(w.refetch).toHaveBeenCalledOnce();
  });

  it('retains the draft when saving fails', async () => {
    const w = workspace();
    fixture.save.mockReturnValue({ unwrap: () => Promise.reject(new Error('Request failed')) });
    const { result } = renderHook(() => useClassTeacherActions(w));
    await act(() => result.current.saveDraft());
    expect(w.markSaved).not.toHaveBeenCalled();
    expect(w.tableData).toEqual([row]);
    expect(fixture.error).toHaveBeenCalled();
  });

  it('blocks both save and review for an invalid effective date', async () => {
    const w = workspace();
    w.tableData = [{ ...row, effectiveFromDraft: 'Invalid Date' }];
    const { result } = renderHook(() => useClassTeacherActions(w));
    await act(async () => {
      await result.current.saveDraft();
      await result.current.review();
    });
    expect(fixture.save).not.toHaveBeenCalled();
    expect(fixture.validate).not.toHaveBeenCalled();
  });

  it('keeps server-rejected review results visible and prevents publishing', async () => {
    fixture.validate.mockReturnValue({
      unwrap: () => Promise.resolve({ canConfirm: false, issues: [], summary: {} }),
    });
    const { result } = renderHook(() => useClassTeacherActions(workspace()));
    await act(() => result.current.review());
    expect(result.current.reviewOpen).toBe(true);
    await act(() => result.current.confirm());
    expect(fixture.save).not.toHaveBeenCalled();
  });
});

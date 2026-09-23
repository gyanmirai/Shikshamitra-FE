import { describe, expect, it, vi } from 'vitest';

import { getElectiveSubjectTableActions } from './electiveSubjectTableActions';

import type { IElectiveSubject } from '../type';

const group: IElectiveSubject = {
  id: 'group-1',
  name: 'Languages',
  subjects: [],
  subjectIds: [],
  color: '#1976d2',
  createdBy: 'user-1',
  canDelete: true,
};

function createOptions() {
  return {
    canAdd: true,
    canView: true,
    canDelete: true,
    onViewUsage: vi.fn(),
    onEdit: vi.fn(),
    onArchive: vi.fn(),
    onRestore: vi.fn(),
    onDelete: vi.fn(),
  };
}

describe('getElectiveSubjectTableActions', () => {
  it('orders delete as the fourth action for an active elective group', () => {
    const actions = getElectiveSubjectTableActions(group, false, createOptions());

    expect(actions.map((action) => action.id)).toEqual(['view-usage', 'edit', 'archive', 'delete']);
  });

  it('returns only view and restore for an archived elective group', () => {
    const actions = getElectiveSubjectTableActions(group, true, createOptions());

    expect(actions.map((action) => action.id)).toEqual(['view-usage', 'restore']);
  });

  it('keeps delete visible but disabled when the elective group is in use', () => {
    const actions = getElectiveSubjectTableActions(
      { ...group, canDelete: false },
      false,
      createOptions()
    );
    const deleteAction = actions.find((action) => action.id === 'delete');

    expect(deleteAction).toMatchObject({ disabled: true });
    expect(deleteAction?.tooltip).toBeTruthy();
  });
});

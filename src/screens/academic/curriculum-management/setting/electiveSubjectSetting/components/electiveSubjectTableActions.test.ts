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
    canDelete: true,
    onEdit: vi.fn(),
    onArchive: vi.fn(),
    onRestore: vi.fn(),
    onDelete: vi.fn(),
  };
}

describe('getElectiveSubjectTableActions', () => {
  it('keeps the three active elective-group actions direct', () => {
    const actions = getElectiveSubjectTableActions(group, false, createOptions());

    expect(actions.map((action) => action.id)).toEqual(['edit', 'archive', 'delete']);
  });

  it('returns only restore for an archived elective group', () => {
    const actions = getElectiveSubjectTableActions(group, true, createOptions());

    expect(actions.map((action) => action.id)).toEqual(['restore']);
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

import { describe, expect, it, vi } from 'vitest';

import { getSettingSubjectTableActions } from './settingSubjectTableActions';

import type { ISubject } from './type';

const subject: ISubject = {
  id: 'subject-1',
  name: 'Science',
  color: '#1976d2',
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

describe('getSettingSubjectTableActions', () => {
  it('keeps the three active-subject actions direct', () => {
    const actions = getSettingSubjectTableActions(subject, false, createOptions());

    expect(actions.map((action) => action.id)).toEqual(['edit', 'archive', 'delete']);
  });

  it('returns only restore for an archived subject', () => {
    const actions = getSettingSubjectTableActions(subject, true, createOptions());

    expect(actions.map((action) => action.id)).toEqual(['restore']);
  });

  it('keeps delete visible but disabled when the subject is in use', () => {
    const actions = getSettingSubjectTableActions(
      { ...subject, canDelete: false },
      false,
      createOptions()
    );
    const deleteAction = actions.find((action) => action.id === 'delete');

    expect(deleteAction).toMatchObject({ disabled: true });
    expect(deleteAction?.tooltip).toBeTruthy();
  });
});

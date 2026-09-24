import { it, vi, expect, describe } from 'vitest';

import { getLearningTaskTableActions } from './learningTaskTableActions';

describe('getLearningTaskTableActions', () => {
  it('keeps view, edit, and publish first and sends later actions to overflow', () => {
    const actions = getLearningTaskTableActions({
      canView: true,
      canEdit: true,
      canPublish: true,
      canClose: true,
      canViewSubmissions: true,
      canDelete: true,
      deleteDisabled: false,
      deleteTooltip: 'Delete',
      onView: vi.fn(),
      onEdit: vi.fn(),
      onPublish: vi.fn(),
      onClose: vi.fn(),
      onViewSubmissions: vi.fn(),
      onDelete: vi.fn(),
    });

    expect(actions.map((action) => action.id)).toEqual([
      'view',
      'edit',
      'publish',
      'close',
      'submissions',
      'reminder',
      'delete',
    ]);
  });
});

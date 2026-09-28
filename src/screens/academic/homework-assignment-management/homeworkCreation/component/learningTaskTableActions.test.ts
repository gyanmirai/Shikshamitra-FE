import { it, vi, expect, describe } from 'vitest';

import { getLearningTaskTableActions } from './learningTaskTableActions';

describe('getLearningTaskTableActions', () => {
  it('keeps edit and publish first and sends later actions to overflow', () => {
    const actions = getLearningTaskTableActions({
      canEdit: true,
      canPublish: true,
      canClose: true,
      canViewSubmissions: true,
      canDelete: true,
      deleteDisabled: false,
      deleteTooltip: 'Delete',
      onEdit: vi.fn(),
      onPublish: vi.fn(),
      onClose: vi.fn(),
      onViewSubmissions: vi.fn(),
      onDelete: vi.fn(),
    });

    expect(actions.map((action) => action.id)).toEqual([
      'edit',
      'publish',
      'close',
      'submissions',
      'reminder',
      'delete',
    ]);
  });
});

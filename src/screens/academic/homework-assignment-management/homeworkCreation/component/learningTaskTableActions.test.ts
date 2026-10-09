import { it, vi, expect, describe } from 'vitest';

import { getLearningTaskTableActions } from './learningTaskTableActions';

describe('getLearningTaskTableActions', () => {
  it('places publish first when available and sends later actions to overflow', () => {
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
      'publish',
      'edit',
      'close',
      'submissions',
      'reminder',
      'delete',
    ]);
  });

  it('keeps edit first when publish is unavailable', () => {
    const actions = getLearningTaskTableActions({
      canEdit: true,
      canPublish: false,
      canViewSubmissions: false,
      canDelete: false,
      deleteDisabled: true,
      deleteTooltip: '',
      onEdit: vi.fn(),
      onPublish: vi.fn(),
      onViewSubmissions: vi.fn(),
      onDelete: vi.fn(),
    });

    expect(actions[0].id).toBe('edit');
  });
});

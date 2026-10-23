import { it, vi, expect, describe } from 'vitest';
import { RubricStatus } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';

import { getRubricConfigTableActions } from './rubricConfigTableActions';

describe('getRubricConfigTableActions', () => {
  it('orders draft actions with later actions in overflow', () => {
    const rubric = { id: 'rubric-1', status: RubricStatus.Draft } as never;
    const handler = vi.fn();
    const actions = getRubricConfigTableActions(rubric, {
      canAdd: true,
      canDelete: true,
      onPreview: handler,
      onEdit: handler,
      onDuplicate: handler,
      onPublish: handler,
      onUsage: handler,
      onArchive: handler,
    });

    expect(actions.map((action) => action.id)).toEqual([
      'preview',
      'edit',
      'duplicate',
      'publish',
      'usage',
      'archive',
    ]);
  });

  it('offers an honest duplicate action for published templates without claiming version lineage', () => {
    const rubric = { id: 'rubric-1', title: 'Reasoning', status: RubricStatus.Published } as never;
    const handler = vi.fn();
    const onDuplicate = vi.fn();
    const actions = getRubricConfigTableActions(rubric, {
      canAdd: true,
      canDelete: true,
      onPreview: handler,
      onEdit: handler,
      onDuplicate,
      onPublish: handler,
      onUsage: handler,
      onArchive: handler,
    });
    expect(actions.map(({ id }) => id)).not.toContain('new-version');
    actions.find(({ id }) => id === 'duplicate')!.onClick?.();
    expect(onDuplicate).toHaveBeenCalledWith(rubric);
  });
});

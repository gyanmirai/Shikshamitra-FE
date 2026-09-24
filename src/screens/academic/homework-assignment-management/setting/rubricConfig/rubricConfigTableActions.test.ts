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
      onVersion: handler,
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
});

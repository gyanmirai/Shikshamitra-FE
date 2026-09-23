import { describe, expect, it, vi } from 'vitest';

import { getLessonPlanTableActions } from './lessonPlanTableActions';

import type { LessonPlanRow } from './lessonPlanData';

const plan = { id: 'plan-1' } as LessonPlanRow;

function createOptions() {
  return {
    canManageDiary: true,
    canView: true,
    hasDiary: false,
    diaryDisabled: false,
    diaryTooltip: 'Add diary notes',
    onOpenDiary: vi.fn(),
    onViewDetails: vi.fn(),
  };
}

describe('getLessonPlanTableActions', () => {
  it('shows diary and view actions directly', () => {
    const actions = getLessonPlanTableActions(plan, createOptions());

    expect(actions.map((action) => action.id)).toEqual(['diary', 'view']);
  });

  it('preserves the disabled diary explanation', () => {
    const actions = getLessonPlanTableActions(plan, {
      ...createOptions(),
      diaryDisabled: true,
      diaryTooltip: 'Lesson plan must be approved.',
    });

    expect(actions[0]).toMatchObject({
      disabled: true,
      tooltip: 'Lesson plan must be approved.',
    });
  });
});

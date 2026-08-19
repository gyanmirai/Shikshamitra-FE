import { describe, expect, it } from 'vitest';

import type { LessonPlanRow } from './lessonPlanData';

import { reconcileTimelineSlots } from './reconcileTimelineSlots';

const createPlan = (overrides: Partial<LessonPlanRow> = {}): LessonPlanRow =>
  ({
    id: 'plan-1',
    teacherId: 'teacher-1',
    plannedDate: '2026-08-21',
    timetableSlotId: 'slot-1',
    standardId: 'standard-1',
    divisionId: 'division-1',
    subjectId: 'subject-1',
    ...overrides,
  }) as LessonPlanRow;

describe('reconcileTimelineSlots', () => {
  it('attaches an existing plan using the timetable slot id', () => {
    const plan = createPlan();
    const slots = [{ timetableSlotId: 'slot-1', lessonPlan: null }];

    const result = reconcileTimelineSlots(slots, [plan], '2026-08-21', 'teacher-1');

    expect(result[0].lessonPlan).toBe(plan);
  });

  it('recovers a plan with an obsolete slot id when its context is unambiguous', () => {
    const plan = createPlan({ timetableSlotId: 'obsolete-slot' });
    const slots = [
      {
        timetableSlotId: 'current-slot',
        standardId: 'standard-1',
        divisionId: 'division-1',
        subjectId: 'subject-1',
        lessonPlan: null,
      },
    ];

    const result = reconcileTimelineSlots(slots, [plan], '2026-08-21', 'teacher-1');

    expect(result[0].lessonPlan).toBe(plan);
  });

  it('does not guess when multiple timetable slots have the same context', () => {
    const plan = createPlan({ timetableSlotId: 'obsolete-slot' });
    const context = {
      standardId: 'standard-1',
      divisionId: 'division-1',
      subjectId: 'subject-1',
      lessonPlan: null,
    };
    const slots = [
      { ...context, timetableSlotId: 'current-slot-1' },
      { ...context, timetableSlotId: 'current-slot-2' },
    ];

    const result = reconcileTimelineSlots(slots, [plan], '2026-08-21', 'teacher-1');

    expect(result.every((slot) => slot.lessonPlan === null)).toBe(true);
  });
});

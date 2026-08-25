import { it, expect, describe } from 'vitest';

import { reconcileTimelineSlots } from './reconcileTimelineSlots';

import type { LessonPlanRow } from './lessonPlanData';

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

  it('maps multiple plans only to their exact class, division, subject, and slot', () => {
    const socialSciencePlan = createPlan({
      id: 'social-science-plan',
      timetableSlotId: 'class-8-b-period-5',
      standardId: 'class-8',
      divisionId: 'division-b',
      subjectId: 'social-science',
    });
    const chemistryPlan = createPlan({
      id: 'chemistry-plan',
      timetableSlotId: 'class-11-a-period-2',
      standardId: 'class-11',
      divisionId: 'division-a',
      subjectId: 'chemistry',
    });
    const slots = [
      {
        timetableSlotId: 'class-11-a-period-2',
        standardId: 'class-11',
        divisionId: 'division-a',
        subjectId: 'chemistry',
        lessonPlan: null,
      },
      {
        timetableSlotId: 'class-8-b-period-5',
        standardId: 'class-8',
        divisionId: 'division-b',
        subjectId: 'social-science',
        lessonPlan: null,
      },
    ];

    const result = reconcileTimelineSlots(
      slots,
      [socialSciencePlan, chemistryPlan],
      '2026-08-21',
      'teacher-1'
    );

    expect(result[0].lessonPlan).toBe(chemistryPlan);
    expect(result[1].lessonPlan).toBe(socialSciencePlan);
  });

  it('does not attach plans belonging to another date or teacher', () => {
    const slots = [{ timetableSlotId: 'slot-1', lessonPlan: null }];
    const nextDayPlan = createPlan({ plannedDate: '2026-08-22' });
    const anotherTeacherPlan = createPlan({ id: 'plan-2', teacherId: 'teacher-2' });

    const result = reconcileTimelineSlots(
      slots,
      [nextDayPlan, anotherTeacherPlan],
      '2026-08-21T00:00:00+05:30',
      'teacher-1'
    );

    expect(result[0].lessonPlan).toBeNull();
  });

  it('does not attach a slot-id match when its subject context is different', () => {
    const plan = createPlan({ subjectId: 'chemistry' });
    const slots = [
      {
        timetableSlotId: 'slot-1',
        standardId: 'standard-1',
        divisionId: 'division-1',
        subjectId: 'social-science',
        lessonPlan: null,
      },
    ];

    const result = reconcileTimelineSlots(slots, [plan], '2026-08-21', 'teacher-1');

    expect(result[0].lessonPlan).toBeNull();
  });

  it('normalizes ISO timestamps to the selected calendar date', () => {
    const plan = createPlan({ plannedDate: '2026-08-21T00:00:00+00:00' });
    const slots = [{ timetableSlotId: 'slot-1', lessonPlan: null }];

    const result = reconcileTimelineSlots(
      slots,
      [plan],
      '2026-08-21T00:00:00+05:30',
      'teacher-1'
    );

    expect(result[0].lessonPlan).toBe(plan);
  });
});

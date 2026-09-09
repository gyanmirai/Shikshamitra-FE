import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { reconcileTimelineSlots } from './reconcileTimelineSlots';

import type { LessonPlanRow } from './lessonPlanData';

const planFor = (date: string) => ({
  id: `plan-${date}`,
  teacherId: 'teacher-1',
  plannedDate: dayjs(date).toISOString(),
  timetableSlotId: 'slot-1',
  standardId: 'class-12',
  divisionId: 'division-b',
  subjectId: 'maths',
});

describe('daily timeline date isolation', () => {
  it.each(['2026-09-07', '2026-09-09'])(
    'hides an already attached plan for %s from the 8 September feed',
    (plannedDate) => {
      const slot = { timetableSlotId: 'slot-1', lessonPlan: planFor(plannedDate) };
      expect(reconcileTimelineSlots([slot], [], '2026-09-08', 'teacher-1')).toEqual([]);
    }
  );

  it('shows the future plan only when its intended local calendar day is selected', () => {
    const plan = planFor('2026-09-09');
    const slot = { timetableSlotId: 'slot-1', lessonPlan: plan };
    expect(reconcileTimelineSlots([slot], [], '2026-09-08', 'teacher-1')).toEqual([]);
    expect(reconcileTimelineSlots([slot], [], '2026-09-09', 'teacher-1')).toEqual([slot]);
    expect(reconcileTimelineSlots([slot], [], '2026-09-10', 'teacher-1')).toEqual([]);
  });

  it('retains empty teaching periods while removing off-date manual plans', () => {
    const empty = { timetableSlotId: 'slot-2', lessonPlan: null };
    const manual = { timetableSlotId: 'manual-id', lessonPlan: planFor('2026-09-09') };
    expect(reconcileTimelineSlots([manual, empty], [], '2026-09-08', 'teacher-1')).toEqual([empty]);
  });

  it.each([undefined, null, '', 'invalid-date'])(
    'does not expose diary actions for an attached plan with plannedDate %s',
    (plannedDate) => {
      const slot = { lessonPlan: { ...planFor('2026-09-08'), plannedDate } };
      expect(reconcileTimelineSlots([slot], [], '2026-09-08', 'teacher-1')).toEqual([]);
    }
  );

  it('does not keep an embedded plan for a different teacher', () => {
    const slot = { lessonPlan: { ...planFor('2026-09-08'), teacherId: 'teacher-2' } };
    expect(reconcileTimelineSlots([slot], [], '2026-09-08', 'teacher-1')).toEqual([]);
  });

  it('uses the same local date comparison for fallback plans and embedded API plans', () => {
    const plan = planFor('2026-09-09') as LessonPlanRow;
    const empty = { timetableSlotId: 'slot-1', lessonPlan: null };
    const result = reconcileTimelineSlots([empty], [plan], '2026-09-09', 'teacher-1');
    expect(result[0].lessonPlan).toBe(plan);
    expect(reconcileTimelineSlots(result, [], '2026-09-09', 'teacher-1')).toEqual(result);
    expect(reconcileTimelineSlots(result, [], '2026-09-08', 'teacher-1')).toEqual([]);
  });

  it('supports PascalCase API fields without mutating the source response', () => {
    const plan = {
      Id: 'plan-1',
      PlannedDate: dayjs('2026-09-09').toISOString(),
      TeacherId: 'teacher-1',
    };
    const slots = Object.freeze([Object.freeze({ lessonPlan: plan })]);
    expect(reconcileTimelineSlots(slots, [], '2026-09-08', 'teacher-1')).toEqual([]);
    expect(reconcileTimelineSlots(slots, [], '2026-09-09', 'teacher-1')[0].lessonPlan).toBe(plan);
  });
});

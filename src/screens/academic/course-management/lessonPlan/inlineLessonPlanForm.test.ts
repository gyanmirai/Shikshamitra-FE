import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import {
  buildInlineLessonPlanForm,
  getInlineLessonContextError,
  getInlineLessonDuplicateError,
  inlineLessonPlanValidationSchema,
} from './inlineLessonPlanForm';

const context = {
  academicYearId: 'year-1',
  academicYearName: '2026-27',
  teacherId: 'teacher-1',
  teacherName: 'Teacher One',
  timetableSlotId: 'slot-1',
  periodName: 'Period 1',
  standardId: 'standard-1',
  standardName: 'Grade 1',
  divisionId: 'division-a',
  divisionName: 'A',
  subjectId: 'subject-1',
  subjectName: 'Mathematics',
};

const existingPlan = {
  id: 'plan-1',
  teacherId: 'teacher-1',
  timetableSlotId: 'slot-1',
  plannedDate: '2026-09-24',
  topic: 'Addition of fractions',
};

describe('inline lesson-plan form rules', () => {
  describe('when required timetable context is incomplete', () => {
    it('returns a recoverable context error', () => {
      expect(getInlineLessonContextError({ ...context, subjectId: '' })).toContain(
        'missing required class details'
      );
    });
  });

  describe('when another plan uses the same slot', () => {
    it('blocks the duplicate period', () => {
      expect(
        getInlineLessonDuplicateError(context, dayjs('2026-09-24'), 'A different topic', [
          existingPlan,
        ])
      ).toEqual({
        message: 'A lesson plan already exists for this timetable period on this date.',
      });
    });
  });

  describe('when the teacher repeats a normalized topic in another slot', () => {
    it('returns a topic field error', () => {
      expect(
        getInlineLessonDuplicateError(
          { ...context, timetableSlotId: 'slot-2' },
          dayjs('2026-09-24'),
          '  addition   OF fractions ',
          [existingPlan]
        )
      ).toEqual({
        field: 'topic',
        message: 'This topic is already planned for this teacher on this date.',
      });
    });
  });

  describe('when valid inline values are converted for saving', () => {
    it('creates the existing minimal draft form shape', () => {
      const form = buildInlineLessonPlanForm(
        context,
        dayjs('2026-09-24'),
        {
          chapterId: 'chapter-1',
          chapterName: 'Fractions',
          topic: '  Addition of fractions  ',
          plannedCompletionPercentage: 40,
        },
        45
      );

      expect(form).toMatchObject({
        timetableSlotId: 'slot-1',
        chapterId: 'chapter-1',
        topic: 'Addition of fractions',
        plannedCompletionPercentage: 45,
        learningObjective: '',
        resourcesRequired: '',
      });
    });
  });

  describe('when required inline fields are empty', () => {
    it('reports chapter and topic validation errors', async () => {
      await expect(
        inlineLessonPlanValidationSchema.validate(
          { chapterId: '', chapterName: '', topic: '', plannedCompletionPercentage: 0 },
          { abortEarly: false }
        )
      ).rejects.toMatchObject({
        errors: ['Chapter is required.', 'Chapter is required.', 'Topic is required.'],
      });
    });
  });
});

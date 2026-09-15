import { it, expect, describe } from 'vitest';

import { getSyncedExamId, calendarDayInitialValues } from './initialValues';

describe('calendar day initial values', () => {
  it('recovers the parent exam id for a legacy synchronized marker', () => {
    const examId = '3a238ca1-2150-06ab-6dc4-dc48f6100000';
    const values = calendarDayInitialValues({
      description: `Auto-created from examination schedule. ExamId: ${examId}`,
      startTime: '10:15:00',
      endTime: '10:50:00',
    });

    expect(values.linkedExamId).toBe(examId);
    expect(values.examStartTime).toBe('10:15:00');
    expect(values.examEndTime).toBe('10:50:00');
  });

  it('does not treat arbitrary descriptions as exam linkage metadata', () => {
    expect(getSyncedExamId('School event')).toBe('');
    expect(getSyncedExamId('Auto-created from examination schedule. ExamId: invalid')).toBe('');
  });
});

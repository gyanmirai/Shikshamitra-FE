import { it, expect, describe } from 'vitest';

import {
  hasValidTeacherOriginRange,
  createTeacherOriginFromAvailability,
} from './create-substitution-origin';

describe('createTeacherOriginFromAvailability', () => {
  it('preserves the employee and availability window from the action row', () => {
    const origin = createTeacherOriginFromAvailability({
      id: 'availability-1',
      teacherId: 'teacher-1',
      teacherName: 'Akshay Patel',
      departmentName: 'Science',
      availabilityDate: '2026-09-21',
      startTime: '09:00',
      endTime: '14:15',
      availabilityStatus: 'Unavailable',
      sourceType: 'Attendance',
      reason: 'Marked absent in HR attendance.',
      isFullDay: true,
      affectedLectureCount: 2,
      notifyLeadership: true,
    });

    expect(origin).toMatchObject({
      teacherId: 'teacher-1',
      teacherName: 'Akshay Patel',
      departmentName: 'Science',
      startTime: '09:00',
      endTime: '14:15',
      isFullDay: true,
      sourceType: 'Attendance',
    });
    expect(origin.date?.format('YYYY-MM-DD')).toBe('2026-09-21');
  });
});

describe('hasValidTeacherOriginRange', () => {
  it('rejects an invalid partial-day range', () => {
    expect(
      hasValidTeacherOriginRange({
        teacherId: 'teacher-1',
        teacherName: 'Akshay Patel',
        departmentName: 'Science',
        date: null,
        startTime: '12:00',
        endTime: '11:00',
        isFullDay: false,
        reason: 'Meeting',
        remarks: '',
        sourceType: 'Manual',
      })
    ).toBe(false);
  });
});

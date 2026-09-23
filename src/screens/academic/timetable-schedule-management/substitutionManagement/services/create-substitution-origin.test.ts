import { it, expect, describe } from 'vitest';

import {
  resolveTeacherShift,
  buildFullDayOriginPatch,
  hasValidTeacherOriginRange,
  createTeacherOriginFromAvailability,
} from './create-substitution-origin';

describe('resolveTeacherShift', () => {
  it('normalizes the employee shift returned by the HR API', () => {
    expect(
      resolveTeacherShift({
        name: 'Morning Shift',
        startTime: '07:30:00',
        endTime: '15:45:00',
      })
    ).toEqual({
      name: 'Morning Shift',
      startTime: '07:30',
      endTime: '15:45',
      isValid: true,
    });
  });

  it('rejects an incomplete or reversed employee shift', () => {
    expect(resolveTeacherShift({ startTime: '17:00', endTime: '09:00' }).isValid).toBe(false);
    expect(resolveTeacherShift({ startTime: '', endTime: '' }).isValid).toBe(false);
  });
});

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
      shiftStartTime: '09:00',
      shiftEndTime: '14:15',
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
        shiftName: 'Day Shift',
        shiftStartTime: '09:00',
        shiftEndTime: '17:00',
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

  it('rejects a full-day origin until the selected teacher has valid shift times', () => {
    expect(
      hasValidTeacherOriginRange({
        teacherId: 'teacher-1',
        teacherName: 'Akshay Patel',
        departmentName: 'Science',
        shiftName: '',
        shiftStartTime: '',
        shiftEndTime: '',
        date: null,
        startTime: '',
        endTime: '',
        isFullDay: true,
        reason: 'Teacher absent',
        remarks: '',
        sourceType: 'Manual',
      })
    ).toBe(false);
  });
});

describe('buildFullDayOriginPatch', () => {
  it('restores the selected teacher assigned shift when Full day is enabled', () => {
    expect(
      buildFullDayOriginPatch(
        {
          teacherId: 'teacher-1',
          teacherName: 'Akshay Patel',
          departmentName: 'Science',
          shiftName: 'Morning Shift',
          shiftStartTime: '07:30',
          shiftEndTime: '15:45',
          date: null,
          startTime: '09:00',
          endTime: '12:00',
          isFullDay: false,
          reason: 'Teacher absent',
          remarks: '',
          sourceType: 'Manual',
        },
        true
      )
    ).toEqual({ isFullDay: true, startTime: '07:30', endTime: '15:45' });
  });
});

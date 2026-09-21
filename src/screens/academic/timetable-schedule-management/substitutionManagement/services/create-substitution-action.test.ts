import { describe, expect, it, vi } from 'vitest';

import {
  createSubstitutionSegments,
  resolveAvailabilityTeacherSelection,
} from './create-substitution-action';

describe('resolveAvailabilityTeacherSelection', () => {
  it('keeps the employee from the availability action selected in the substitution form', () => {
    expect(
      resolveAvailabilityTeacherSelection(
        { teacherId: 'availability-teacher', teacherName: 'Akshay Patel' },
        { teacherId: 'lecture-teacher', teacherName: 'Stale Lecture Teacher' }
      )
    ).toEqual({
      originalTeacherId: 'availability-teacher',
      originalTeacherName: 'Akshay Patel',
    });
  });

  it('falls back to the affected lecture teacher when availability identity is incomplete', () => {
    expect(
      resolveAvailabilityTeacherSelection(
        { teacherId: null, teacherName: '  ' },
        { teacherId: 'lecture-teacher', teacherName: 'Akshay Patel' }
      )
    ).toEqual({
      originalTeacherId: 'lecture-teacher',
      originalTeacherName: 'Akshay Patel',
    });
  });
});

describe('createSubstitutionSegments', () => {
  it('resets mutation state after every segment succeeds', async () => {
    const resetMutation = vi.fn();

    await expect(
      createSubstitutionSegments({
        segments: ['first', 'second'],
        create: async (segment) => `${segment}-created`,
        resetMutation,
      })
    ).resolves.toEqual(['first-created', 'second-created']);

    expect(resetMutation).toHaveBeenCalledTimes(1);
  });

  it('resets mutation state when any segment fails', async () => {
    const resetMutation = vi.fn();

    await expect(
      createSubstitutionSegments({
        segments: ['failed'],
        create: async () => {
          throw new Error('create failed');
        },
        resetMutation,
      })
    ).rejects.toThrow('create failed');

    expect(resetMutation).toHaveBeenCalledTimes(1);
  });
});

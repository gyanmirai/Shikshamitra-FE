import { it, expect, describe } from 'vitest';

import { getClassTeacherAssignmentStatusColor } from './classTeacherAssignmentStatus';

describe('getClassTeacherAssignmentStatusColor', () => {
  it('keeps an active assignment green independently of workload warnings', () => {
    expect(getClassTeacherAssignmentStatusColor('Active')).toBe('success');
  });

  it.each([
    ['Conflict', 'error'],
    ['Changed', 'info'],
    ['Unassigned', 'warning'],
    ['Unknown', 'default'],
  ] as const)('maps %s to %s', (status, color) => {
    expect(getClassTeacherAssignmentStatusColor(status)).toBe(color);
  });
});

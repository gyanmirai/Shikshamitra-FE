import { it, expect, describe } from 'vitest';

import {
  getAcademicSessionRoles,
  resolveAcademicDashboardMode,
} from './academic-dashboard-resolver';

describe('academic dashboard resolver', () => {
  it('reads single and multiple session role claims', () => {
    expect(getAcademicSessionRoles({ profile: { role: 'Teacher' } })).toEqual(['Teacher']);
    expect(getAcademicSessionRoles({ profile: { roleNames: ['Teacher', 'HOD'] } })).toEqual([
      'Teacher',
      'HOD',
    ]);
  });

  it('uses the safest supported priority for multi-role users', () => {
    expect(resolveAcademicDashboardMode(['Teacher', 'Admin'])).toBe('admin');
    expect(resolveAcademicDashboardMode(['Teacher', 'Academic-Coordinator'])).toBe('leadership');
    expect(resolveAcademicDashboardMode(['SuperAdmin'])).toBe('admin');
  });

  it('uses the common dashboard when no academic role matches', () => {
    expect(resolveAcademicDashboardMode(['Finance Officer'])).toBe('common');
    expect(resolveAcademicDashboardMode([])).toBe('common');
  });
});

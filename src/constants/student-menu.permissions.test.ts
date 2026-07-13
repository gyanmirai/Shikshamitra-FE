import fs from 'fs';
import path from 'path';
import { it, expect, describe } from 'vitest';
import { hasGrantedPermission } from 'src/utils/permissions';

import { studentPermissions } from './student-menu';

const repoRoot = process.cwd();

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

describe('student permission groups', () => {
  it('uses real backend leaf permissions for student section parents', () => {
    const permissions = [
      { name: 'Students.Enrollment.AdmissionsCrm.View', isGranted: true },
      { name: 'Students.Records.StudentList.View', isGranted: true },
      { name: 'Students.Attendance.LeaveAndAbsent.View', isGranted: true },
    ];

    expect(hasGrantedPermission(permissions, studentPermissions.enrollment.root)).toBe(true);
    expect(hasGrantedPermission(permissions, studentPermissions.records.root)).toBe(true);
    expect(hasGrantedPermission(permissions, studentPermissions.attendance.root)).toBe(true);
  });

  it('does not expose phantom student module parent permissions', () => {
    const source = JSON.stringify(studentPermissions);

    expect(source).not.toContain('ShikshaMitra.Module.Students.Enrollment');
    expect(source).not.toContain('ShikshaMitra.Module.Students.Records');
    expect(source).not.toContain('ShikshaMitra.Module.Students.Attendance');
    expect(source).not.toContain('ShikshaMitra.Module.Students.Notification');
    expect(studentPermissions.dashboard).toBe('ShikshaMitra.Module.Students');
  });

  it('keeps the CRM enrollment shell server-rendered so workspace routes do not fall into 404', () => {
    const shellSource = readSource(
      'src/app/(auth-route)/student/enrollment/layout.tsx'
    ).trimStart();
    expect(shellSource).not.toMatch(/^['"]use client['"]/);
    expect(shellSource).toContain('StudentPermissionGuard');

    const workspacePaths = [
      'src/app/(auth-route)/student/enrollment/pipeline/page.tsx',
      'src/app/(auth-route)/student/enrollment/exams/page.tsx',
      'src/app/(auth-route)/student/enrollment/registrations/page.tsx',
      'src/app/(auth-route)/student/enrollment/offers-seats/page.tsx',
      'src/app/(auth-route)/student/enrollment/activation/page.tsx',
      'src/app/(auth-route)/student/enrollment/operations/page.tsx',
      'src/app/(auth-route)/student/enrollment/analytics/page.tsx',
      'src/app/(auth-route)/student/attendance/layout.tsx',
      'src/app/(auth-route)/student/attendance/leave-absent/layout.tsx',
      'src/app/(auth-route)/student/attendance/notification/layout.tsx',
      'src/app/(auth-route)/student/attendance/reports/layout.tsx',
      'src/app/(auth-route)/student/attendance/setting/layout.tsx',
      'src/app/(auth-route)/student/attendance/take-attendance/layout.tsx',
    ];

    workspacePaths.forEach((workspacePath) => {
      const source = readSource(workspacePath).trimStart();

      expect(source, workspacePath).not.toMatch(/^['"]use client['"]/);
    });

    const settingsSource = readSource(
      'src/app/(auth-route)/student/enrollment/settings/page.tsx'
    ).trimStart();
    expect(settingsSource).toMatch(/^['"]use client['"]/);
  });
});

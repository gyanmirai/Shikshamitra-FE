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
      { name: 'Students.Enrollment.Inquiry.View', isGranted: true },
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

  it('keeps nested student permission layouts server-rendered so routes do not fall into 404', () => {
    const layoutPaths = [
      'src/app/(auth-route)/student/enrollment/layout.tsx',
      'src/app/(auth-route)/student/enrollment/admission/layout.tsx',
      'src/app/(auth-route)/student/enrollment/entrance-exam/layout.tsx',
      'src/app/(auth-route)/student/enrollment/inquiry/layout.tsx',
      'src/app/(auth-route)/student/enrollment/registration/layout.tsx',
      'src/app/(auth-route)/student/enrollment/registration-form/layout.tsx',
      'src/app/(auth-route)/student/enrollment/reports/layout.tsx',
      'src/app/(auth-route)/student/enrollment/setting/layout.tsx',
      'src/app/(auth-route)/student/enrollment/setting/documentTypes/layout.tsx',
      'src/app/(auth-route)/student/enrollment/setting/entranceExamSlots/layout.tsx',
      'src/app/(auth-route)/student/enrollment/setting/inquiryPrefrence/layout.tsx',
      'src/app/(auth-route)/student/attendance/layout.tsx',
      'src/app/(auth-route)/student/attendance/leave-absent/layout.tsx',
      'src/app/(auth-route)/student/attendance/notification/layout.tsx',
      'src/app/(auth-route)/student/attendance/reports/layout.tsx',
      'src/app/(auth-route)/student/attendance/setting/layout.tsx',
      'src/app/(auth-route)/student/attendance/take-attendance/layout.tsx',
    ];

    layoutPaths.forEach((layoutPath) => {
      const source = readSource(layoutPath).trimStart();

      expect(source, layoutPath).not.toMatch(/^['"]use client['"]/);
      expect(source, layoutPath).toContain('StudentPermissionGuard');
    });
  });
});

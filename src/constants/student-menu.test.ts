import { it, expect, describe } from 'vitest';

import studentModule, { studentPermissions, studentVisibilityPermissions } from './student-menu';

type NestedMenuItem = {
  title: string;
  path: string;
  permissionName?: string | string[];
  children?: NestedMenuItem[];
  permissionChildren?: { title: string; permissionName?: string | string[] }[];
  visibilityPermissionName?: string;
};

describe('student navigation', () => {
  it('exposes four Attendance workspaces with existing URLs and permission bundles', () => {
    const items = Object.values(studentModule(true)).flatMap((sections) =>
      sections.flatMap((group) => group.items)
    );
    const attendance = items.find((item) => item.title === 'Attendance') as NestedMenuItem;
    expect(attendance.path).toBe('/student/attendance/take-attendance');
    expect(attendance.children?.map((item) => item.title)).toEqual([
      'Daily Attendance',
      'Leave & Corrections',
      'Reports',
      'Settings',
    ]);
    expect(attendance.children?.map((item) => item.path)).toEqual([
      '/student/attendance/take-attendance',
      '/student/attendance/leave-absent',
      '/student/attendance/reports',
      '/student/attendance/setting',
    ]);
    expect(
      attendance.children?.find((item) => item.title === 'Settings')?.children
    ).toBeUndefined();
    expect(
      attendance.children?.find((item) => item.title === 'Daily Attendance')?.permissionName
    ).toBe(studentPermissions.attendance.markAttendance);
  });
  it('exposes the six Student Records workspaces and retains legacy URLs outside the menu', () => {
    const items = Object.values(studentModule(true)).flatMap((sections) =>
      sections.flatMap((group) => group.items)
    );
    const records = items.find((item) => item.title === 'Student Records') as NestedMenuItem;
    expect(records.children?.map((item) => item.title)).toEqual([
      'Student Directory',
      'Changes & Approvals',
      'Documents & IDs',
      'Year-End & Transitions',
      'Reports',
      'Settings',
    ]);
    expect(records.children?.every((item) => item.path.startsWith('/student/records/'))).toBe(true);
    expect(records.children?.some((item) => item.path === '/student/management')).toBe(false);
  });
  it('keeps Dashboard access separate from Dashboard visibility', () => {
    const sections = Object.values(studentModule(true));
    const items = sections.flatMap((section) => section.flatMap((group) => group.items));
    const dashboard = items.find((item) => item.title === 'Dashboard');

    expect(dashboard?.permissionName).toBe('Students.Dashboard.View');
    expect(dashboard?.visibilityPermissionName).toBe(studentVisibilityPermissions.dashboard);
  });

  it('maps every top-level Student row to a dedicated visibility permission', () => {
    const sections = Object.values(studentModule(true));
    const items = sections.flatMap((section) => section.flatMap((group) => group.items));

    expect(
      Object.fromEntries(items.map((item) => [item.title, item.visibilityPermissionName]))
    ).toEqual({
      Dashboard: studentVisibilityPermissions.dashboard,
      'Student Records': studentVisibilityPermissions.records,
      Admissions: studentVisibilityPermissions.admissions,
      Onboarding: studentVisibilityPermissions.onboarding,
      Attendance: studentVisibilityPermissions.attendance,
      Notification: studentVisibilityPermissions.notification,
    });
  });

  it('exposes the Student Onboarding setup and settings hierarchy', () => {
    const sections = Object.values(studentModule(true));
    const items = sections.flatMap((section) => section.flatMap((group) => group.items));
    const onboarding = items.find((item) => item.title === 'Onboarding') as
      NestedMenuItem | undefined;

    expect(onboarding?.path).toBe('/student/onboarding');
    expect(onboarding?.permissionName).toEqual([
      'Students.Onboarding.View',
      'Students.Onboarding.Add',
    ]);
    expect(onboarding?.visibilityPermissionName).toBe('ShikshaMitra.Module.Students.Onboarding');
    expect(onboarding?.children?.map((item) => item.title)).toEqual(['Student Setup', 'Settings']);
    expect(onboarding?.children?.find((item) => item.title === 'Student Setup')).toMatchObject({
      path: '/student/onboarding/setup',
      permissionName: 'Students.Onboarding.View',
    });
    expect(onboarding?.children?.find((item) => item.title === 'Settings')).toMatchObject({
      path: '/student/onboarding/settings',
      permissionName: 'Students.Onboarding.Add',
    });
    expect(
      onboarding?.children
        ?.find((item) => item.title === 'Settings')
        ?.children?.map((item) => item.title)
    ).toEqual(['Readiness & Access', 'Numbering & Placement']);
  });

  it('exposes all notification permission groups in the permission editor', () => {
    const sections = Object.values(studentModule(true));
    const items = sections.flatMap((section) => section.flatMap((group) => group.items));
    const notification = items.find((item) => item.title === 'Notification') as
      NestedMenuItem | undefined;

    expect(notification?.permissionChildren?.map((item) => item.title)).toEqual([
      'Inquiry Management',
      'Registration Management',
      'Admission Management',
      'Student Record Management',
      'Attendance Management',
    ]);
  });

  it('exposes the configured Admissions hierarchy without broken child paths', () => {
    const sections = Object.values(studentModule(true));
    const items = sections.flatMap((section) => section.flatMap((group) => group.items));
    const admissions = items.find((item) => item.title === 'Admissions') as
      NestedMenuItem | undefined;

    expect(admissions).toBeDefined();
    expect(admissions?.path).toBe('/student/admissions');
    expect(admissions?.children?.map((item) => item.title)).toEqual([
      'Inquiries',
      'Pipeline',
      'Assessments',
      'Applications',
      'Settings',
    ]);

    const inquiries = admissions?.children?.find((item) => item.title === 'Inquiries');
    const pipeline = admissions?.children?.find((item) => item.title === 'Pipeline');
    expect(inquiries?.path).toBe('/student/admissions/inquiries');
    expect(inquiries?.permissionName).toBe(studentPermissions.enrollment.inquiries);
    expect(pipeline?.path).toBe('/student/admissions/pipeline');
    expect(pipeline?.permissionName).toBe(studentPermissions.enrollment.applications);

    const applications = admissions?.children?.find((item) => item.title === 'Applications');
    expect(applications?.path).toBe('/student/admissions/applications');
    expect(applications?.permissionName).toBe(studentPermissions.enrollment.applications);
    expect(applications?.permissionChildren).toBeUndefined();

    const settings = admissions?.children?.find((item) => item.title === 'Settings');
    expect(settings?.children?.map((item) => item.title)).toEqual([
      'Admission Periods',
      'Admission Form',
      'Admission Stage',
      'Intake & Assignment',
      'Admission Offering',
    ]);
    expect(settings?.children?.map((item) => item.path)).toEqual([
      '/student/admissions/settings/cycles',
      '/student/admissions/settings/forms',
      '/student/admissions/settings/workflows',
      '/student/admissions/settings/intake-assignment',
      '/student/admissions/settings/offerings',
    ]);

    const visibleTitles = admissions?.children?.flatMap((item) => [
      item.title,
      ...(item.children?.map((child) => child.title) ?? []),
    ]);
    expect(visibleTitles).not.toEqual(
      expect.arrayContaining([
        'Dashboard',
        'CRM',
        'All Applications',
        'Review queue',
        'Inquiry Pipeline',
        'Class Admission Setup',
      ])
    );
  });
});

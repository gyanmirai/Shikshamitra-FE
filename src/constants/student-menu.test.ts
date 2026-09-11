import { it, expect, describe } from 'vitest';

import studentModule, { studentVisibilityPermissions } from './student-menu';

type NestedMenuItem = {
  title: string;
  path: string;
  permissionName?: string | string[];
  children?: NestedMenuItem[];
  permissionChildren?: { title: string; permissionName?: string | string[] }[];
  visibilityPermissionName?: string;
};

describe('student navigation', () => {
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
      'Student Onboarding': studentVisibilityPermissions.onboarding,
      Attendance: studentVisibilityPermissions.attendance,
      Notification: studentVisibilityPermissions.notification,
    });
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
      'Dashboard',
      'CRM',
      'Applications',
      'Settings',
    ]);

    const crm = admissions?.children?.find((item) => item.title === 'CRM');
    expect(crm?.children?.map((item) => item.title)).toEqual(['Inquiries', 'Pipeline']);
    expect(crm?.children?.find((item) => item.title === 'Pipeline')?.path).toBe(
      '/student/admissions/pipeline'
    );
    expect(crm?.children?.every((item) => item.path.startsWith('/student/admissions/'))).toBe(true);

    const applications = admissions?.children?.find((item) => item.title === 'Applications');
    expect(applications?.children?.map((item) => item.title)).toEqual([
      'All Applications',
      'Assessments',
      'Review queue',
    ]);

    const settings = admissions?.children?.find((item) => item.title === 'Settings');
    expect(settings?.children?.map((item) => item.title)).toEqual([
      'Admission Cycles',
      'Admission Offerings',
      'Workflow Builder',
      'Form Builder',
    ]);
  });
});

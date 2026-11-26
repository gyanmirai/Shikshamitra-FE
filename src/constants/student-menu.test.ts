import { it, expect, describe } from 'vitest';
import { hasNavigationPermission } from 'src/utils/permissions';

import studentModule, {
  studentPaths,
  studentPermissions,
  studentVisibilityPermissions,
} from './student-menu';

type NestedMenuItem = {
  title: string;
  path: string;
  permissionName?: string | string[];
  children?: NestedMenuItem[];
  permissionChildren?: { title: string; permissionName?: string | string[] }[];
  visibilityPermissionName?: string;
};

describe('student navigation', () => {
  it('places Birthday and House Management after Student List under existing Records visibility', () => {
    const items = Object.values(studentModule()).flatMap((sections) =>
      sections.flatMap((group) => group.items)
    );
    const records = items.find((item) => item.title === 'Student Records') as NestedMenuItem;
    const birthday = records.children?.find((item) => item.title === 'Birthday');
    const house = records.children?.find((item) => item.title === 'House Management');
    expect(records.children?.slice(0, 3).map((item) => item.title)).toEqual([
      'Student List',
      'Birthday',
      'House Management',
    ]);
    expect(birthday).toMatchObject({
      path: '/student/records/birthdays',
      permissionName: 'Students.Records.Birthdays.View',
    });
    expect(records.permissionName).toContain('Students.Records.Birthdays.View');
    expect(records.permissionName).not.toContain('Students.Records.Birthdays.OfficeScope.View');
    expect(house).toMatchObject({
      path: '/student/records/houses',
      permissionName: 'Students.Records.HouseManagement.View',
    });
    expect(studentPaths.records).toHaveProperty('houseManagement', '/student/records/houses');
    expect(records.permissionName).toContain('Students.Records.HouseManagement.View');
    expect(records.visibilityPermissionName).toBe(studentVisibilityPermissions.records);
    expect(house?.visibilityPermissionName).toBeUndefined();
  });
  it('exposes four Attendance workspaces with existing URLs and permission bundles', () => {
    const items = Object.values(studentModule()).flatMap((sections) =>
      sections.flatMap((group) => group.items)
    );
    const attendance = items.find((item) => item.title === 'Attendance') as NestedMenuItem;
    expect(attendance.path).toBe('/student/attendance/take-attendance');
    expect(attendance.children?.map((item) => item.title)).toEqual([
      'Daily Attendance',
      'Leave Requests',
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
  it('exposes the Student Records submodules and their existing routes', () => {
    const items = Object.values(studentModule()).flatMap((sections) =>
      sections.flatMap((group) => group.items)
    );
    const records = items.find((item) => item.title === 'Student Records') as NestedMenuItem;
    expect(records.children?.map((item) => item.title)).toEqual([
      'Student List',
      'Birthday',
      'House Management',
      'I-Card Assignment',
      'Certificates',
      'Reports',
      'Settings',
    ]);
    expect(records.path).toBe('/student/profile');
    expect(records.children?.map((item) => item.path)).toEqual([
      '/student/profile',
      '/student/records/birthdays',
      '/student/records/houses',
      '/student/student-i-card',
      '/student/certificates',
      '/student/reports',
      '/student/records/settings',
    ]);
    expect(
      records.permissionChildren?.find((item) => item.title === 'Policy Settings')
    ).toMatchObject({
      permissionName: studentPermissions.records.setting,
    });
    expect(studentPermissions.records.root).not.toContain(studentPermissions.records.setting);
  });

  it('opens the Records Settings menu independently for template and house viewers', () => {
    const items = Object.values(studentModule()).flatMap((sections) =>
      sections.flatMap((group) => group.items)
    );
    const records = items.find((item) => item.title === 'Student Records') as NestedMenuItem;
    const settings = records.children?.find((item) => item.title === 'Settings');
    expect(settings?.children?.map(({ title, path }) => [title, path])).toEqual([
      ['I-Card Templates', '/student/records/settings/i-card-templates'],
      ['Create House', '/student/records/settings/create-house'],
    ]);

    const { studentICard, houseManagement, setting, settingsWorkspace } = studentPermissions.records;
    const allowedChildren = (name: string) => {
      const permissions = [{ name, isGranted: true }];
      if (!hasNavigationPermission(permissions, settings?.permissionName)) return [];
      return settings?.children
        ?.filter((item) => hasNavigationPermission(permissions, item.permissionName))
        .map((item) => item.title);
    };
    expect(allowedChildren(studentICard)).toEqual(['I-Card Templates']);
    expect(allowedChildren(houseManagement)).toEqual(['Create House']);
    expect(allowedChildren(setting)).toEqual([]);
    expect(settingsWorkspace).toEqual(expect.arrayContaining([studentICard, houseManagement, setting]));
  });
  it('keeps Dashboard access separate from Dashboard visibility', () => {
    const sections = Object.values(studentModule());
    const items = sections.flatMap((section) => section.flatMap((group) => group.items));
    const dashboard = items.find((item) => item.title === 'Dashboard');

    expect(dashboard?.permissionName).toBe('Students.Dashboard.View');
    expect(dashboard?.visibilityPermissionName).toBe(studentVisibilityPermissions.dashboard);
  });

  it('maps every top-level Student row to a dedicated visibility permission', () => {
    const sections = Object.values(studentModule());
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
    const sections = Object.values(studentModule());
    const items = sections.flatMap((section) => section.flatMap((group) => group.items));
    const onboarding = items.find((item) => item.title === 'Onboarding') as
      NestedMenuItem | undefined;

    expect(onboarding?.path).toBe('/student/onboarding');
    expect(onboarding?.permissionName).toEqual(['Students.Onboarding.View']);
    expect(onboarding?.visibilityPermissionName).toBe('ShikshaMitra.Module.Students.Onboarding');
    expect(onboarding?.children?.map((item) => item.title)).toEqual([
      'Student Setup',
      'Onboarding Settings',
    ]);
    expect(onboarding?.children?.find((item) => item.title === 'Student Setup')).toMatchObject({
      path: '/student/onboarding/setup',
      permissionName: 'Students.Onboarding.View',
    });
    expect(
      onboarding?.children?.find((item) => item.title === 'Onboarding Settings')
    ).toMatchObject({
      path: '/student/onboarding/settings',
      permissionName: 'Students.Onboarding.View',
    });
    expect(
      onboarding?.children?.find((item) => item.title === 'Onboarding Settings')?.children
    ).toBeUndefined();
  });

  it('exposes all notification permission groups in the permission editor', () => {
    const sections = Object.values(studentModule());
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
    const sections = Object.values(studentModule());
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
      'Admission Offering',
      'Public Inquiry Links',
    ]);
    expect(settings?.children?.map((item) => item.path)).toEqual([
      '/student/admissions/settings/cycles',
      '/student/admissions/settings/forms',
      '/student/admissions/settings/workflows',
      '/student/admissions/settings/offerings',
      '/student/admissions/settings/public-inquiry-links',
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

import type { GrantedPermission } from 'src/utils/permissions';
import type {
  StudentModuleDashboardContext,
  StudentModuleDashboardSection,
} from 'src/redux/student/dashboard/student-module-dashboard-types';

import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import auth, { loadUser } from 'src/redux/auth/authSlice';
import globalState, { setCurrentYear } from 'src/redux/globalState/globalSlice';

export const dashboardPermissions: GrantedPermission[] = [
  'Students.Dashboard.View',
  'Students.Records.StudentList.View',
  'Students.Attendance.MarkAttendance.View',
  'Students.Admissions.Inquiries.View',
  'ShikshaMitra.Module.Students.Records',
  'ShikshaMitra.Module.Students.Attendance',
  'ShikshaMitra.Module.Students.Enrollment',
].map((name) => ({ name, isGranted: true }));

export const dashboardContext: StudentModuleDashboardContext = {
  mode: 'teacher',
  displayName: 'Test teacher',
  scopeLabel: 'Your assigned academic scope',
  sections: ['records', 'attendance', 'admissions'],
  myStudents: [],
  links: [
    {
      id: 'directory',
      label: 'Student directory',
      description: 'Find permitted student records.',
      href: '/student/records/directory',
      icon: 'mdi:account-school-outline',
      permission: 'Students.Records.StudentList.View',
      visibilityPermission: 'ShikshaMitra.Module.Students.Records',
    },
  ],
};

export const dashboardSection = (
  key: StudentModuleDashboardSection['key'],
  year = 'year-1',
  value = 111
): StudentModuleDashboardSection => ({
  key,
  academicYearId: year,
  generatedAt: '2026-10-08T05:00:00Z',
  description: 'Selected academic year and assigned scope.',
  metrics: [
    {
      id: key,
      label:
        key === 'records'
          ? 'Active students'
          : key === 'attendance'
            ? 'Draft registers'
            : 'My open inquiries',
      value,
      tone: key === 'attendance' ? 'warning' : 'neutral',
      href:
        key === 'records'
          ? '/student/records/directory?population=Active'
          : key === 'attendance'
            ? '/student/attendance/take-attendance'
            : '/student/admissions/inquiries?owner=__mine__',
      permission:
        key === 'records'
          ? 'Students.Records.StudentList.View'
          : key === 'attendance'
            ? 'Students.Attendance.MarkAttendance.View'
            : 'Students.Admissions.Inquiries.View',
    },
  ],
  classStrength:
    key === 'records'
      ? [
          {
            standardId: 'class-5',
            label: 'Class 5',
            students: value,
            href: '/student/records/directory?population=Active&class=class-5',
          },
        ]
      : [],
});

export function createDashboardStore(permissions = dashboardPermissions) {
  const store = configureStore({
    reducer: { auth, globalState, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  store.dispatch(loadUser.pending('test', {}));
  store.dispatch(
    loadUser.fulfilled(
      {
        user: { sub: 'teacher-1' },
        mainModuleVisibility: [],
        permissionData: permissions,
        sessionContext: {
          accountMode: 'tenant',
          tenantId: 'school-1',
          canViewTenants: false,
          canCreateTenants: false,
          canUpdateTenants: false,
          canManageTenantStatus: false,
        },
      },
      'test',
      {}
    )
  );
  store.dispatch(setCurrentYear({ id: 'year-1', name: '2026–27' }));
  return store;
}

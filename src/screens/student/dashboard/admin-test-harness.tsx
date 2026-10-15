import type { PropsWithChildren } from 'react';
import type {
  StudentDashboardSectionKey,
  StudentDashboardFilterOptions,
  StudentModuleDashboardSection,
} from 'src/redux/student/dashboard/student-module-dashboard-types';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import auth from 'src/redux/auth/authSlice';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { SessionProvider } from 'next-auth/react';
import { vi, afterEach, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, cleanup } from '@testing-library/react';
import globalState from 'src/redux/globalState/globalSlice';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

import StudentDashboard from './index';
import {
  dashboardContext,
  createDashboardStore,
  dashboardPermissions,
} from './dashboard-test-fixture';

const adminNavigation = vi.hoisted(() => ({
  pathname: '/student/dashboard',
  query: '',
  listeners: new Set<() => void>(),
  replace: vi.fn(),
}));
export { adminNavigation };

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('next/navigation', async () => {
  const { useSyncExternalStore } = await import('react');
  return {
    usePathname: () => adminNavigation.pathname,
    useSearchParams: () => {
      const query = useSyncExternalStore(
        (listener) => {
          adminNavigation.listeners.add(listener);
          return () => adminNavigation.listeners.delete(listener);
        },
        () => adminNavigation.query
      );
      return new URLSearchParams(query);
    },
    useRouter: () => ({ replace: adminNavigation.replace, push: adminNavigation.replace }),
  };
});

export function navigateAdmin(query: string) {
  adminNavigation.query = query.replace(/^\?/, '');
  adminNavigation.listeners.forEach((listener) => listener());
}

export const adminPermissions = [
  ...dashboardPermissions,
  ...[
    'Students.Onboarding.View',
    'Students.Records.Changes.View',
    'Students.Admissions.Applications.View',
    'Students.Attendance.LeaveAndAbsent.View',
    'ShikshaMitra.Module.Students.Onboarding',
  ].map((name) => ({ name, isGranted: true })),
];

export const adminContext = {
  ...dashboardContext,
  mode: 'admin' as const,
  displayName: 'School admin',
  links: [
    ...dashboardContext.links,
    {
      id: 'onboarding',
      label: 'Open Onboarding',
      description: 'Complete student setup.',
      href: '/student/onboarding',
      icon: 'mdi:clipboard-account-outline',
      permission: 'Students.Onboarding.View',
      visibilityPermission: 'ShikshaMitra.Module.Students.Onboarding',
    },
    {
      id: 'applications',
      label: 'Open Admissions',
      description: 'Review applications.',
      href: '/student/admissions/applications',
      icon: 'mdi:application-edit-outline',
      permission: 'Students.Admissions.Applications.View',
      visibilityPermission: 'ShikshaMitra.Module.Students.Enrollment',
    },
    {
      id: 'changes',
      label: 'Record changes',
      description: 'Review permitted changes.',
      href: '/student/records/changes',
      icon: 'mdi:account-edit-outline',
      permission: 'Students.Records.Changes.View',
      visibilityPermission: 'ShikshaMitra.Module.Students.Records',
    },
    {
      id: 'attendance',
      label: 'Open Attendance',
      description: 'Complete today’s registers.',
      href: '/student/attendance/take-attendance',
      icon: 'mdi:calendar-check-outline',
      permission: 'Students.Attendance.MarkAttendance.View',
      visibilityPermission: 'ShikshaMitra.Module.Students.Attendance',
    },
  ],
};
export const adminOptions: StudentDashboardFilterOptions = {
  boards: [
    { id: 'board-1', name: 'CBSE' },
    { id: 'board-2', name: 'State Board' },
  ],
  mediums: [
    { id: 'medium-1', name: 'English', parentId: 'board-1' },
    { id: 'medium-2', name: 'Hindi', parentId: 'board-2' },
  ],
  standards: [
    { id: 'class-5', name: 'Class 5', parentId: 'medium-1' },
    { id: 'class-6', name: 'Class 6', parentId: 'medium-2' },
  ],
  divisions: [
    { id: 'division-a', name: 'A', parentId: 'class-5' },
    { id: 'division-b', name: 'B', parentId: 'class-5' },
  ],
};

export const adminSection = (
  key: StudentDashboardSectionKey,
  year = 'year-1',
  value = 111
): StudentModuleDashboardSection => ({
  key,
  academicYearId: year,
  generatedAt: '2026-10-14T05:00:00Z',
  description: 'Selected year and permitted scope.',
  metrics:
    key === 'records'
      ? [
          {
            id: 'active',
            label: 'Active students',
            value,
            tone: 'neutral',
            href: '/student/records/directory?population=Active',
            permission: 'Students.Records.StudentList.View',
          },
        ]
      : key === 'admissions'
        ? [
            {
              id: 'setup',
              label: 'Unfinished onboarding',
              value: value ? 12 : 0,
              tone: 'warning',
              href: '/student/onboarding?dashboardPreset=unfinished',
              permission: 'Students.Onboarding.View',
            },
            {
              id: 'applications',
              label: 'Active applications',
              value: value ? 24 : 0,
              tone: 'neutral',
              href: '/student/admissions/applications',
              permission: 'Students.Admissions.Applications.View',
            },
            {
              id: 'attention',
              label: 'Setup needs attention',
              value: value ? 21 : 0,
              tone: 'warning',
              href: '/student/onboarding?dashboardPreset=attention',
              permission: 'Students.Onboarding.View',
            },
          ]
        : [],
  classStrength:
    key === 'records' && value
      ? [
          {
            standardId: 'class-5',
            label: 'Class 5',
            students: value,
            href: '/student/records/directory?class=class-5',
            divisions: [
              {
                divisionId: 'division-a',
                label: 'A',
                students: 56,
                href: '/student/records/directory?division=division-a',
              },
              {
                divisionId: 'division-b',
                label: 'B',
                students: 55,
                href: '/student/records/directory?division=division-b',
              },
            ],
          },
        ]
      : [],
  classStrengthTotalCount: key === 'records' && value ? 1 : 0,
  attentionItems:
    key === 'admissions' && value
      ? [
          {
            caseId: 'case-1',
            studentId: 'student-1',
            studentName: 'Aarav Shah',
            className: 'Class 5',
            divisionName: 'A',
            blocker: 'GR number missing',
            ownerName: 'Riya Patel',
            dueAt: '2026-10-13T05:00:00Z',
            href: '/student/onboarding/case-1',
          },
        ]
      : [],
  attentionTotalCount: key === 'admissions' && value ? 21 : 0,
  workGroups:
    key === 'records'
      ? [
          {
            id: 'recordApprovals',
            label: 'Record changes awaiting approval',
            value: value ? 3 : 0,
            tone: 'warning',
            href: '/student/records/changes?dashboardPreset=actionable',
            permission: 'Students.Records.Changes.View',
          },
        ]
      : key === 'admissions'
        ? [
            {
              id: 'admissionDecisions',
              label: 'Admission decisions pending',
              value: value ? 4 : 0,
              tone: 'warning',
              href: '/student/admissions/applications?dashboardPreset=decisions',
              permission: 'Students.Admissions.Applications.View',
            },
          ]
        : [],
  onboardingTasks:
    key === 'admissions'
      ? [
          {
            id: 'gr',
            label: 'GR number pending',
            value: value ? 2 : 0,
            tone: 'warning',
            href: '/student/onboarding?dashboardPreset=gr',
            permission: 'Students.Onboarding.View',
          },
        ]
      : [],
  attendanceToday:
    key === 'attendance'
      ? {
          schoolDate: '2026-10-14',
          timeZone: 'Asia/Kolkata',
          availability: value ? 'available' : 'noExpected',
          provisional: false,
          expected: value ? 10 : 0,
          missing: value ? 2 : 0,
          draft: value ? 1 : 0,
          submitted: value ? 7 : 0,
          review: 0,
          href: '/student/attendance/take-attendance?date=2026-10-14&view=pending',
        }
      : null,
});

export const adminRequests: { path: string; query: URLSearchParams }[] = [];
const pendingResponses = new Set<() => void>();
export function deferAdminResponse() {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  const release = () => {
    pendingResponses.delete(release);
    resolve();
  };
  pendingResponses.add(release);
  return { promise, release };
}
function createAdminStore(permissions = adminPermissions) {
  return configureStore({
    reducer: { auth, globalState, confirmPopup, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
    preloadedState: createDashboardStore(permissions).getState(),
  });
}
let store: ReturnType<typeof createAdminStore>;
export const getAdminStore = () => store;
const session = {
  profile: { sub: 'admin-1', tenantid: 'school-1' },
  user: { name: 'School admin' },
  expires: '2099-01-01T00:00:00Z',
};
const theme = createTheme(defaultSettings);

beforeEach(() => {
  adminRequests.length = 0;
  adminNavigation.query = '';
  adminNavigation.replace
    .mockReset()
    .mockImplementation((href: string) => navigateAdmin(new URL(href, 'http://localhost').search));
  clearCachedAuthSession();
  store = createAdminStore(adminPermissions);
  const record = (request: Request) => {
    const url = new URL(request.url);
    adminRequests.push({ path: url.pathname.split('/').pop() ?? '', query: url.searchParams });
  };
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(session)),
    http.get('*/api/students/dashboard/context', ({ request }) => {
      record(request);
      return HttpResponse.json(adminContext);
    }),
    http.get('*/api/students/dashboard/filters', ({ request }) => {
      record(request);
      return HttpResponse.json({ data: adminOptions });
    }),
    http.get('*/api/students/dashboard/sections/:section', ({ params, request }) => {
      record(request);
      return HttpResponse.json({
        data: adminSection(
          String(params.section) as StudentDashboardSectionKey,
          new URL(request.url).searchParams.get('academicYearId') ?? ''
        ),
      });
    })
  );
});

afterEach(async () => {
  pendingResponses.forEach((release) => release());
  cleanup();
  await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

export function mountAdmin(permissions = adminPermissions, query = '') {
  adminNavigation.query = query;
  store = createAdminStore(permissions);
  const Wrapper = ({ children }: PropsWithChildren) => (
    <ThemeProvider theme={theme}>
      <SessionProvider session={session} refetchOnWindowFocus={false}>
        <Provider store={store}>{children}</Provider>
      </SessionProvider>
    </ThemeProvider>
  );
  return render(<StudentDashboard />, { wrapper: Wrapper });
}

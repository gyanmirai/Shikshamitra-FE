import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { vi, afterEach, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, cleanup } from '@testing-library/react';
import globalState from 'src/redux/globalState/globalSlice';
import auth, { setPermissions } from 'src/redux/auth/authSlice';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

import Document from './document';
import { StudentProfileView } from './student-profile-view';
import { StudentProfileDataBoundary } from './student-profile-data-boundary';

const profileNavigation = vi.hoisted(() => ({
  query: '',
  listeners: new Set<() => void>(),
  push: vi.fn((url: string) => {
    profileNavigation.query = new URL(url, 'http://localhost').search;
    profileNavigation.listeners.forEach((listener) => listener());
  }),
}));
export { profileNavigation };
vi.mock('next/navigation', async () => {
  const { useSyncExternalStore } = await import('react');
  return {
    useSearchParams: () =>
      new URLSearchParams(
        useSyncExternalStore(
          (listener) => {
            profileNavigation.listeners.add(listener);
            return () => profileNavigation.listeners.delete(listener);
          },
          () => profileNavigation.query
        )
      ),
    useRouter: () => ({ push: profileNavigation.push }),
    usePathname: () => '/student/profile',
  };
});
vi.mock('next/link', () => ({
  default: ({ href, children, onClick, ...props }: any) => (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !event.ctrlKey && !event.metaKey && event.button === 0) {
          event.preventDefault();
          profileNavigation.push(href);
        }
      }}
    >
      {children}
    </a>
  ),
}));
beforeEach(() => {
  profileNavigation.query = '';
  profileNavigation.push.mockClear();
  mswServer.use(
    http.get(profileDetailsPath, ({ params }) =>
      HttpResponse.json({
        data: {
          studentId: params.studentId,
          recordsAccess: 'Full',
          structuredSections: [],
          registrationSources: [],
          customDetailsMasked: false,
          customDetailsEditable: false,
        },
      })
    )
  );
});

// Decorative icons are outside this data-contract regression; keep the real controls and table.
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('@mui/icons-material', () => {
  const Icon = () => <svg aria-hidden="true" />;
  return Object.fromEntries(
    [
      'Close',
      'Info',
      'Error',
      'CheckCircle',
      'WarningAmber',
      'ArrowUpward',
      'ArrowDownward',
      'Clear',
      'Search',
      'RemoveRedEye',
      'ExpandLess',
      'ExpandMore',
    ].map((name) => [name, Icon])
  );
});

export const profileStudentId = 'ad400001-0000-4000-8000-000000000001';
export const studentProfile: StudentRecordProfile = {
  id: profileStudentId,
  studentId: profileStudentId,
  firstName: 'Aanya',
  middleName: null,
  lastName: 'Patel',
  grNo: 123,
  grNumber: 'GR-2026-00123',
  rollNo: 7,
  standardId: 'ad400002-0000-4000-8000-000000000001',
  standardName: 'Grade 5',
  divisionId: 'ad400003-0000-4000-8000-000000000001',
  divisionName: 'A',
  academicMediumId: 'ad400004-0000-4000-8000-000000000001',
  academicMediumName: 'English',
  status: 6,
  dateOfBirth: '2016-04-01T00:00:00+00:00',
  gender: 1,
};
export const profilePath = '*/api/students/records/:studentId/profile';
export const profileDetailsPath = '*/api/students/records/:studentId/details';
export const profileDocumentsPath =
  '*/api/app/student-document/required-documents-status/:studentId';
export const profileEvidencePath = '*/api/student/records/students/:studentId/admission-evidence';
const sections = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    icon: <span />,
    component: () => <div>Student overview</div>,
  },
  { value: 'documents', label: 'Documents', icon: <span />, component: Document },
];
const createProfileTestStore = () =>
  configureStore({
    reducer: { auth, globalState, confirmPopup, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
const stores: ReturnType<typeof createProfileTestStore>[] = [];
export function renderStudentProfile(
  studentId = profileStudentId,
  permissions = ['Students.Records.StudentList.View', 'Students.Admissions.Documents.View']
) {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  const store = createProfileTestStore();
  stores.push(store);
  store.dispatch(
    setPermissions(
      permissions.map((name) => ({
        name,
        isGranted: true,
      }))
    )
  );
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <StudentProfileDataBoundary studentId={studentId}>
          {(student, refetch) => (
            <StudentProfileView student={student} refetch={refetch} sections={sections} />
          )}
        </StudentProfileDataBoundary>
      </ThemeProvider>
    </Provider>
  );
}
afterEach(() => {
  cleanup();
  stores.splice(0).forEach((store) => store.dispatch(api.util.resetApiState()));
  clearCachedAuthSession();
});

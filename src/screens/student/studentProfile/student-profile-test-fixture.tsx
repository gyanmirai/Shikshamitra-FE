import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';

import { vi, afterEach } from 'vitest';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, cleanup } from '@testing-library/react';
import { setPermissions } from 'src/redux/auth/authSlice';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { defaultSettings } from 'src/components/settings/config-settings';
import { createDocumentTestStore } from 'src/redux/student/admissions/document-test-fixture';

import Document from './document';
import { StudentProfileView } from './student-profile-view';
import { StudentProfileDataBoundary } from './student-profile-data-boundary';

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
  status: 5,
  dateOfBirth: '2016-04-01T00:00:00+00:00',
  gender: 1,
};
export const profilePath = '*/api/students/records/:studentId/profile';
export const profileDocumentsPath =
  '*/api/student/enrollment/registrations/:studentId/documents/required-status';
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
const stores: ReturnType<typeof createDocumentTestStore>[] = [];
export function renderStudentProfile(studentId = profileStudentId) {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  const store = createDocumentTestStore();
  stores.push(store);
  store.dispatch(
    setPermissions(
      ['Students.Records.StudentList.View', 'Students.Admissions.Documents.View'].map((name) => ({
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

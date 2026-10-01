import { it, vi, expect, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { defaultOnboardingSettings } from '../onboarding-settings-model';
import { OnboardingSettingsProvider } from '../onboarding-settings-context';
import { studentOnboardingTestData } from './student-onboarding-test-fixtures';
import StudentOnboardingCaseOperations from './student-onboarding-case-operations';

const consentMocks = vi.hoisted(() => ({
  handoffs: [] as Array<{ id: string; serviceKey: string; status: number; attemptCount: number; lastError?: string }>,
  confirm: vi.fn(),
}));

afterEach(() => {
  consentMocks.handoffs = [];
  consentMocks.confirm.mockReset();
});

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('src/components/customDialog', () => ({
  default: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('src/redux/user/userApi', () => ({
  useGetUsersQuery: () => ({ data: { items: [] }, isFetching: false }),
}));

vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useSetStudentOnboardingRouteMutation: () => [vi.fn(), { isLoading: false }],
  useAssignStudentOnboardingOwnerMutation: () => [vi.fn(), { isLoading: false }],
  useCancelStudentOnboardingMutation: () => [vi.fn(), { isLoading: false }],
  useRetryStudentOnboardingServiceHandoffMutation: () => [vi.fn(), { isLoading: false }],
  useConfirmStudentOnboardingServiceConsentMutation: () => [consentMocks.confirm, { isLoading: false }],
  useGetStudentOnboardingServiceHandoffsQuery: () => ({ data: consentMocks.handoffs, isFetching: false }),
}));

it('records required service consent only after enrollment and keeps its evidence reference', async () => {
  consentMocks.handoffs = [{ id: 'consent-1', serviceKey: 'service-consent', status: 0, attemptCount: 0 }];
  consentMocks.confirm.mockReturnValue({ unwrap: () => Promise.resolve({ status: 6 }) });
  const student = { ...studentOnboardingTestData[0], source: 'onboarding-case' as const,
    studentEnrollmentId: 'enrollment-1', backendStatus: 6 as const, concurrencyStamp: 'case-stamp-1' };
  render(
    <OnboardingSettingsProvider>
      <StudentOnboardingCaseOperations student={student} canManage canCancel={false} onCancelled={vi.fn()} />
    </OnboardingSettingsProvider>
  );

  fireEvent.click(screen.getByRole('button', { name: 'Confirm consent' }));
  expect(screen.getByText(/does not collect consent from the family/)).toBeInTheDocument();
  const reference = screen.getByRole('textbox', { name: 'Consent record reference' });
  fireEvent.change(reference, { target: { value: 'Signed form CONSENT-001' } });
  fireEvent.click(screen.getByRole('button', { name: 'Record confirmation' }));
  await waitFor(() => expect(consentMocks.confirm).toHaveBeenCalledWith({
    id: student.id, concurrencyStamp: 'case-stamp-1', evidenceReference: 'Signed form CONSENT-001',
  }));
});

it('does not offer consent confirmation before enrollment or to a read-only user', () => {
  consentMocks.handoffs = [{ id: 'consent-1', serviceKey: 'service-consent', status: 0, attemptCount: 0 }];
  const student = { ...studentOnboardingTestData[0], source: 'onboarding-case' as const,
    backendStatus: 2 as const, concurrencyStamp: 'case-stamp-1' };
  const { rerender } = render(
    <OnboardingSettingsProvider>
      <StudentOnboardingCaseOperations student={student} canManage canCancel={false} onCancelled={vi.fn()} />
    </OnboardingSettingsProvider>
  );
  expect(screen.queryByRole('button', { name: 'Confirm consent' })).not.toBeInTheDocument();
  rerender(
    <OnboardingSettingsProvider>
      <StudentOnboardingCaseOperations student={{ ...student, studentEnrollmentId: 'enrollment-1', backendStatus: 6 }}
        canManage={false} canCancel={false} onCancelled={vi.fn()} />
    </OnboardingSettingsProvider>
  );
  expect(screen.queryByRole('button', { name: 'Confirm consent' })).not.toBeInTheDocument();
});

it('offers a saved school-defined route in Student Setup', () => {
  const source = defaultOnboardingSettings.onboardingProfiles[0];
  const settings = {
    ...defaultOnboardingSettings,
    onboardingProfiles: [...defaultOnboardingSettings.onboardingProfiles, {
      ...source,
      id: 'scholarship-intake',
      admissionRoutes: ['Scholarship intake'],
    }],
  };

  render(
    <OnboardingSettingsProvider initialSettings={settings}>
      <StudentOnboardingCaseOperations
        student={studentOnboardingTestData[0]}
        canManage
        canCancel={false}
        onCancelled={vi.fn()}
      />
    </OnboardingSettingsProvider>
  );

  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Admission route' }));
  expect(screen.getByRole('option', { name: 'Scholarship intake' })).toBeInTheDocument();
});

it('shows custom routes only for this student’s board and campus while retaining the current route', () => {
  const source = defaultOnboardingSettings.onboardingProfiles[0];
  const settings = {
    ...defaultOnboardingSettings,
    onboardingProfiles: [...defaultOnboardingSettings.onboardingProfiles,
      {
        ...source, id: 'north-scholarship', admissionRoutes: ['Scholarship intake'],
        applicability: { ...source.applicability,
          boardMode: 'selected' as const, boardIds: ['board-cbse'],
          campusMode: 'selected' as const, campusIds: ['campus-north'] },
      },
      {
        ...source, id: 'other-board', admissionRoutes: ['GSEB intake'],
        applicability: { ...source.applicability,
          boardMode: 'selected' as const, boardIds: ['board-gseb'] },
      },
      {
        ...source, id: 'other-campus', admissionRoutes: ['South campus intake'],
        applicability: { ...source.applicability,
          campusMode: 'selected' as const, campusIds: ['campus-south'] },
      },
    ],
  };
  render(
    <OnboardingSettingsProvider initialSettings={settings}>
      <StudentOnboardingCaseOperations
        student={{ ...studentOnboardingTestData[0], campusId: 'campus-north',
          admissionRoute: 'Legacy custom route' }}
        canManage
        canCancel={false}
        onCancelled={vi.fn()}
      />
    </OnboardingSettingsProvider>
  );

  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Admission route' }));
  expect(screen.getByRole('option', { name: 'Scholarship intake' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Legacy custom route' })).toBeInTheDocument();
  expect(screen.queryByRole('option', { name: 'GSEB intake' })).not.toBeInTheDocument();
  expect(screen.queryByRole('option', { name: 'South campus intake' })).not.toBeInTheDocument();
});

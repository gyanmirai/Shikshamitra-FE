import type { StudentPortalAccountOwner } from 'src/redux/student/onboarding/student-onboarding-types';

import { vi, it, expect, beforeEach } from 'vitest';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentOnboardingPortalAccounts from './student-onboarding-portal-accounts';

import type { StudentOnboardingItem } from './student-onboarding-model';

const mocks = vi.hoisted(() => ({
  provision: vi.fn(),
  success: vi.fn(),
  accounts: { data: [] as unknown[], isFetching: false, isError: false },
  handoffs: { data: [{ serviceKey: 'guardian-account' }], isFetching: false, isError: false },
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({
      auth: {
        permissions: ['AbpIdentity.Users.Create', 'AbpIdentity.Users.Update'].map((name) => ({
          name,
          isGranted: true,
        })),
      },
    }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: mocks.success } }));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange, disabled, helperText }: any) => (
    <label htmlFor={`mock-${label.replace(/\s/g, '-')}`}>
      {label}
      <select
        id={`mock-${label.replace(/\s/g, '-')}`}
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && <span>{helperText}</span>}
    </label>
  ),
}));
vi.mock('./student-onboarding-credential-emails', () => ({
  default: () => <div>Credential email status</div>,
}));
vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useGetStudentPortalAccountsQuery: () => mocks.accounts,
  useGetStudentOnboardingServiceHandoffsQuery: () => mocks.handoffs,
  useProvisionStudentPortalAccountMutation: () => [mocks.provision, { isLoading: false }],
}));

const student = {
  id: 'case-1',
  studentId: 'student-1',
  studentName: 'Test Student',
  studentEnrollmentId: 'enrollment-1',
  backendStatus: 3,
  concurrencyStamp: 'current-stamp',
} as StudentOnboardingItem;
const owners: StudentPortalAccountOwner[] = [
  {
    accountType: 'guardian',
    relationship: 'father',
    name: 'Test Father',
    email: 'father@example.test',
  },
  { accountType: 'guardian', relationship: 'mother', name: 'Test Mother', email: null },
  {
    accountType: 'guardian',
    relationship: 'guardian',
    name: 'Other Guardian',
    email: 'other@example.test',
  },
];
const panel = (props = {}) =>
  render(
    <ThemeProvider theme={createTheme()}>
      <StudentOnboardingPortalAccounts
        student={student}
        canManage
        profileOwners={owners}
        {...props}
      />
    </ThemeProvider>
  );
const chooseFather = () =>
  fireEvent.change(screen.getByRole('combobox', { name: 'Relationship' }), {
    target: { value: 'father' },
  });
const verifyOwner = () =>
  fireEvent.click(screen.getByRole('checkbox', { name: /I verified this person/ }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.provision.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  mocks.accounts.isFetching = false;
  mocks.accounts.isError = false;
});

it('requires an explicit relationship and sends the Father profile instead of defaulting to Other guardian', async () => {
  panel();
  expect(screen.getByRole('combobox', { name: 'Relationship' })).toHaveValue('');
  expect(screen.getByRole('button', { name: 'Create and link account' })).toBeDisabled();
  chooseFather();
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: 'Profile email' })).toHaveValue(
      'father@example.test'
    )
  );
  expect(screen.getByRole('textbox', { name: 'Profile email' })).toHaveAttribute('readonly');
  verifyOwner();
  fireEvent.click(screen.getByRole('button', { name: 'Create and link account' }));
  await waitFor(() =>
    expect(mocks.provision).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'case-1',
        relationship: 'father',
        accountType: 'guardian',
        email: 'father@example.test',
        concurrencyStamp: 'current-stamp',
        relationshipVerified: true,
      })
    )
  );
});

it('keeps other guardian separate and requires renewed ownership confirmation after selection changes', async () => {
  panel();
  chooseFather();
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: 'Profile email' })).toHaveValue(
      'father@example.test'
    )
  );
  verifyOwner();
  fireEvent.change(screen.getByRole('combobox', { name: 'Relationship' }), {
    target: { value: 'guardian' },
  });
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: 'Profile email' })).toHaveValue('other@example.test')
  );
  expect(screen.getByRole('checkbox', { name: /I verified this person/ })).not.toBeChecked();
});

it('blocks a missing saved email and gives a profile correction and refresh path', async () => {
  const refresh = vi.fn();
  panel({ onRefreshProfiles: refresh });
  fireEvent.change(screen.getByRole('combobox', { name: 'Relationship' }), {
    target: { value: 'mother' },
  });
  await waitFor(() => expect(screen.getByText(/No email is saved for this person/)).toBeVisible());
  expect(screen.getByRole('button', { name: 'Create and link account' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh saved profile' }));
  expect(refresh).toHaveBeenCalledOnce();
  expect(mocks.provision).not.toHaveBeenCalled();
});

it('displays the actual supplied RFC error Reason and preserves the failed form', async () => {
  mocks.provision.mockReturnValue({
    unwrap: () =>
      Promise.reject(
        Object.assign(new Error('Request rejected'), {
          status: 400,
          data: {
            detail: 'One or more business rules were violated.',
            errorCode: 'Students.Onboarding.PortalAccountInvalid',
            data: {
              Reason:
                "The email must match the selected person's saved profile. Correct and verify the profile first.",
            },
          },
        })
      ),
  });
  panel();
  chooseFather();
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: 'Profile email' })).toHaveValue(
      'father@example.test'
    )
  );
  verifyOwner();
  fireEvent.click(screen.getByRole('button', { name: 'Create and link account' }));
  await waitFor(() =>
    expect(
      screen.getByText(/The email must match the selected person's saved profile/)
    ).toBeVisible()
  );
  expect(screen.queryByText('One or more business rules were violated.')).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Relationship' })).toHaveValue('father');
  expect(screen.getByRole('textbox', { name: 'Profile email' })).toHaveValue('father@example.test');
  expect(mocks.success).not.toHaveBeenCalled();
});

it('locks account creation during profile loading/failure and preserves management permission', () => {
  const view = panel({ profilesLoading: true });
  expect(screen.getByRole('combobox', { name: 'Relationship' })).toBeDisabled();
  view.unmount();
  const failed = panel({ profilesError: true });
  expect(screen.getByText('Saved account-owner profiles could not be loaded.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Create and link account' })).toBeDisabled();
  failed.unmount();
  panel({ canManage: false });
  expect(screen.getByRole('button', { name: 'Create and link account' })).toBeDisabled();
});

it('supports an older API without owner fields while still requiring an explicit relationship', async () => {
  panel({ profileOwners: undefined });
  expect(screen.getByRole('combobox', { name: 'Relationship' })).toHaveValue('');
  chooseFather();
  fireEvent.change(screen.getByRole('textbox', { name: 'Profile email' }), {
    target: { value: 'father@example.test' },
  });
  verifyOwner();
  fireEvent.click(screen.getByRole('button', { name: 'Create and link account' }));
  await waitFor(() =>
    expect(mocks.provision).toHaveBeenCalledWith(
      expect.objectContaining({ relationship: 'father', email: 'father@example.test' })
    )
  );
});

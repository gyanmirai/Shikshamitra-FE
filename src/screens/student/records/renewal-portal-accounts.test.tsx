import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import RenewalPortalAccounts from './renewal-portal-accounts';

const mocks = vi.hoisted(() => ({
  permissions: [] as any[],
  query: {} as any,
  provision: vi.fn(),
  options: vi.fn(),
  dirty: vi.fn(),
  busy: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ auth: { permissions: mocks.permissions } }),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ title, children }: any) => <section aria-label={title}>{children}</section>,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange, disabled }: any) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Choose a person</option>
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('src/redux/student/records/student-record-transitions-api', () => ({
  useGetStudentRecordRenewalPortalOptionsQuery: (...args: any[]) => {
    mocks.options(...args);
    return mocks.query;
  },
  useProvisionStudentRecordRenewalPortalMutation: () => [mocks.provision, { isLoading: false }],
}));
const renewal = {
  id: 'renewal-1',
  studentId: 'student-1',
  status: 'Provisioning',
  concurrencyStamp: 'renewal-stamp-1',
} as any;
const requiredGrants = [
  'Students.Records.Transitions.Create',
  'Students.Onboarding.Add',
  'AbpIdentity.Users.Create',
];
const renderForm = (value = renewal) =>
  render(
    <RenewalPortalAccounts renewal={value} onDirtyChange={mocks.dirty} onBusyChange={mocks.busy} />
  );
const chooseStudent = () =>
  fireEvent.change(screen.getByLabelText('Account owner'), { target: { value: 'student:self' } });
const confirmOwner = () =>
  fireEvent.click(screen.getByRole('checkbox', { name: /verified this person/ }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissions = requiredGrants.map((name) => ({ name, isGranted: true }));
  mocks.query = {
    currentData: {
      studentRequired: true,
      guardianRequired: true,
      canProvision: true,
      studentEmail: 'student@school.test',
      guardians: [{ relationship: 'mother', name: 'Meera Shah', email: 'meera@school.test' }],
      accounts: [],
    },
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  };
  mocks.provision.mockImplementation(() => ({
    unwrap: () => Promise.resolve({ accountType: 'student' }),
  }));
});

it('requires every exact owner grant even when the server advertises provisioning', () => {
  mocks.permissions = requiredGrants
    .filter((name) => name !== 'Students.Onboarding.Add')
    .map((name) => ({ name, isGranted: true }));
  mocks.permissions.push({ name: 'Students.Onboarding', isGranted: true });
  renderForm();
  expect(screen.queryByRole('button', { name: 'Create and link account' })).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent(
    'authorized onboarding and identity administrator'
  );
});

it('respects the current server provisioning gate', () => {
  mocks.query.currentData.canProvision = false;
  renderForm();
  expect(screen.queryByRole('button', { name: 'Create and link account' })).not.toBeInTheDocument();
});

it('does not request portal status or offer creation before enrollment activation', () => {
  renderForm({ ...renewal, status: 'PendingChecklist' });
  expect(mocks.options).toHaveBeenCalledWith('renewal-1', expect.objectContaining({ skip: true }));
  expect(screen.getByText(/Activate this renewal before/)).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Create and link account' })).not.toBeInTheDocument();
});

it('requires explicit ownership verification and submits only the recorded person and renewal stamp', async () => {
  renderForm();
  chooseStudent();
  expect(screen.getByLabelText('Saved profile email')).toHaveValue('student@school.test');
  expect(screen.getByLabelText('Saved profile email')).toHaveAttribute('readonly');
  fireEvent.click(screen.getByRole('button', { name: 'Create and link account' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Confirm the person');
  expect(mocks.provision).not.toHaveBeenCalled();
  confirmOwner();
  fireEvent.click(screen.getByRole('button', { name: 'Create and link account' }));
  await waitFor(() => expect(mocks.provision).toHaveBeenCalledOnce());
  expect(mocks.provision).toHaveBeenCalledWith({
    id: 'renewal-1',
    accountType: 'student',
    relationship: 'self',
    email: 'student@school.test',
    relationshipVerified: true,
    linkExistingGuardian: false,
    concurrencyStamp: 'renewal-stamp-1',
  });
});

it('allows explicit sibling guardian reuse only with the identity update grant', async () => {
  mocks.permissions.push({ name: 'AbpIdentity.Users.Update', isGranted: true });
  renderForm();
  fireEvent.change(screen.getByLabelText('Account owner'), {
    target: { value: 'guardian:mother' },
  });
  confirmOwner();
  fireEvent.click(screen.getByRole('checkbox', { name: /verified existing guardian/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Create and link account' }));
  await waitFor(() => expect(mocks.provision).toHaveBeenCalledOnce());
  expect(mocks.provision.mock.calls[0][0]).toMatchObject({
    accountType: 'guardian',
    relationship: 'mother',
    email: 'meera@school.test',
    linkExistingGuardian: true,
  });
});

it('preserves the selected person after a stale renewal rejection', async () => {
  mocks.provision.mockImplementation(() => ({
    unwrap: () =>
      Promise.reject(
        Object.assign(new Error('Stale renewal'), {
          data: { error: { code: 'Students:Records:ConcurrencyConflict' } },
        })
      ),
  }));
  renderForm();
  chooseStudent();
  confirmOwner();
  fireEvent.click(screen.getByRole('button', { name: 'Create and link account' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('This renewal changed');
  expect(screen.getByLabelText('Account owner')).toHaveValue('student:self');
  expect(screen.getByLabelText('Saved profile email')).toHaveValue('student@school.test');
  expect(screen.getByRole('checkbox', { name: /verified this person/ })).toBeChecked();
});

it('blocks stale mailbox verification when the saved email changes during review', async () => {
  const view = renderForm();
  chooseStudent();
  confirmOwner();
  mocks.query = {
    ...mocks.query,
    currentData: { ...mocks.query.currentData, studentEmail: 'corrected@school.test' },
  };
  view.rerender(
    <RenewalPortalAccounts
      renewal={renewal}
      onDirtyChange={mocks.dirty}
      onBusyChange={mocks.busy}
    />
  );
  expect(screen.getByRole('button', { name: 'Create and link account' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Review updated person' }));
  await waitFor(() =>
    expect(screen.getByLabelText('Saved profile email')).toHaveValue('corrected@school.test')
  );
  expect(screen.getByRole('checkbox', { name: /verified this person/ })).not.toBeChecked();
  expect(mocks.provision).not.toHaveBeenCalled();
});

it('hides cached person details when the protected options request fails', () => {
  mocks.query.isError = true;
  renderForm();
  expect(screen.queryByLabelText('Saved profile email')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Retry portal status' })).toBeVisible();
});

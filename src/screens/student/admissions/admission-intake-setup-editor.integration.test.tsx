import type { IntakeCounsellorChoice } from 'src/redux/student/admissions/admission-intake-profiles-api';

import userEvent from '@testing-library/user-event';
import { vi, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { AdmissionIntakeSetupEditor } from './admission-intake-setup-editor';

const hooks = vi.hoisted(() => ({
  lookup: {
    data: [] as IntakeCounsellorChoice[],
    isLoading: false,
    isFetching: false,
    isError: false,
  },
  query: vi.fn(),
  refetch: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  close: vi.fn(),
}));

vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/redux/student/admissions/admission-intake-profiles-api', () => ({
  useGetAdmissionIntakeCounsellorsQuery: (...args: unknown[]) => {
    hooks.query(...args);
    return { ...hooks.lookup, refetch: hooks.refetch };
  },
  useGetAdmissionIntakeSetupUsageQuery: () => ({ isLoading: false, isError: false }),
  useCreateAdmissionIntakeSetupMutation: () => [hooks.create, { isLoading: false }],
  useUpdateAdmissionIntakeSetupMutation: () => [hooks.update, { isLoading: false }],
}));

const counsellors = [
  { id: 'counsellor-1', name: 'Admissions Counselor', userName: 'counsellor' },
  { id: 'manager-1', name: 'Admissions Manager', userName: 'manager' },
];
const editor = () => (
  <ThemeProvider theme={createTheme(defaultSettings)}>
    <AdmissionIntakeSetupEditor setup={null} onClose={hooks.close} />
  </ThemeProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  hooks.lookup = { data: counsellors, isLoading: false, isFetching: false, isError: false };
  hooks.create.mockImplementation((input) => ({
    unwrap: async () => ({ ...input, id: 'setup-1' }),
  }));
});

it('shows the simplified inquiry controls and saves API-selected pool and fallback values', async () => {
  const user = userEvent.setup();
  render(editor());
  expect(
    screen.queryByRole('combobox', {
      name: /Duplicate inquiry|Before application starts|Sources needing details/,
    })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole('checkbox', { name: /Require guardian email|Require applicant birth date/ })
  ).not.toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: 'Allowed sources' })).toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox', { name: 'Setup name *' }), {
    target: { value: 'General intake' },
  });
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('combobox', { name: 'Counsellor pool *' }));
  await user.click(screen.getByRole('option', { name: 'Admissions Counselor' }));
  await user.click(screen.getByRole('combobox', { name: 'Fallback manager *' }));
  await user.click(screen.getByRole('option', { name: 'Admissions Manager' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Create setup' }));
  await waitFor(() =>
    expect(hooks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'General intake',
        inquiryRules: expect.objectContaining({
          duplicateRule: 1,
          applicationStartRequirement: 0,
          requireSourceDetailFor: [],
          requireGuardianEmail: false,
          requireApplicantDateOfBirth: false,
        }),
        counsellorAssignmentRules: {
          counsellorUserIds: ['counsellor-1'],
          fallbackManagerUserId: 'manager-1',
          maxActiveCasesPerCounsellor: 100,
        },
      })
    )
  );
}, 15000);

it('recovers both routing fields after a failed lookup without losing inquiry values', async () => {
  const user = userEvent.setup();
  hooks.lookup = { data: [], isLoading: false, isFetching: false, isError: true };
  const view = render(editor());
  expect(hooks.query).toHaveBeenCalledWith(undefined, { refetchOnMountOrArgChange: true });
  fireEvent.change(screen.getByRole('textbox', { name: 'Setup name *' }), {
    target: { value: 'Preserved draft' },
  });
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByRole('combobox', { name: 'Counsellor pool *' })).toBeDisabled();
  expect(screen.getByRole('combobox', { name: 'Fallback manager *' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  await user.click(screen.getByRole('button', { name: 'Retry' }));
  expect(hooks.refetch).toHaveBeenCalledOnce();
  hooks.lookup = { data: counsellors, isLoading: false, isFetching: false, isError: false };
  view.rerender(editor());
  expect(screen.queryByText('Unable to load eligible counsellors.')).not.toBeInTheDocument();
  await user.click(screen.getByRole('combobox', { name: 'Counsellor pool *' }));
  expect(screen.getByRole('option', { name: 'Admissions Counselor' })).toBeInTheDocument();
  await user.click(screen.getByRole('option', { name: 'Admissions Counselor' }));
  await user.click(screen.getByRole('combobox', { name: 'Fallback manager *' }));
  expect(screen.getByRole('option', { name: 'Admissions Manager' })).toBeInTheDocument();
  await user.click(screen.getByRole('option', { name: 'Admissions Manager' }));
  await user.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByRole('textbox', { name: 'Setup name *' })).toHaveValue('Preserved draft');
}, 15000);

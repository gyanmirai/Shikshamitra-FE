import type {
  AdmissionIntakeSetup,
  IntakeCounsellorChoice,
} from 'src/redux/student/admissions/admission-intake-profiles-api';

import userEvent from '@testing-library/user-event';
import { vi, it, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import {
  AdmissionIntakeSetupEditor,
  getInitialAdmissionIntakeSetupValues,
} from './admission-intake-setup-editor';

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
  info: vi.fn(),
}));

vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn(), info: hooks.info },
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
const editor = (setup: AdmissionIntakeSetup | null = null) => (
  <ThemeProvider theme={createTheme(defaultSettings)}>
    <AdmissionIntakeSetupEditor setup={setup} onClose={hooks.close} />
  </ThemeProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  hooks.lookup = { data: counsellors, isLoading: false, isFetching: false, isError: false };
  hooks.create.mockImplementation((input) => ({
    unwrap: async () => ({ ...input, id: 'setup-1' }),
  }));
  hooks.update.mockImplementation(({ body }) => ({
    unwrap: async () => ({ ...body, id: 'setup-1' }),
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
  expect(hooks.info).toHaveBeenCalledOnce();
  expect(screen.queryByText(/New inquiries go to the eligible counsellor/)).not.toBeInTheDocument();
  await user.click(screen.getByRole('combobox', { name: 'Counsellor pool *' }));
  await user.click(screen.getByRole('option', { name: 'Admissions Counselor' }));
  await user.keyboard('{Escape}');
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

it('keeps source and pool checkbox menus open for multiple selections and reviews saved values', async () => {
  const user = userEvent.setup();
  render(editor());
  expect(screen.getByRole('dialog', { name: 'Create Admission Intake Setup' })).toBeVisible();
  fireEvent.change(screen.getByRole('textbox', { name: 'Setup name *' }), {
    target: { value: 'Multiple sources' },
  });
  await user.click(screen.getByRole('combobox', { name: 'Allowed sources' }));
  await user.click(screen.getByRole('option', { name: 'Website' }));
  expect(
    within(screen.getByRole('option', { name: 'Website' })).getByRole('checkbox')
  ).toBeChecked();
  await user.click(screen.getByRole('option', { name: 'QR code' }));
  expect(
    within(screen.getByRole('option', { name: 'QR code' })).getByRole('checkbox')
  ).toBeChecked();
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('combobox', { name: 'Counsellor pool *' }));
  await user.click(screen.getByRole('option', { name: 'Admissions Counselor' }));
  await user.click(screen.getByRole('option', { name: 'Admissions Manager' }));
  expect(
    within(screen.getByRole('option', { name: 'Admissions Counselor' })).getByRole('checkbox')
  ).toBeChecked();
  expect(
    within(screen.getByRole('option', { name: 'Admissions Manager' })).getByRole('checkbox')
  ).toBeChecked();
  await user.keyboard('{Escape}');
  expect(screen.getByText('Admissions Counselor').closest('.MuiChip-root')).toHaveClass(
    'MuiChip-colorDefault'
  );
  await user.click(screen.getByRole('combobox', { name: 'Fallback manager *' }));
  await user.click(screen.getByRole('option', { name: 'Admissions Manager' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByText('Website')).toBeInTheDocument();
  expect(screen.getByText('QR code')).toBeInTheDocument();
  expect(screen.getByText('Admissions Counselor')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Edit inquiry handling' }));
  expect(screen.getByRole('textbox', { name: 'Setup name *' })).toHaveValue('Multiple sources');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(hooks.info).toHaveBeenCalledOnce();
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Create setup' }));
  await waitFor(() =>
    expect(hooks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        inquiryRules: expect.objectContaining({ allowedSources: [0, 10] }),
        counsellorAssignmentRules: expect.objectContaining({
          counsellorUserIds: ['counsellor-1', 'manager-1'],
        }),
      })
    )
  );
  expect(hooks.close).toHaveBeenCalledOnce();
}, 15000);

it('reviews edits with an update label and retains the concurrency stamp', async () => {
  const user = userEvent.setup();
  const values = getInitialAdmissionIntakeSetupValues(null);
  const setup = {
    ...values,
    id: 'setup-1',
    name: 'Saved setup',
    concurrencyStamp: 'stamp-1',
    activeOfferingCount: 0,
    activePublicInquiryLinkCount: 0,
    counsellorAssignmentRules: {
      ...values.counsellorAssignmentRules,
      counsellorUserIds: ['counsellor-1'],
      fallbackManagerUserId: 'manager-1',
    },
  } as AdmissionIntakeSetup;
  render(editor(setup));
  expect(screen.getByRole('button', { name: 'Step 3: Review & update' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Edit counsellor routing' }));
  expect(screen.getByRole('combobox', { name: 'Counsellor pool *' })).toHaveTextContent(
    'Admissions Counselor'
  );
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('button', { name: 'Update setup' }));
  await waitFor(() =>
    expect(hooks.update).toHaveBeenCalledWith({
      id: 'setup-1',
      body: expect.objectContaining({ concurrencyStamp: 'stamp-1' }),
    })
  );
  expect(hooks.create).not.toHaveBeenCalled();
}, 15000);

it('preserves a drawer draft when discarding is cancelled', async () => {
  const user = userEvent.setup();
  render(editor());
  fireEvent.change(screen.getByRole('textbox', { name: 'Setup name *' }), {
    target: { value: 'Keep draft' },
  });
  await user.click(screen.getByRole('button', { name: 'Close admission intake setup editor' }));
  expect(screen.getByRole('dialog', { name: 'Discard setup changes?' })).toHaveTextContent(
    'Discard setup changes?'
  );
  await user.click(
    within(screen.getByRole('dialog', { name: 'Discard setup changes?' })).getByRole('button', {
      name: 'Cancel',
    })
  );
  expect(screen.getByRole('textbox', { name: 'Setup name *' })).toHaveValue('Keep draft');
  expect(hooks.close).not.toHaveBeenCalled();
});

it('recovers both routing fields after a failed lookup without losing inquiry values', async () => {
  const user = userEvent.setup();
  hooks.lookup = { data: [], isLoading: false, isFetching: false, isError: true };
  const view = render(editor());
  expect(hooks.query).toHaveBeenCalledWith(
    { counsellorOnly: true },
    { refetchOnMountOrArgChange: true }
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'Setup name *' }), {
    target: { value: 'Preserved draft' },
  });
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByRole('combobox', { name: 'Counsellor pool *' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
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
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('combobox', { name: 'Fallback manager *' }));
  expect(screen.getByRole('option', { name: 'Admissions Manager' })).toBeInTheDocument();
  await user.click(screen.getByRole('option', { name: 'Admissions Manager' }));
  await user.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByRole('textbox', { name: 'Setup name *' })).toHaveValue('Preserved draft');
}, 15000);

it('uses safe Escape dismissal for a dirty drawer and retains its draft', async () => {
  const user = userEvent.setup();
  render(editor());
  fireEvent.change(screen.getByRole('textbox', { name: 'Setup name *' }), {
    target: { value: 'Escape draft' },
  });
  await user.keyboard('{Escape}');
  expect(screen.getByRole('dialog', { name: 'Discard setup changes?' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByRole('textbox', { name: 'Setup name *' })).toHaveValue('Escape draft');
  expect(hooks.close).not.toHaveBeenCalled();
});

import type { AdmissionIntakeSetup } from 'src/redux/student/admissions/admission-intake-profiles-api';

import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { AdmissionPublicInquiryLinks } from './admission-public-inquiry-links';

const hooks = vi.hoisted(() => ({
  setups: {
    data: [] as AdmissionIntakeSetup[] | undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  },
  create: vi.fn(),
  close: vi.fn(),
  setupQuery: vi.fn(),
}));

vi.mock('src/redux/student/admissions/admission-intake-profiles-api', () => ({
  useGetAdmissionIntakeSetupsQuery: (...args: unknown[]) => {
    hooks.setupQuery(...args);
    return hooks.setups;
  },
  useGetAdmissionPublicInquiryLinksQuery: () => ({ data: [], isLoading: false }),
  useCreateAdmissionPublicInquiryLinkMutation: () => [hooks.create, { isLoading: false }],
  useRevokeAdmissionPublicInquiryLinkMutation: () => [vi.fn(), { isLoading: false }],
  useSetAdmissionPublicInquiryLinkFormMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/redux/student/admissions/admission-cycles-api', () => ({
  useGetAdmissionCyclesQuery: () => ({
    data: { items: [{ id: 'cycle-1', name: 'Regular admission', status: 1 }] },
    isLoading: false,
  }),
}));
vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useGetAdmissionFormsQuery: () => ({
    data: { items: [{ id: 'form-1', name: 'Inquiry form', version: 1, status: 1, purpose: 0 }] },
    isLoading: false,
  }),
}));
vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));
vi.mock('src/components/customizabaleTable', () => ({ default: () => null }));
vi.mock('src/components/customDialog', () => ({
  default: () => null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('src/components/adaptive-three-dots-actions', () => ({ default: () => null }));
vi.mock('src/screens/hr/employee/employee-form-fields/InformationFields', () => ({
  SectionCard: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section aria-label={title}>{children}</section>
  ),
}));
vi.mock('@mui/x-date-pickers', () => ({ DateTimePicker: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));

const activeSetup = {
  id: 'setup-1',
  name: 'School intake',
  counsellorAssignmentProfileId: 'routing-profile-1',
  isArchived: false,
} as AdmissionIntakeSetup;

const renderDrawer = (initialSetupId?: string) =>
  render(
    <AdmissionPublicInquiryLinks
      canEdit
      createOpen
      onCreateClose={hooks.close}
      initialSetupId={initialSetupId}
    />
  );

const fillLink = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByRole('textbox', { name: 'Link name' }), 'School fair');
  await user.click(screen.getByRole('combobox', { name: 'Admission period' }));
  await user.click(screen.getByRole('option', { name: 'Regular admission' }));
  await user.click(screen.getByRole('combobox', { name: 'Published inquiry form' }));
  await user.click(screen.getByRole('option', { name: 'Inquiry form · v1' }));
  await user.click(screen.getByRole('combobox', { name: /Admission intake setup/ }));
  await user.click(screen.getByRole('option', { name: 'School intake' }));
};

describe('create public inquiry link', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hooks.setups.data = [];
    hooks.setups.isLoading = false;
    hooks.setups.isFetching = false;
    hooks.setups.isError = false;
    hooks.create.mockReturnValue({ unwrap: () => Promise.resolve({ token: 'fixture-token' }) });
  });

  it('requests fresh setup options each time the drawer opens', () => {
    const { rerender } = render(
      <AdmissionPublicInquiryLinks canEdit createOpen={false} onCreateClose={hooks.close} />
    );
    expect(hooks.setupQuery).toHaveBeenLastCalledWith(undefined, {
      skip: true,
      refetchOnMountOrArgChange: true,
    });
    rerender(<AdmissionPublicInquiryLinks canEdit createOpen onCreateClose={hooks.close} />);
    expect(hooks.setupQuery).toHaveBeenLastCalledWith(undefined, {
      skip: false,
      refetchOnMountOrArgChange: true,
    });
  });

  it('can refresh an empty list without losing entered details', async () => {
    const user = userEvent.setup();
    const { rerender } = renderDrawer();
    await user.type(screen.getByRole('textbox', { name: 'Link name' }), 'School fair');
    await user.click(screen.getByRole('button', { name: 'Dismiss information message' }));
    await user.click(screen.getByRole('button', { name: 'Refresh setups' }));
    expect(hooks.setups.refetch).toHaveBeenCalledOnce();

    hooks.setups.isFetching = true;
    rerender(<AdmissionPublicInquiryLinks canEdit createOpen onCreateClose={hooks.close} />);
    expect(screen.getByText('Loading intake setups…')).toBeVisible();
    expect(screen.queryByText('No active intake setups')).not.toBeInTheDocument();

    hooks.setups.isFetching = false;
    hooks.setups.data = [activeSetup];
    rerender(<AdmissionPublicInquiryLinks canEdit createOpen onCreateClose={hooks.close} />);
    expect(screen.getByRole('combobox', { name: /Admission intake setup/ })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
    await user.click(screen.getByRole('combobox', { name: /Admission intake setup/ }));
    await user.click(screen.getByRole('option', { name: 'School intake' }));
    expect(screen.getByRole('textbox', { name: 'Link name' })).toHaveValue('School fair');
  });

  it('explains the missing prerequisite instead of opening an empty setup menu', () => {
    renderDrawer();

    expect(screen.getByRole('combobox', { name: /Admission intake setup/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByText('No active intake setups')).toBeVisible();
    expect(screen.getByText(/Create one in the Admission intake setups tab/)).toBeVisible();
    expect(hooks.create).not.toHaveBeenCalled();
  });

  it('does not describe a loading query as missing configuration', () => {
    hooks.setups.data = undefined;
    hooks.setups.isLoading = true;
    renderDrawer();

    expect(screen.getByText('Loading intake setups…')).toBeVisible();
    expect(screen.getByRole('combobox', { name: /Admission intake setup/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(
      screen.queryByText(/Create one in the Admission intake setups tab/)
    ).not.toBeInTheDocument();
  });

  it('keeps failed queries distinct from empty results and allows retry', async () => {
    hooks.setups.isError = true;
    renderDrawer();

    expect(screen.getByText('Unable to load intake setups')).toBeVisible();
    expect(screen.getByText('Unable to load routing options.')).toBeVisible();
    expect(
      screen.queryByText(/Create one in the Admission intake setups tab/)
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(hooks.setups.refetch).toHaveBeenCalledOnce();
  });

  it('selects a saved setup and submits its routing profile without changing the API payload', async () => {
    hooks.setups.data = [activeSetup];
    renderDrawer();
    const user = userEvent.setup();

    await fillLink(user);
    await user.click(screen.getByRole('button', { name: 'Create link' }));

    await waitFor(() =>
      expect(hooks.create).toHaveBeenCalledWith({
        admissionCycleId: 'cycle-1',
        counsellorAssignmentProfileId: 'routing-profile-1',
        inquiryFormDefinitionId: 'form-1',
        name: 'School fair',
        source: 0,
        sourceDetail: null,
        expiresAtUtc: null,
      })
    );
    expect(hooks.close).toHaveBeenCalledOnce();
  });

  it('explains counsellor eligibility failures and preserves the form for correction', async () => {
    hooks.setups.data = [activeSetup];
    hooks.create.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        status: 400,
        data: {
          errorCode: 'Admissions.InquiryCounsellorInvalid',
          detail: 'One or more business rules were violated.',
        },
      }),
    });
    renderDrawer();
    const user = userEvent.setup();
    await fillLink(user);
    await user.click(screen.getByRole('button', { name: 'Create link' }));

    expect(
      await screen.findByText(/Activate\/configure the offering or choose another period/)
    ).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Link name' })).toHaveValue('School fair');
    expect(screen.getByRole('combobox', { name: /Admission intake setup/ })).toHaveTextContent(
      'School intake'
    );
    expect(hooks.close).not.toHaveBeenCalled();
  });

  it('preserves unrelated server errors', async () => {
    hooks.setups.data = [activeSetup];
    hooks.create.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        status: 400,
        data: { detail: 'The inquiry form was archived.' },
      }),
    });
    renderDrawer();
    const user = userEvent.setup();
    await fillLink(user);
    await user.click(screen.getByRole('button', { name: 'Create link' }));

    expect(await screen.findByText('The inquiry form was archived.')).toBeVisible();
    expect(hooks.close).not.toHaveBeenCalled();
  });

  it('retains setup preselection when opening from a setup row', async () => {
    hooks.setups.data = [activeSetup];
    renderDrawer(activeSetup.id);

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: /Admission intake setup/ })).toHaveTextContent(
        'School intake'
      )
    );
  });

  it('uses the blue heading tooltip and removes hints without removing validation', async () => {
    renderDrawer();
    const user = userEvent.setup();
    const info = screen.getByRole('button', { name: 'Create inquiry link information' });
    expect(info).toHaveClass('MuiIconButton-colorInfo');
    expect(screen.queryByText('For example, September school fair')).not.toBeInTheDocument();
    expect(screen.queryByText(/This exact form will appear/)).not.toBeInTheDocument();
    expect(screen.queryByText(/New inquiries enter/)).not.toBeInTheDocument();
    expect(screen.queryByText(/This link uses the setup/)).not.toBeInTheDocument();

    await user.hover(info);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Share a link for a website, QR code, or event.'
    );
    await user.click(screen.getByRole('button', { name: 'Create link' }));
    expect(await screen.findByText('Enter a link name.')).toBeVisible();
    expect(screen.getByText('Choose an admission intake setup.')).toBeVisible();
    expect(hooks.create).not.toHaveBeenCalled();
  });
});

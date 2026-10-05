import type { ReactNode, ComponentProps } from 'react';
import type CustomizableTable from 'src/components/customizabaleTable';
import type {
  AdmissionIntakeSetup,
  AdmissionPublicInquiryLink,
} from 'src/redux/student/admissions/admission-intake-profiles-api';

import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

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
  links: [] as AdmissionPublicInquiryLink[],
  revoke: vi.fn(),
  setForm: vi.fn(),
  revokeLoading: false,
  formLoading: false,
}));

vi.mock('src/redux/student/admissions/admission-intake-profiles-api', () => ({
  useGetAdmissionIntakeSetupsQuery: (...args: unknown[]) => {
    hooks.setupQuery(...args);
    return hooks.setups;
  },
  useGetAdmissionPublicInquiryLinksQuery: () => ({ data: hooks.links, isLoading: false }),
  useCreateAdmissionPublicInquiryLinkMutation: () => [hooks.create, { isLoading: false }],
  useRevokeAdmissionPublicInquiryLinkMutation: () => [
    hooks.revoke,
    { isLoading: hooks.revokeLoading },
  ],
  useSetAdmissionPublicInquiryLinkFormMutation: () => [
    hooks.setForm,
    { isLoading: hooks.formLoading },
  ],
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
vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    data,
    columns,
    handleRowClick,
    rowProps,
  }: ComponentProps<typeof CustomizableTable>) => (
    <table aria-label="Public admission inquiry links">
      <tbody>
        {data.map((row, index) => {
          const { sx: _sx, ...props } = rowProps?.(row, index) ?? {};
          return (
            <tr key={String(row.id)} {...props} onClick={() => handleRowClick?.(row, index)}>
              {columns.map((column) => (
                <td key={column.id}>
                  {column.render
                    ? column.render(row[column.id], row)
                    : String(row[column.id] ?? '')}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  ),
}));
vi.mock('src/components/customDialog', () => ({
  default: ({
    open,
    title,
    children,
    handleClose,
  }: {
    open: boolean;
    title: string;
    children: ReactNode;
    handleClose: () => void;
  }) =>
    open ? (
      <div role="dialog" aria-label={title}>
        <button type="button" aria-label="Close dialog" onClick={handleClose} />
        {children}
      </div>
    ) : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => children,
}));
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
    hooks.links = [];
    hooks.formLoading = false;
    hooks.revokeLoading = false;
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

  it.each([
    [
      'Admissions.PublicInquiry.OfferingRequired',
      'RTE has no active offering that accepts inquiries.',
    ],
    [
      'Admissions.PublicInquiry.CounsellorUnavailable',
      'Review the counsellor pool and academic access.',
    ],
    [
      'Admissions.PublicInquiry.FallbackUnavailable',
      'Choose an active fallback manager with access.',
    ],
    ['Admissions.PublicInquiry.ExpiryInvalid', 'Choose a future link expiry or leave it blank.'],
  ])(
    'shows the server reason for %s and allows retry without losing values',
    async (errorCode, detail) => {
      hooks.setups.data = [activeSetup];
      hooks.create.mockReturnValueOnce({
        unwrap: vi.fn().mockRejectedValue({ status: 400, data: { errorCode, detail } }),
      });
      renderDrawer();
      const user = userEvent.setup();
      await fillLink(user);
      await user.click(screen.getByRole('button', { name: 'Create link' }));

      expect(await screen.findByText(detail)).toBeVisible();
      expect(screen.getByRole('textbox', { name: 'Link name' })).toHaveValue('School fair');
      expect(screen.getByRole('combobox', { name: /Admission intake setup/ })).toHaveTextContent(
        'School intake'
      );
      expect(hooks.close).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Create link' }));
      await waitFor(() => expect(hooks.close).toHaveBeenCalledOnce());
      expect(hooks.create).toHaveBeenCalledTimes(2);
      expect(screen.queryByText(detail)).not.toBeInTheDocument();
    }
  );

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

const activeLink: AdmissionPublicInquiryLink = {
  id: 'link-1',
  name: 'School website',
  admissionCycleId: 'cycle-1',
  counsellorAssignmentProfileId: 'routing-1',
  inquiryFormDefinitionId: 'form-1',
  source: 0,
  sourceDetail: 'School campaign',
  expiresAtUtc: null,
  isActive: true,
  concurrencyStamp: 'stamp-1',
};
const renderList = (canEdit = true) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionPublicInquiryLinks
        canEdit={canEdit}
        createOpen={false}
        onCreateClose={hooks.close}
      />
    </ThemeProvider>
  );

describe('public inquiry link details and actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hooks.links = [activeLink];
    hooks.formLoading = false;
    hooks.revokeLoading = false;
  });

  it('groups all existing facts into shared cards with a status label and Close icon', async () => {
    const user = userEvent.setup();
    renderList();
    await user.click(screen.getByRole('cell', { name: activeLink.name }));
    const dialog = screen.getByRole('dialog', { name: `Inquiry link: ${activeLink.name}` });
    expect(dialog.querySelectorAll('section.MuiCard-root')).toHaveLength(2);
    expect(within(dialog).getByRole('heading', { name: 'Link details' })).toBeVisible();
    expect(within(dialog).getByRole('heading', { name: 'Routing' })).toBeVisible();
    expect(within(dialog).getByText('Website · School campaign')).toBeVisible();
    expect(within(dialog).getByText('No expiry')).toBeVisible();
    expect(within(dialog).getByText('Regular admission')).toBeVisible();
    expect(within(dialog).getByText('Inquiry form', { selector: 'dd' })).toBeVisible();
    expect(within(dialog).getByText('Active')).toBeVisible();
    expect(
      within(dialog).getByRole('button', { name: 'Close' }).querySelector('[data-icon="mdi:close"]')
    ).not.toBeNull();
    const info = within(dialog).getByRole('button', { name: 'Link details information' });
    expect(info).toHaveClass('MuiIconButton-colorInfo');
    await user.hover(info);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Review this link’s source');
    await user.click(within(dialog).getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each(['Enter', ' '])('retains keyboard details access using %s', (key) => {
    renderList();
    fireEvent.keyDown(screen.getByRole('row', { name: /School website/ }), { key });
    expect(screen.getByRole('dialog', { name: `Inquiry link: ${activeLink.name}` })).toBeVisible();
  });

  it('opens the existing form editor without triggering row details or submitting', async () => {
    const user = userEvent.setup();
    renderList();
    await user.click(
      screen.getByRole('button', { name: `Set inquiry form for ${activeLink.name}` })
    );
    expect(screen.getByRole('dialog', { name: 'Set inquiry form' })).toBeVisible();
    expect(
      screen.queryByRole('dialog', { name: `Inquiry link: ${activeLink.name}` })
    ).not.toBeInTheDocument();
    expect(hooks.setForm).not.toHaveBeenCalled();
    expect(hooks.revoke).not.toHaveBeenCalled();
  });

  it('preserves action loading guards', () => {
    hooks.formLoading = true;
    hooks.revokeLoading = true;
    renderList();
    expect(screen.getByTestId('table-action-form')).toBeDisabled();
    expect(screen.getByTestId('table-action-revoke')).toBeDisabled();
  });

  it('keeps revoked links viewable while hiding unavailable actions', async () => {
    hooks.links = [{ ...activeLink, isActive: false }];
    const user = userEvent.setup();
    renderList();
    expect(screen.queryByTestId('table-action-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('table-action-revoke')).not.toBeInTheDocument();
    await user.click(screen.getByRole('cell', { name: activeLink.name }));
    expect(within(screen.getByRole('dialog')).getByText('Revoked')).toBeVisible();
  });

  it('preserves read-only access without mutation actions', () => {
    renderList(false);
    expect(screen.queryByTestId('table-action-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('table-action-revoke')).not.toBeInTheDocument();
  });

  it('uses a row-labelled mobile menu with concise actions', async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    try {
      const user = userEvent.setup();
      renderList();
      await user.click(screen.getByRole('button', { name: `More actions for ${activeLink.name}` }));
      const menu = screen.getByRole('menu', { name: `More actions for ${activeLink.name}` });
      expect(within(menu).getByRole('menuitem', { name: 'Set inquiry form' })).toBeVisible();
      expect(within(menu).getByRole('menuitem', { name: 'Revoke link' })).toBeVisible();
      await user.click(within(menu).getByRole('menuitem', { name: 'Set inquiry form' }));
      expect(screen.getByRole('dialog', { name: 'Set inquiry form' })).toBeVisible();
      expect(hooks.setForm).not.toHaveBeenCalled();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});

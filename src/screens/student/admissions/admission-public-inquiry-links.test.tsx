import type { ReactNode, ComponentProps } from 'react';
import type CustomizableTable from 'src/components/customizabaleTable';
import type {
  AdmissionIntakeSetup,
  AdmissionPublicInquiryLink,
  AdmissionPublicInquiryLinkOption,
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
  infoToast: vi.fn(),
  successToast: vi.fn(),
  errorToast: vi.fn(),
  close: vi.fn(),
  setupQuery: vi.fn(),
  optionsQuery: vi.fn(),
  tableProps: vi.fn(),
  options: {
    currentData: [] as AdmissionPublicInquiryLinkOption[] | undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  },
  links: [] as AdmissionPublicInquiryLink[] | undefined,
  linksError: false,
  linksRefetch: vi.fn(),
  revoke: vi.fn(),
  setForm: vi.fn(),
  revokeLoading: false,
  formLoading: false,
  forms: {
    data: { items: [{ id: 'form-1', name: 'Inquiry form', version: 1, status: 1, purpose: 0 }] },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  },
}));

vi.mock('src/redux/student/admissions/admission-intake-profiles-api', () => ({
  useGetAdmissionIntakeSetupsQuery: (...args: unknown[]) => {
    hooks.setupQuery(...args);
    return hooks.setups;
  },
  useGetAdmissionPublicInquiryLinksQuery: () => ({
    data: hooks.links,
    isLoading: false,
    isError: hooks.linksError,
    refetch: hooks.linksRefetch,
  }),
  useGetAdmissionPublicInquiryLinkOptionsQuery: (...args: unknown[]) => {
    hooks.optionsQuery(...args);
    return hooks.options;
  },
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
  useGetAdmissionFormsQuery: () => hooks.forms,
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
    ...tableProps
  }: ComponentProps<typeof CustomizableTable>) => {
    hooks.tableProps({ ...tableProps, data });
    return (
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
    );
  },
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
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    success: hooks.successToast,
    info: hooks.infoToast,
    error: hooks.errorToast,
  },
}));

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
    hooks.linksError = false;
    hooks.options.currentData = [
      { counsellorAssignmentProfileId: 'routing-profile-1', inquiryFormDefinitionId: 'form-1' },
    ];
    hooks.options.isLoading = false;
    hooks.options.isFetching = false;
    hooks.options.isError = false;
    hooks.formLoading = false;
    hooks.forms.isLoading = false;
    hooks.forms.isFetching = false;
    hooks.forms.isError = false;
    hooks.revokeLoading = false;
    hooks.create.mockReturnValue({
      unwrap: () => Promise.resolve({ ...activeLink, name: 'School fair', token: 'fixture-token' }),
    });
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

  it('loads compatible pairs for the selected period and clears routing when the period changes', async () => {
    hooks.setups.data = [activeSetup];
    renderDrawer();
    const user = userEvent.setup();
    await fillLink(user);
    expect(hooks.optionsQuery).toHaveBeenLastCalledWith('cycle-1', {
      skip: false,
      refetchOnMountOrArgChange: true,
    });
    await user.click(screen.getByRole('combobox', { name: 'Admission period' }));
    await user.click(screen.getByRole('option', { name: 'Choose period' }));
    expect(screen.getByRole('combobox', { name: /Admission intake setup/ })).not.toHaveTextContent(
      'School intake'
    );
    expect(screen.getByRole('combobox', { name: 'Published inquiry form' })).not.toHaveTextContent(
      'Inquiry form · v1'
    );
    expect(screen.getByRole('textbox', { name: 'Link name' })).toHaveValue('School fair');
    expect(hooks.create).not.toHaveBeenCalled();
  });

  it('excludes setups without a matching Offering and prevents creation when no compatible pairs exist', async () => {
    hooks.setups.data = [
      activeSetup,
      {
        ...activeSetup,
        id: 'setup-2',
        name: 'Unlinked setup',
        counsellorAssignmentProfileId: 'routing-profile-2',
      },
    ];
    const { rerender } = renderDrawer();
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox', { name: 'Admission period' }));
    await user.click(screen.getByRole('option', { name: 'Regular admission' }));
    await user.click(screen.getByRole('combobox', { name: /Admission intake setup/ }));
    expect(screen.getByRole('option', { name: 'School intake' })).toBeVisible();
    expect(screen.queryByRole('option', { name: 'Unlinked setup' })).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    hooks.options.currentData = [];
    rerender(<AdmissionPublicInquiryLinks canEdit createOpen onCreateClose={hooks.close} />);
    expect(
      screen.queryByText(/No compatible inquiry Offering is available/)
    ).not.toBeInTheDocument();
    expect(hooks.infoToast).not.toHaveBeenCalled();
    await user.click(screen.getByRole('combobox', { name: 'Published inquiry form' }));
    expect(hooks.infoToast).toHaveBeenCalledWith({
      message:
        'First create or attach a published Inquiry form to an active Admission Offering with Inquiry or Both entry mode in this period.',
    });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create link' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Refresh offerings' }));
    expect(hooks.options.refetch).toHaveBeenCalledOnce();
    expect(hooks.create).not.toHaveBeenCalled();
  });

  it('supports keyboard prerequisite feedback and opens options after offerings are refreshed', async () => {
    hooks.options.currentData = [];
    const { rerender } = renderDrawer();
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: 'Link name' }), 'School fair');
    await user.click(screen.getByRole('combobox', { name: 'Admission period' }));
    await user.click(screen.getByRole('option', { name: 'Regular admission' }));
    const form = screen.getByRole('combobox', { name: 'Published inquiry form' });
    form.focus();
    await user.keyboard('{ArrowDown}');
    expect(hooks.infoToast).toHaveBeenCalledOnce();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Refresh offerings' }));
    expect(hooks.options.refetch).toHaveBeenCalledOnce();
    hooks.options.currentData = [
      { counsellorAssignmentProfileId: null, inquiryFormDefinitionId: 'form-1' },
    ];
    rerender(<AdmissionPublicInquiryLinks canEdit createOpen onCreateClose={hooks.close} />);
    await user.click(screen.getByRole('combobox', { name: 'Published inquiry form' }));
    await user.click(screen.getByRole('option', { name: 'Inquiry form · v1' }));
    expect(hooks.infoToast).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', { name: 'Link name' })).toHaveValue('School fair');
    expect(screen.getByRole('button', { name: 'Create link' })).toBeEnabled();
    expect(hooks.create).not.toHaveBeenCalled();
  });

  it('blocks stale options while loading another period and allows routing-query retry', async () => {
    hooks.setups.data = [activeSetup];
    hooks.options.currentData = undefined;
    hooks.options.isFetching = true;
    const { rerender } = renderDrawer();
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: 'Link name' }), 'School fair');
    await user.click(screen.getByRole('combobox', { name: 'Admission period' }));
    await user.click(screen.getByRole('option', { name: 'Regular admission' }));
    expect(screen.getByRole('status', { name: 'Loading published inquiry forms' })).toBeVisible();
    expect(
      screen.queryByRole('combobox', { name: 'Published inquiry form' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create link' })).toBeDisabled();
    expect(
      screen.queryByText(/No compatible inquiry Offering is available/)
    ).not.toBeInTheDocument();
    hooks.options.isFetching = false;
    hooks.options.isError = true;
    rerender(<AdmissionPublicInquiryLinks canEdit createOpen onCreateClose={hooks.close} />);
    expect(
      screen.queryByRole('status', { name: 'Loading published inquiry forms' })
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(hooks.options.refetch).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', { name: 'Link name' })).toHaveValue('School fair');
    expect(hooks.create).not.toHaveBeenCalled();
  });

  it.each(['isLoading', 'isFetching'] as const)(
    'shows a skeleton while published forms are %s and restores selections after loading',
    async (loadingState) => {
      hooks.setups.data = [activeSetup];
      const { rerender } = renderDrawer();
      const user = userEvent.setup();
      await fillLink(user);
      hooks.forms[loadingState] = true;
      rerender(<AdmissionPublicInquiryLinks canEdit createOpen onCreateClose={hooks.close} />);
      expect(screen.getByRole('status', { name: 'Loading published inquiry forms' })).toBeVisible();
      expect(
        screen.queryByRole('combobox', { name: 'Published inquiry form' })
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create link' })).toBeDisabled();
      expect(screen.getByRole('textbox', { name: 'Link name' })).toHaveValue('School fair');
      hooks.forms[loadingState] = false;
      rerender(<AdmissionPublicInquiryLinks canEdit createOpen onCreateClose={hooks.close} />);
      expect(
        screen.queryByRole('status', { name: 'Loading published inquiry forms' })
      ).not.toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'Published inquiry form' })).toHaveTextContent(
        'Inquiry form · v1'
      );
      expect(screen.getByRole('combobox', { name: /Admission intake setup/ })).toHaveTextContent(
        'School intake'
      );
      expect(screen.getByRole('button', { name: 'Create link' })).toBeEnabled();
      expect(hooks.create).not.toHaveBeenCalled();
    }
  );

  it('removes the form skeleton on failure and offers retry without an empty prerequisite message', async () => {
    hooks.forms.isLoading = true;
    const { rerender } = renderDrawer();
    expect(screen.getByRole('status', { name: 'Loading published inquiry forms' })).toBeVisible();
    hooks.forms.isLoading = false;
    hooks.forms.isError = true;
    rerender(<AdmissionPublicInquiryLinks canEdit createOpen onCreateClose={hooks.close} />);
    expect(
      screen.queryByRole('status', { name: 'Loading published inquiry forms' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Unable to load routing options.')).toBeVisible();
    expect(
      screen.queryByText('Publish an Inquiry form before creating a link.')
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(hooks.forms.refetch).toHaveBeenCalledOnce();
  });

  it('explains the reported generic OfferingRequired response and refreshes compatibility', async () => {
    hooks.setups.data = [activeSetup];
    hooks.create.mockReturnValueOnce({
      unwrap: vi.fn().mockRejectedValue({
        status: 400,
        data: {
          errorCode: 'Admissions.PublicInquiry.OfferingRequired',
          detail: 'One or more business rules were violated.',
        },
      }),
    });
    renderDrawer();
    const user = userEvent.setup();
    await fillLink(user);
    await user.click(screen.getByRole('button', { name: 'Create link' }));
    expect(await screen.findByText(/Attach both to the same Offering, activate it/)).toBeVisible();
    expect(hooks.options.refetch).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', { name: 'Link name' })).toHaveValue('School fair');
    expect(hooks.close).not.toHaveBeenCalled();
  });

  it('can retry optional setup lookup without losing entered details', async () => {
    hooks.setups.isError = true;
    const user = userEvent.setup();
    const { rerender } = renderDrawer();
    await user.type(screen.getByRole('textbox', { name: 'Link name' }), 'School fair');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(hooks.setups.refetch).toHaveBeenCalledOnce();

    hooks.setups.isFetching = true;
    hooks.setups.isError = false;
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

  it('allows manual assignment when no optional setup exists', () => {
    renderDrawer();

    expect(screen.getByRole('combobox', { name: /Admission intake setup/ })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByText('No setup — manual assignment')).toBeVisible();
    expect(screen.queryByText(/Inquiries from this link stay Unassigned/)).not.toBeInTheDocument();
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

  it('keeps the newly created address in its row action before the refreshed list arrives', async () => {
    hooks.setups.data = [activeSetup];
    hooks.links = [{ ...activeLink, id: 'older-link', name: 'Existing link' }];
    const user = userEvent.setup();
    const clipboard = vi.spyOn(navigator.clipboard, 'writeText');
    const { rerender, unmount } = renderDrawer();
    await fillLink(user);
    await user.click(screen.getByRole('button', { name: 'Create link' }));
    await waitFor(() => expect(hooks.close).toHaveBeenCalledOnce());
    rerender(
      <AdmissionPublicInquiryLinks canEdit createOpen={false} onCreateClose={hooks.close} />
    );

    const createdRow = await screen.findByRole('row', { name: /School fair/ });
    expect(hooks.tableProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 0,
        searchTerm: '',
        filters: [],
        sorts: [],
        data: [
          expect.objectContaining({ id: activeLink.id }),
          expect.objectContaining({ id: 'older-link' }),
        ],
      })
    );
    expect(hooks.tableProps.mock.lastCall?.[0].data[0]).not.toHaveProperty('token');
    const copy = within(createdRow).getByRole('button', {
      name: 'Copy inquiry link for School fair',
    });
    expect(copy).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Copy inquiry link for Existing link' })
    ).toBeDisabled();
    expect(screen.queryByText(/Copy this link now/)).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'New inquiry link' })).not.toBeInTheDocument();
    await user.click(copy);
    expect(clipboard).toHaveBeenCalledWith(
      `${window.location.origin}/admission-inquiry/fixture-token`
    );
    expect(hooks.successToast).toHaveBeenCalledWith({ message: 'Inquiry link copied.' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    hooks.links = [{ ...activeLink, name: 'School fair' }];
    rerender(
      <AdmissionPublicInquiryLinks canEdit createOpen={false} onCreateClose={hooks.close} />
    );
    expect(screen.getAllByRole('row', { name: /School fair/ })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Copy inquiry link for School fair' })).toBeEnabled();
    unmount();
    renderList();
    expect(
      screen.getByRole('button', { name: 'Copy inquiry link for School fair' })
    ).toBeDisabled();
  });

  it('keeps a newly created row copyable when the initial list request failed', async () => {
    hooks.setups.data = [activeSetup];
    hooks.links = undefined;
    hooks.linksError = true;
    const user = userEvent.setup();
    const clipboard = vi.spyOn(navigator.clipboard, 'writeText');
    const { rerender } = renderDrawer();
    await fillLink(user);
    await user.click(screen.getByRole('button', { name: 'Create link' }));
    await waitFor(() => expect(hooks.close).toHaveBeenCalledOnce());
    rerender(
      <AdmissionPublicInquiryLinks canEdit createOpen={false} onCreateClose={hooks.close} />
    );

    const copy = await screen.findByRole('button', { name: 'Copy inquiry link for School fair' });
    expect(screen.getByText('Unable to load inquiry links.')).toBeVisible();
    expect(copy).toBeEnabled();
    await user.click(copy);
    expect(clipboard).toHaveBeenCalledWith(
      `${window.location.origin}/admission-inquiry/fixture-token`
    );
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(hooks.linksRefetch).toHaveBeenCalledOnce();
    expect(copy).toBeEnabled();
  });

  it('keeps row copy retryable after a clipboard failure', async () => {
    hooks.setups.data = [activeSetup];
    const user = userEvent.setup();
    const clipboard = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(new Error('denied'));
    const { rerender } = renderDrawer();
    await fillLink(user);
    await user.click(screen.getByRole('button', { name: 'Create link' }));
    await waitFor(() => expect(hooks.close).toHaveBeenCalledOnce());
    rerender(
      <AdmissionPublicInquiryLinks canEdit createOpen={false} onCreateClose={hooks.close} />
    );

    const copy = await screen.findByRole('button', { name: 'Copy inquiry link for School fair' });
    await user.click(copy);
    expect(hooks.errorToast).toHaveBeenCalledWith({
      message: 'Unable to copy the link. Allow clipboard access and try again.',
    });
    expect(copy).toBeEnabled();
    await user.click(copy);
    expect(clipboard).toHaveBeenCalledTimes(2);
    expect(hooks.successToast).toHaveBeenCalledWith({ message: 'Inquiry link copied.' });
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
    expect(screen.getByRole('dialog', { name: 'Create Inquiry Link' })).toBeVisible();
    const user = userEvent.setup();
    const info = screen.getByRole('button', { name: 'Create inquiry link information' });
    expect(info).toHaveClass('MuiIconButton-colorInfo');
    expect(screen.queryByText('For example, September school fair')).not.toBeInTheDocument();
    expect(screen.queryByText(/This exact form will appear/)).not.toBeInTheDocument();
    expect(screen.queryByText(/New inquiries enter/)).not.toBeInTheDocument();
    expect(screen.queryByText(/This link uses the setup/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Forms linked to active Inquiry or Both Offerings/)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Inquiries are automatically routed/)).not.toBeInTheDocument();

    await user.hover(info);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Share a link for a website, QR code, or event.'
    );
    await user.click(screen.getByRole('button', { name: 'Create link' }));
    expect(await screen.findByText('Enter a link name.')).toBeVisible();
    expect(screen.getByText('Choose a published admission period.')).toBeVisible();
    expect(screen.queryByText('Choose an admission intake setup.')).not.toBeInTheDocument();
    expect(hooks.create).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    'creates a manual-routing link without any setup even when optional setup lookup fails: %s',
    async (setupError) => {
      hooks.setups.isError = setupError;
      hooks.options.currentData = [
        { counsellorAssignmentProfileId: null, inquiryFormDefinitionId: 'form-1' },
      ];
      renderDrawer();
      const user = userEvent.setup();
      await user.type(screen.getByRole('textbox', { name: 'Link name' }), 'Manual inquiry link');
      await user.click(screen.getByRole('combobox', { name: 'Admission period' }));
      await user.click(screen.getByRole('option', { name: 'Regular admission' }));
      await user.click(screen.getByRole('combobox', { name: 'Published inquiry form' }));
      await user.click(screen.getByRole('option', { name: 'Inquiry form · v1' }));
      expect(
        screen.queryByText(/Inquiries from this link stay Unassigned/)
      ).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Create link' }));
      await waitFor(() =>
        expect(hooks.create).toHaveBeenCalledWith(
          expect.objectContaining({
            admissionCycleId: 'cycle-1',
            counsellorAssignmentProfileId: null,
            inquiryFormDefinitionId: 'form-1',
            name: 'Manual inquiry link',
          })
        )
      );
      expect(hooks.close).toHaveBeenCalledOnce();
    }
  );

  it('blocks a manual link when its form has no compatible manual-routing option', async () => {
    renderDrawer();
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox', { name: 'Link name' }), 'Manual inquiry link');
    await user.click(screen.getByRole('combobox', { name: 'Admission period' }));
    await user.click(screen.getByRole('option', { name: 'Regular admission' }));
    await user.click(screen.getByRole('combobox', { name: 'Published inquiry form' }));
    await user.click(screen.getByRole('option', { name: 'Inquiry form · v1' }));
    await user.click(screen.getByRole('button', { name: 'Create link' }));
    expect(
      await screen.findByText(/Choose an inquiry form linked to an active Inquiry or Both Offering/)
    ).toBeVisible();
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
    hooks.linksError = false;
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

  it('preserves action loading guards', async () => {
    hooks.formLoading = true;
    hooks.revokeLoading = true;
    renderList();
    expect(screen.getByTestId('table-action-form')).toBeDisabled();
    await userEvent.click(
      screen.getByRole('button', { name: `More actions for ${activeLink.name}` })
    );
    expect(screen.getByTestId('menu-action-revoke')).toHaveAttribute('aria-disabled', 'true');
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

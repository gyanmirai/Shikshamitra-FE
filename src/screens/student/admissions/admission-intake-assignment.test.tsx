import type { ReactNode, ComponentProps } from 'react';
import type CustomizableTable from 'src/components/customizabaleTable';
import type {
  AdmissionIntakeSetup,
  AdmissionIntakeSetupUsage,
} from 'src/redux/student/admissions/admission-intake-profiles-api';

import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import AdmissionIntakeAssignmentScreen from './admission-intake-assignment';

const renderScreen = () =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionIntakeAssignmentScreen />
    </ThemeProvider>
  );

const hooks = vi.hoisted(() => ({
  canEdit: true,
  setups: [] as AdmissionIntakeSetup[],
  usage: {
    data: undefined as AdmissionIntakeSetupUsage | undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
  push: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({ auth: { permissions: [], user: { sub: 'admin' } } }),
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: hooks.push }) }));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => hooks.canEdit }));
vi.mock('src/redux/student/admissions/admission-intake-profiles-api', () => ({
  useGetAdmissionIntakeSetupsQuery: () => ({
    data: hooks.setups,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useGetAdmissionIntakeSetupUsageQuery: () => hooks.usage,
  useLazyGetAdmissionIntakeSetupUsageQuery: () => [vi.fn(), { isFetching: false }],
  useArchiveAdmissionIntakeSetupMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));
vi.mock('src/components/custom-tabs', () => ({
  CustomTabs: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, action }: { heading: string; action: ReactNode }) => (
    <header>
      <h1>{heading}</h1>
      {action}
    </header>
  ),
}));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('./admission-public-inquiry-links', () => ({ AdmissionPublicInquiryLinks: () => null }));
vi.mock('./admission-intake-notice', () => ({
  AdmissionIntakeNotice: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('./admission-intake-setup-editor', () => ({
  AdmissionIntakeSetupEditor: ({
    setup,
    onClose,
  }: {
    setup: AdmissionIntakeSetup | null;
    onClose: () => void;
  }) => (
    <section aria-label={`Editing ${setup?.name ?? 'new setup'}`}>
      <button type="button" onClick={onClose}>
        Close editor
      </button>
    </section>
  ),
}));
// Keep the real shared action menu and section cards; simplify only the table infrastructure.
vi.mock('src/components/customizabaleTable', () => ({
  default: ({
    data,
    columns,
    handleRowClick,
    rowProps,
  }: ComponentProps<typeof CustomizableTable>) => (
    <table aria-label="Admission intake setups table">
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

const activeSetup: AdmissionIntakeSetup = {
  id: 'setup-1',
  name: 'General Admission',
  inquiryIntakeProfileId: 'inquiry-1',
  counsellorAssignmentProfileId: 'routing-1',
  concurrencyStamp: 'stamp-1',
  isArchived: false,
  isConfigurationValid: true,
  activeOfferingCount: 0,
  activePublicInquiryLinkCount: 0,
  inquiryRules: {
    duplicateRule: 1,
    applicationStartRequirement: 0,
    firstContactDueInHours: 24,
    qualificationDueInDays: 7,
    followUpDueInDays: 3,
    maxOpenFollowUps: 3,
    requireGuardianEmail: false,
    requireApplicantDateOfBirth: false,
    allowedSources: [],
    requireSourceDetailFor: [],
  },
  counsellorAssignmentRules: {
    counsellorUserIds: ['counsellor-1'],
    maxActiveCasesPerCounsellor: 100,
    fallbackManagerUserId: 'manager-1',
  },
};
const archivedSetup = { ...activeSetup, id: 'setup-2', name: 'Archived intake', isArchived: true };
const emptyUsage: AdmissionIntakeSetupUsage = {
  setupId: activeSetup.id,
  offerings: [],
  publicInquiryLinks: [],
  activeOfferingCount: 0,
  activePublicInquiryLinkCount: 0,
  hasActiveUsage: false,
};
const rowFor = (name: string) => screen.getByRole('row', { name: new RegExp(name) });

describe('intake setup details and row actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hooks.canEdit = true;
    hooks.setups = [activeSetup, archivedSetup];
    hooks.usage.data = emptyUsage;
    hooks.usage.isLoading = false;
    hooks.usage.isError = false;
  });

  it('removes eye actions while retaining editable actions and archived row access', async () => {
    const user = userEvent.setup();
    renderScreen();
    expect(screen.queryByTestId('table-action-view')).not.toBeInTheDocument();
    expect(within(rowFor(activeSetup.name)).getByTestId('table-action-edit')).toBeVisible();
    expect(within(rowFor(archivedSetup.name)).queryByRole('button')).not.toBeInTheDocument();
    await user.click(within(rowFor(archivedSetup.name)).getByText(archivedSetup.name));
    const drawer = screen.getByRole('dialog', { name: archivedSetup.name });
    expect(within(drawer).getByRole('heading', { name: 'Inquiry handling' })).toBeVisible();
    expect(within(drawer).queryByRole('button', { name: 'Edit setup' })).not.toBeInTheDocument();
  });

  it('uses three shared cards and preserves summaries, zero usage, and footer actions', async () => {
    const user = userEvent.setup();
    renderScreen();
    await user.click(within(rowFor(activeSetup.name)).getByText(activeSetup.name));
    const drawer = screen.getByRole('dialog', { name: activeSetup.name });
    expect(drawer.querySelectorAll('section.MuiCard-root')).toHaveLength(3);
    expect(within(drawer).getByText('Contact 24h · Qualify 7d · Follow-up 3d')).toBeVisible();
    expect(within(drawer).getByText('1 counsellor · 100 cases each')).toBeVisible();
    expect(within(drawer).getByText('0 Admission Offerings · 0 active')).toBeVisible();
    expect(within(drawer).getByText('0 public inquiry links · 0 active')).toBeVisible();
    expect(
      within(drawer)
        .getByRole('button', { name: /^Close$/ })
        .querySelector('[data-icon="mdi:close"]')
    ).not.toBeNull();
    expect(
      within(drawer)
        .getByRole('button', { name: 'Edit setup' })
        .querySelector('[data-icon="solar:pen-bold"]')
    ).not.toBeNull();
    await user.click(within(drawer).getByRole('button', { name: 'Edit setup' }));
    expect(screen.getByRole('region', { name: `Editing ${activeSetup.name}` })).toBeVisible();
    expect(screen.queryByRole('dialog', { name: activeSetup.name })).not.toBeInTheDocument();
  });

  it.each(['Enter', ' '])('retains keyboard row opening with %s and Close', async (key) => {
    const user = userEvent.setup();
    renderScreen();
    fireEvent.keyDown(rowFor(activeSetup.name), { key });
    await user.click(screen.getByRole('button', { name: /^Close$/ }));
    expect(screen.queryByRole('dialog', { name: activeSetup.name })).not.toBeInTheDocument();
  });

  it('retains read-only access without exposing edit actions', async () => {
    hooks.canEdit = false;
    const user = userEvent.setup();
    renderScreen();
    expect(within(rowFor(activeSetup.name)).queryByRole('button')).not.toBeInTheDocument();
    await user.click(within(rowFor(activeSetup.name)).getByText(activeSetup.name));
    expect(screen.queryByRole('button', { name: 'Edit setup' })).not.toBeInTheDocument();
  });

  it('keeps loading and retry states inside the usage card', async () => {
    hooks.usage.data = undefined;
    hooks.usage.isLoading = true;
    const user = userEvent.setup();
    const { rerender } = renderScreen();
    await user.click(within(rowFor(activeSetup.name)).getByText(activeSetup.name));
    expect(screen.getByText('Loading usage…')).toBeVisible();
    hooks.usage.isLoading = false;
    hooks.usage.isError = true;
    rerender(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionIntakeAssignmentScreen />
      </ThemeProvider>
    );
    expect(screen.getByText('Unable to load setup usage.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(hooks.usage.refetch).toHaveBeenCalledOnce();
    expect(screen.queryByText('0 Admission Offerings · 0 active')).not.toBeInTheDocument();
  });

  it('shows only Edit and Archive without opening details and preserves edit handling', async () => {
    const user = userEvent.setup();
    renderScreen();
    const row = within(rowFor(activeSetup.name));
    expect(row.getAllByRole('button')).toHaveLength(2);
    expect(row.getByRole('button', { name: 'Edit' })).toBeVisible();
    expect(row.getByRole('button', { name: 'Archive' })).toBeVisible();
    expect(
      row.queryByRole('button', { name: /Offering|inquiry link|More actions/ })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: activeSetup.name })).not.toBeInTheDocument();
    await user.click(screen.getByTestId('table-action-edit'));
    expect(screen.getByRole('region', { name: `Editing ${activeSetup.name}` })).toBeVisible();
    expect(screen.queryByRole('dialog', { name: activeSetup.name })).not.toBeInTheDocument();
  });

  it('keeps only Edit and Archive in the mobile row menu', async () => {
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
      renderScreen();
      await user.click(
        screen.getByRole('button', { name: `More actions for ${activeSetup.name}` })
      );
      const menu = within(
        screen.getByRole('menu', { name: `More actions for ${activeSetup.name}` })
      );
      expect(menu.getAllByRole('menuitem')).toHaveLength(2);
      expect(menu.getByRole('menuitem', { name: 'Edit' })).toBeVisible();
      expect(menu.getByRole('menuitem', { name: 'Archive' })).toBeVisible();
      expect(
        menu.queryByRole('menuitem', { name: /Offering|inquiry link/ })
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog', { name: activeSetup.name })).not.toBeInTheDocument();
      await user.click(menu.getByRole('menuitem', { name: 'Edit' }));
      expect(screen.getByRole('region', { name: `Editing ${activeSetup.name}` })).toBeVisible();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it.each(['create', 'edit'] as const)(
    'replaces the table with the inline %s form and restores it on close',
    async (action) => {
      const user = userEvent.setup();
      renderScreen();
      await user.click(
        screen.getByRole('button', { name: action === 'create' ? 'Create intake setup' : 'Edit' })
      );
      expect(screen.getByRole('heading', { name: 'Intake & Assignment' })).toBeVisible();
      expect(
        screen.getByRole('region', {
          name: `Editing ${action === 'create' ? 'new setup' : activeSetup.name}`,
        })
      ).toBeVisible();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Create intake setup' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Close editor' }));
      expect(screen.getByRole('table', { name: 'Admission intake setups table' })).toBeVisible();
      expect(screen.getByRole('tab', { name: 'Admission intake setups' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Create intake setup' })).toBeVisible();
    }
  );
});

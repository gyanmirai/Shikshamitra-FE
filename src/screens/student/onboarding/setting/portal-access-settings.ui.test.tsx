import type { ReactNode } from 'react';

import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { studentPermissions } from 'src/constants/student-menu';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import PortalAccessSettingsScreen from './portal-access-settings';
import { OnboardingSettingsProvider } from '../onboarding-settings-context';
import { defaultOnboardingSettings, defaultOnboardingProfiles } from '../onboarding-settings-model';

const mocks = vi.hoisted(() => ({ canConfigure: true, push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      auth: {
        permissions: [
          { name: studentPermissions.onboarding.configure, isGranted: mocks.canConfigure },
        ],
      },
      confirmPopup: { isChanges: false },
    }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ title, children }: { title: string; children?: ReactNode }) => (
    <section>
      <h3>{title}</h3>
      {children}
    </section>
  ),
}));

const theme = createTheme(defaultSettings);
const shell = (children: ReactNode) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;
beforeEach(() => {
  mocks.canConfigure = true;
  mocks.push.mockReset();
});
const renderSettings = (
  persist = vi.fn().mockResolvedValue(undefined),
  settings = defaultOnboardingSettings
) => {
  render(
    shell(
      <OnboardingSettingsProvider initialSettings={settings} onPersist={persist}>
        <PortalAccessSettingsScreen />
      </OnboardingSettingsProvider>
    )
  );
  return persist;
};
const choose = async (label: string, choice: string) => {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(screen.getByRole('option', { name: choice }));
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: label })).toHaveTextContent(choice)
  );
};

it('preserves new-school defaults with manual sending selected and timing hidden', () => {
  renderSettings();
  expect(screen.getByRole('combobox', { name: 'Student app login' })).toHaveTextContent(
    'Not needed'
  );
  expect(screen.getByRole('combobox', { name: 'Parent / Guardian app login' })).toHaveTextContent(
    'Required'
  );
  expect(screen.getByRole('radio', { name: 'Staff sends manually' })).toBeChecked();
  expect(screen.queryByRole('combobox', { name: 'When to send' })).not.toBeInTheDocument();
  expect(defaultOnboardingSettings.onboardingProfiles).toEqual([]);
  expect(screen.getByRole('button', { name: 'Save Settings' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'What is checked automatically?' })).toHaveAttribute(
    'aria-expanded',
    'false'
  );
});

it('persists optional login without widening completion gates or changing numbering and historical rules', async () => {
  const settings = structuredClone(defaultOnboardingSettings);
  settings.onboardingProfiles = structuredClone(defaultOnboardingProfiles);
  const persist = renderSettings(undefined, settings);
  await choose('Student app login', 'Optional');
  fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
  await waitFor(() => expect(persist).toHaveBeenCalledOnce());
  const saved = persist.mock.calls[0][1];
  expect(saved.readinessAccess).toMatchObject({
    studentAccountAccess: 'optional',
    studentAccount: false,
    guardianAccountAccess: 'required',
    guardianAccount: true,
    credentialProvisioningMode: 'manual',
    sendStudentCredentialEmail: false,
    sendGuardianCredentialEmail: false,
  });
  expect(saved.onboardingProfiles).toEqual(settings.onboardingProfiles);
  expect(saved.grNumber).toEqual(settings.grNumber);
  expect(saved.rollNumber).toEqual(settings.rollNumber);
  expect(saved.divisionChange).toEqual(settings.divisionChange);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save Settings' })).toBeDisabled());
});

it('shows automatic timing, retains the selection when toggled and saves its email policies', async () => {
  const persist = renderSettings();
  await choose('Student app login', 'Optional');
  fireEvent.click(screen.getByRole('radio', { name: 'Send automatically' }));
  await choose('When to send', 'After setup is complete');
  fireEvent.click(screen.getByRole('radio', { name: 'Staff sends manually' }));
  expect(screen.queryByRole('combobox', { name: 'When to send' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('radio', { name: 'Send automatically' }));
  expect(screen.getByRole('combobox', { name: 'When to send' })).toHaveTextContent(
    'After setup is complete'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
  await waitFor(() => expect(persist).toHaveBeenCalledOnce());
  expect(persist.mock.calls[0][1].readinessAccess).toMatchObject({
    credentialProvisioningMode: 'automatic',
    credentialSendingTime: 'completion',
    sendStudentCredentialEmail: true,
    sendGuardianCredentialEmail: true,
  });
});

it('restores saved automatic choices and explicitly switching to manual stops automatic emails', async () => {
  const settings = structuredClone(defaultOnboardingSettings);
  settings.readinessAccess = {
    ...settings.readinessAccess,
    credentialProvisioningMode: 'automatic',
    credentialSendingTime: 'completion',
    sendGuardianCredentialEmail: true,
  };
  const persist = renderSettings(undefined, settings);
  expect(screen.getByRole('radio', { name: 'Send automatically' })).toBeChecked();
  expect(screen.getByRole('combobox', { name: 'When to send' })).toHaveTextContent(
    'After setup is complete'
  );
  fireEvent.click(screen.getByRole('radio', { name: 'Staff sends manually' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
  await waitFor(() => expect(persist).toHaveBeenCalledOnce());
  expect(persist.mock.calls[0][1].readinessAccess).toMatchObject({
    credentialProvisioningMode: 'manual',
    credentialSendingTime: 'activation',
    sendStudentCredentialEmail: false,
    sendGuardianCredentialEmail: false,
  });
});

it('preserves entered choices on failure and saves them on retry', async () => {
  const persist = vi
    .fn()
    .mockRejectedValueOnce(new Error('unavailable'))
    .mockResolvedValueOnce(undefined);
  renderSettings(persist);
  await choose('Student app login', 'Required');
  fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
  await screen.findByText(/Login settings could not be saved/);
  expect(screen.getByRole('combobox', { name: 'Student app login' })).toHaveTextContent('Required');
  fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
  await waitFor(() => expect(persist).toHaveBeenCalledTimes(2));
  await waitFor(() =>
    expect(screen.queryByText(/Login settings could not be saved/)).not.toBeInTheDocument()
  );
});

it('enforces settings permission even for direct form submission', async () => {
  mocks.canConfigure = false;
  const persist = renderSettings();
  screen
    .getAllByRole('combobox')
    .forEach((select) => expect(select).toHaveAttribute('aria-disabled', 'true'));
  screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled());
  expect(screen.getByRole('button', { name: 'Save Settings' })).toBeDisabled();
  await act(async () => fireEvent.submit(screen.getByRole('form', { name: 'App login settings' })));
  expect(persist).not.toHaveBeenCalled();
});

it('protects unsaved choices when cancelling and only discards after confirmation', async () => {
  const persist = renderSettings();
  await choose('Student app login', 'Optional');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await screen.findByRole('dialog');
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('combobox', { name: 'Student app login' })).toHaveTextContent('Optional');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(screen.getByRole('combobox', { name: 'Student app login' })).toHaveTextContent(
    'Not needed'
  );
  expect(persist).not.toHaveBeenCalled();
});

it('guards ordinary tab navigation while preserving modifier-click links', async () => {
  render(
    shell(
      <OnboardingSettingsProvider>
        <PortalAccessSettingsScreen />
        <a href="/student/onboarding/settings?tab=gr-number">GR Number</a>
      </OnboardingSettingsProvider>
    )
  );
  await choose('Student app login', 'Optional');
  const link = screen.getByRole('link', { name: 'GR Number' });
  link.addEventListener('click', (event) => event.preventDefault(), { once: true });
  fireEvent.click(link, { ctrlKey: true });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(mocks.push).not.toHaveBeenCalled();
  fireEvent.click(link);
  await screen.findByRole('dialog');
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(mocks.push).toHaveBeenCalledWith('/student/onboarding/settings?tab=gr-number');
});

it('locks all fields and prevents duplicate direct submissions while saving', async () => {
  let finish: (() => void) | undefined;
  const persist = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  renderSettings(persist);
  await choose('Student app login', 'Optional');
  const form = screen.getByRole('form', { name: 'App login settings' });
  fireEvent.submit(form);
  await screen.findByRole('status');
  fireEvent.submit(form);
  screen
    .getAllByRole('combobox', { hidden: true })
    .forEach((select) => expect(select).toHaveAttribute('aria-disabled', 'true'));
  screen.getAllByRole('radio', { hidden: true }).forEach((radio) => expect(radio).toBeDisabled());
  expect(screen.getByRole('button', { name: 'Cancel', hidden: true })).toBeDisabled();
  expect(persist).toHaveBeenCalledOnce();
  await act(async () => finish?.());
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
});

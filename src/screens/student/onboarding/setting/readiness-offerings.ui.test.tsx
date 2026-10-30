import type { ReactNode } from 'react';

import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { studentPermissions } from 'src/constants/student-menu';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { OnboardingSettingsProvider } from '../onboarding-settings-context';
import { ReadinessAccessSettingsScreen } from './onboarding-policy-settings';
import { defaultOnboardingSettings, defaultOnboardingProfiles } from '../onboarding-settings-model';

const mocks = vi.hoisted(() => ({ canConfigure: true, errorToast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      auth: {
        permissions: [
          { name: studentPermissions.onboarding.configure, isGranted: mocks.canConfigure },
          { name: studentPermissions.onboarding.settings, isGranted: true },
          { name: 'Students.Admissions.Workflows.View', isGranted: true },
        ],
      },
      confirmPopup: { isChanges: false },
    }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: mocks.errorToast, dismiss: vi.fn() },
}));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ title, children }: { title: string; children?: ReactNode }) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

const theme = createTheme(defaultSettings);
beforeEach(() => {
  vi.clearAllMocks();
  mocks.canConfigure = true;
});

const show = (
  persist = vi.fn().mockResolvedValue(undefined),
  settings = defaultOnboardingSettings
) => {
  render(
    <ThemeProvider theme={theme}>
      <OnboardingSettingsProvider initialSettings={settings} onPersist={persist}>
        <ReadinessAccessSettingsScreen />
      </OnboardingSettingsProvider>
    </ThemeProvider>
  );
  return persist;
};
const choose = async (label: string, option: string) => {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(screen.getByRole('option', { name: option }));
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: label })).toHaveTextContent(option)
  );
};

it('inherits admission requirements without Offering rule creation and saves only the global login policy', async () => {
  const persist = show();
  expect(screen.queryByRole('button', { name: 'Add Readiness Rule' })).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox', { name: 'Admission Offerings' })).not.toBeInTheDocument();
  expect(screen.queryByRole('combobox', { name: 'Board' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'What is checked automatically?' }));
  expect(screen.getByText('Admission & required documents')).toBeVisible();
  expect(screen.getByText('From Admissions')).toBeVisible();
  expect(screen.getByText('Fee requirements')).toBeVisible();
  expect(screen.getByText('From Admissions & Finance')).toBeVisible();
  await choose('Student app login', 'Optional');
  fireEvent.click(screen.getByRole('radio', { name: 'Send automatically' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
  await waitFor(() => expect(persist).toHaveBeenCalledOnce());
  expect(persist.mock.calls[0][1]).toEqual({
    ...defaultOnboardingSettings,
    readinessAccess: {
      ...defaultOnboardingSettings.readinessAccess,
      studentAccountAccess: 'optional',
      guardianAccountAccess: 'required',
      studentAccount: false,
      guardianAccount: true,
      credentialProvisioningMode: 'automatic',
      credentialSendingTime: 'activation',
      sendStudentCredentialEmail: true,
      sendGuardianCredentialEmail: true,
    },
  });
  expect(persist.mock.calls[0][1].onboardingProfiles).toEqual([]);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save Settings' })).toBeDisabled());
});

it('preserves historical Offering-linked readiness rules while editing the global login choices', async () => {
  const settings = structuredClone(defaultOnboardingSettings);
  settings.onboardingProfiles = [
    { ...structuredClone(defaultOnboardingProfiles[0]), offeringIds: ['offering-1'] },
  ];
  const persist = show(undefined, settings);
  expect(screen.queryByRole('button', { name: 'Add Readiness Rule' })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: 'Rule name' })).not.toBeInTheDocument();
  await choose('Parent / Guardian app login', 'Optional');
  fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
  await waitFor(() => expect(persist).toHaveBeenCalledOnce());
  expect(persist.mock.calls[0][1]).toEqual({
    ...settings,
    readinessAccess: {
      ...settings.readinessAccess,
      studentAccountAccess: 'not-needed',
      guardianAccountAccess: 'optional',
      guardianAccount: false,
    },
  });
  expect(persist.mock.calls[0][1].onboardingProfiles).toEqual(settings.onboardingProfiles);
  expect(settings.onboardingProfiles[0].offeringIds).toEqual(['offering-1']);
});

it('retains entered login choices and historical Offering rules after failed save and retries the same payload', async () => {
  const persist = vi
    .fn()
    .mockRejectedValueOnce(new Error('conflict'))
    .mockResolvedValueOnce(undefined);
  const settings = structuredClone(defaultOnboardingSettings);
  settings.onboardingProfiles = [
    { ...structuredClone(defaultOnboardingProfiles[0]), offeringIds: ['offering-1'] },
  ];
  show(persist, settings);
  await choose('Student app login', 'Required');
  fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
  await screen.findByText(/Login settings could not be saved/);
  expect(mocks.errorToast).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'Login settings could not be saved. Your changes are still here; retry saving.',
    })
  );
  expect(screen.getByRole('combobox', { name: 'Student app login' })).toHaveTextContent('Required');
  expect(screen.getByRole('button', { name: 'Save Settings' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
  await waitFor(() => expect(persist).toHaveBeenCalledTimes(2));
  expect(persist.mock.calls[1]).toEqual(persist.mock.calls[0]);
  expect(persist.mock.calls[1][1].onboardingProfiles).toEqual(settings.onboardingProfiles);
  await waitFor(() =>
    expect(screen.queryByText(/Login settings could not be saved/)).not.toBeInTheDocument()
  );
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save Settings' })).toBeDisabled());
});

it('keeps the compatibility screen read-only without the exact settings permission, including direct submission', async () => {
  mocks.canConfigure = false;
  const persist = show();
  expect(screen.getByText(/Editing requires onboarding settings permission/)).toBeVisible();
  screen
    .getAllByRole('combobox')
    .forEach((select) => expect(select).toHaveAttribute('aria-disabled', 'true'));
  screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled());
  expect(screen.getByRole('button', { name: 'Save Settings' })).toBeDisabled();
  expect(screen.queryByRole('button', { name: 'Add Readiness Rule' })).not.toBeInTheDocument();
  await act(async () => fireEvent.submit(screen.getByRole('form', { name: 'App login settings' })));
  expect(persist).not.toHaveBeenCalled();
});

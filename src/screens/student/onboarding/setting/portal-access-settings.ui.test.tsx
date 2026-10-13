import type { ReactNode } from 'react';

import { it, vi, expect, beforeEach } from 'vitest';
import { studentPermissions } from 'src/constants/student-menu';
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
          { name: studentPermissions.onboarding.settings, isGranted: mocks.canConfigure },
        ],
      },
      confirmPopup: { isChanges: false },
    }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({
    title,
    action,
    children,
  }: {
    title: string;
    action?: ReactNode;
    children?: ReactNode;
  }) => (
    <section>
      <h3>{title}</h3>
      {action}
      {children}
    </section>
  ),
}));

beforeEach(() => {
  mocks.canConfigure = true;
  mocks.push.mockReset();
});
const renderSettings = (
  persist = vi.fn().mockResolvedValue(undefined),
  settings = defaultOnboardingSettings
) => {
  render(
    <OnboardingSettingsProvider initialSettings={settings} onPersist={persist}>
      <PortalAccessSettingsScreen />
    </OnboardingSettingsProvider>
  );
  return persist;
};

it('starts new schools with only parent/guardian login required and no named readiness rules', () => {
  renderSettings();
  expect(screen.getByRole('switch', { name: 'Student login required' })).not.toBeChecked();
  expect(screen.getByRole('switch', { name: 'Parent/Guardian login required' })).toBeChecked();
  expect(defaultOnboardingSettings.onboardingProfiles).toEqual([]);
  expect(
    screen.queryByText(/Offering requirements|Add readiness rule|Advanced settings/)
  ).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save Settings' })).toBeDisabled();
});

it('persists only the two choices while preserving legacy delivery, numbering and rule history', async () => {
  const settings = structuredClone(defaultOnboardingSettings);
  settings.onboardingProfiles = structuredClone(defaultOnboardingProfiles);
  settings.readinessAccess = {
    ...settings.readinessAccess,
    studentAccount: true,
    sendStudentCredentialEmail: true,
    credentialProvisioningMode: 'automatic',
  };
  const persist = renderSettings(undefined, settings);
  fireEvent.click(screen.getByRole('switch', { name: 'Student login required' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
  await waitFor(() => expect(persist).toHaveBeenCalledOnce());
  const saved = persist.mock.calls[0][1];
  expect(saved.readinessAccess).toEqual({ ...settings.readinessAccess, studentAccount: false });
  expect(saved.onboardingProfiles).toEqual(settings.onboardingProfiles);
  expect(saved.grNumber).toEqual(settings.grNumber);
  expect(saved.rollNumber).toEqual(settings.rollNumber);
  expect(saved.divisionChange).toEqual(settings.divisionChange);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save Settings' })).toBeDisabled());
});

it('preserves entered choices on failure and saves them on retry', async () => {
  const persist = vi
    .fn()
    .mockRejectedValueOnce(new Error('unavailable'))
    .mockResolvedValueOnce(undefined);
  renderSettings(persist);
  fireEvent.click(screen.getByRole('switch', { name: 'Student login required' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
  await screen.findByText(/Login settings could not be saved/);
  expect(screen.getByRole('switch', { name: 'Student login required' })).toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
  await waitFor(() => expect(persist).toHaveBeenCalledTimes(2));
  await waitFor(() =>
    expect(screen.queryByText(/Login settings could not be saved/)).not.toBeInTheDocument()
  );
});

it('enforces settings permission even for direct form submission', async () => {
  mocks.canConfigure = false;
  const persist = renderSettings();
  expect(screen.getByRole('switch', { name: 'Student login required' })).toBeDisabled();
  expect(screen.getByRole('switch', { name: 'Parent/Guardian login required' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Save Settings' })).toBeDisabled();
  await act(async () =>
    fireEvent.submit(screen.getByRole('form', { name: 'Portal access settings' }))
  );
  expect(persist).not.toHaveBeenCalled();
});

it('protects unsaved choices when cancelling and only discards after confirmation', async () => {
  const persist = renderSettings();
  fireEvent.click(screen.getByRole('switch', { name: 'Student login required' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await screen.findByRole('dialog');
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('switch', { name: 'Student login required' })).toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(screen.getByRole('switch', { name: 'Student login required' })).not.toBeChecked();
  expect(persist).not.toHaveBeenCalled();
});

it('guards ordinary tab navigation while preserving modifier-click links', async () => {
  render(
    <OnboardingSettingsProvider>
      <PortalAccessSettingsScreen />
      <a href="/student/onboarding/settings?tab=gr-number">GR Number</a>
    </OnboardingSettingsProvider>
  );
  fireEvent.click(screen.getByRole('switch', { name: 'Student login required' }));
  const tabLink = screen.getByRole('link', { name: 'GR Number' });
  // Happy DOM navigates this window for modified clicks; a real browser opens another tab.
  tabLink.addEventListener('click', (event) => event.preventDefault(), { once: true });
  fireEvent.click(tabLink, { ctrlKey: true });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(mocks.push).not.toHaveBeenCalled();
  fireEvent.click(tabLink);
  await screen.findByRole('dialog');
  expect(mocks.push).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(mocks.push).toHaveBeenCalledWith('/student/onboarding/settings?tab=gr-number');
});

it('locks both choices and duplicate submissions until persistence completes', async () => {
  let finishSave: (() => void) | undefined;
  const persist = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finishSave = resolve;
      })
  );
  renderSettings(persist);
  fireEvent.click(screen.getByRole('switch', { name: 'Student login required' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
  await screen.findByRole('status');
  expect(
    screen.getByRole('switch', { name: 'Student login required', hidden: true })
  ).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(persist).toHaveBeenCalledOnce();
  await act(async () => finishSave?.());
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
});

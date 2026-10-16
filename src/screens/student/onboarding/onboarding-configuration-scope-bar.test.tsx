import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { OnboardingConfigurationScopeBar } from './onboarding-configuration-scope-bar';
import { useOnboardingSettings, OnboardingSettingsProvider } from './onboarding-settings-context';

const auth = vi.hoisted(() => ({ canDelete: true }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
beforeEach(() => { auth.canDelete = true; });
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({
    globalState: { currentYear: { id: 'year-1', name: '2026-27' } },
    auth: { permissions: [{ name: 'Students.Onboarding.Delete', isGranted: auth.canDelete }] },
  }),
}));

function SettingsChangeProbe() {
  const { settings, applyReadinessAccess } = useOnboardingSettings();

  return (
    <button
      type="button"
      onClick={() =>
        applyReadinessAccess({
          ...settings.readinessAccess,
          requireDocuments: !settings.readinessAccess.requireDocuments,
        })
      }
    >
      Change active scope
    </button>
  );
}

describe('OnboardingConfigurationScopeBar', () => {
  it('switches to the current academic year and restores inherited defaults', () => {
    render(
      <OnboardingSettingsProvider>
        <OnboardingConfigurationScopeBar />
        <SettingsChangeProbe />
      </OnboardingSettingsProvider>
    );

    expect(screen.getByText('Inherited defaults')).toBeInTheDocument();
    expect(screen.getByText('All years')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Applies to' }));
    fireEvent.click(screen.getByRole('option', { name: 'Current academic year' }));

    expect(screen.getByText('2026-27')).toBeInTheDocument();
    expect(screen.queryByText('CBSE')).not.toBeInTheDocument();
    expect(screen.queryByText('English')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Change active scope' }));

    expect(screen.getByText('Customized')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Use inherited defaults' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restore defaults' }));

    expect(screen.getByText('Inherited defaults')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Use inherited defaults' })
    ).not.toBeInTheDocument();
  });

  it('requires Delete before offering removal of a saved override', () => {
    auth.canDelete = false;
    render(<OnboardingSettingsProvider><OnboardingConfigurationScopeBar /><SettingsChangeProbe /></OnboardingSettingsProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Change active scope' }));
    expect(screen.getByText('Customized')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Use inherited defaults' })).not.toBeInTheDocument();
  });
});

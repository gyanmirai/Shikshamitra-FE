import { it, vi, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { defaultOnboardingSettings } from './onboarding-settings-model';
import { useOnboardingSettings, OnboardingSettingsProvider } from './onboarding-settings-context';

it('preserves published legacy numbering history when saving unrelated readiness settings', async () => {
  const legacySettings = structuredClone(defaultOnboardingSettings);
  [...legacySettings.grNumber.configurations, ...legacySettings.rollNumber.configurations].forEach(
    (rule) => {
      delete rule.status;
      delete rule.version;
      rule.isActive = true;
    }
  );
  delete legacySettings.grNumber.configurations[0].campusIds;
  delete legacySettings.rollNumber.configurations[0].campusIds;
  const persist = vi.fn().mockResolvedValue(undefined);
  function EditReadiness() {
    const { settings, applyReadinessAccess } = useOnboardingSettings();
    return (
      <button
        type="button"
        onClick={() =>
          applyReadinessAccess({ ...settings.readinessAccess, sendStudentCredentialEmail: true })
        }
      >
        Save readiness
      </button>
    );
  }
  render(
    <OnboardingSettingsProvider initialSettings={legacySettings} onPersist={persist}>
      <EditReadiness />
    </OnboardingSettingsProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save readiness' }));
  await waitFor(() => expect(persist).toHaveBeenCalledOnce());
  const saved = persist.mock.calls[0][1];
  expect(saved.grNumber.configurations).toEqual(legacySettings.grNumber.configurations);
  expect(saved.rollNumber.configurations).toEqual(legacySettings.rollNumber.configurations);
  expect(saved.grNumber.configurations[0]).not.toHaveProperty('campusIds');
  expect(saved.rollNumber.configurations[0]).not.toHaveProperty('campusIds');
});

it('saves new default numbering rows as drafts on the first readiness save', async () => {
  const persist = vi.fn().mockResolvedValue(undefined);
  function FirstReadinessSave() {
    const { settings, applyReadinessAccess } = useOnboardingSettings();
    return (
      <button
        type="button"
        onClick={() =>
          applyReadinessAccess({ ...settings.readinessAccess, sendStudentCredentialEmail: true })
        }
      >
        Save first readiness
      </button>
    );
  }
  render(
    <OnboardingSettingsProvider onPersist={persist}>
      <FirstReadinessSave />
    </OnboardingSettingsProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save first readiness' }));
  await waitFor(() => expect(persist).toHaveBeenCalledOnce());
  const saved = persist.mock.calls[0][1];
  [...saved.grNumber.configurations, ...saved.rollNumber.configurations].forEach((rule) => {
    expect(rule).toMatchObject({ status: 'draft', version: 1, isActive: false });
  });
});

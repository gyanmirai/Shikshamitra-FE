import type { ReactNode } from 'react';

import { it, vi, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useOnboardingSettings, OnboardingSettingsProvider } from './onboarding-settings-context';
import {
  defaultOnboardingSettings,
  defaultRollNumberConfiguration,
  type OnboardingConfigurationScope,
  defaultOnboardingConfigurationScope,
} from './onboarding-settings-model';

const academicScope: OnboardingConfigurationScope = {
  level: 'academic-year',
  key: 'school:current:academic-year:year-1',
  label: 'Academic year — 2026-27',
  schoolName: 'Current school',
  academicYearId: 'year-1',
  academicYearName: '2026-27',
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <OnboardingSettingsProvider>{children}</OnboardingSettingsProvider>
);

describe('OnboardingSettingsProvider configuration scopes', () => {

  it('opens and saves the selected academic year without a separate scope selector', async () => {
    const onPersist = vi.fn().mockResolvedValue(undefined);
    const yearSettings = { ...defaultOnboardingSettings, readinessAccess: { ...defaultOnboardingSettings.readinessAccess, requireDocuments: false } };
    const { result } = renderHook(() => useOnboardingSettings(), { wrapper: ({ children }) => (
      <OnboardingSettingsProvider initialScope={academicScope} initialOverrides={{ [academicScope.key]: yearSettings }} onPersist={onPersist}>
        {children}
      </OnboardingSettingsProvider>
    ) });
    expect(result.current.scope).toEqual(academicScope);
    expect(result.current.settings.readinessAccess.requireDocuments).toBe(false);
    await act(async () => result.current.applyReadinessAccess({ ...result.current.settings.readinessAccess, requireDocuments: true }));
    expect(onPersist).toHaveBeenCalledWith(academicScope, expect.anything());
  });

  it('commits a scoped change only after backend persistence and deletes only that override', async () => {
    const onPersist = vi.fn().mockResolvedValue(undefined);
    const onRemoveOverride = vi.fn().mockResolvedValue(undefined);
    const persistentWrapper = ({ children }: { children: ReactNode }) => (
      <OnboardingSettingsProvider
        initialOverrides={{
          [defaultOnboardingConfigurationScope.key]: defaultOnboardingSettings,
        }}
        onPersist={onPersist}
        onRemoveOverride={onRemoveOverride}
      >
        {children}
      </OnboardingSettingsProvider>
    );
    const { result } = renderHook(() => useOnboardingSettings(), { wrapper: persistentWrapper });

    await act(async () => {
      await result.current.applyReadinessAccess({
        ...result.current.settings.readinessAccess,
        requireDocuments: false,
      });
    });

    expect(onPersist).toHaveBeenCalledWith(
      defaultOnboardingConfigurationScope,
      expect.objectContaining({
        readinessAccess: expect.objectContaining({ requireDocuments: false }),
      })
    );
    expect(result.current.settings.readinessAccess.requireDocuments).toBe(false);

    await act(async () => {
      await result.current.resetToInherited();
    });

    expect(onRemoveOverride).toHaveBeenCalledWith(defaultOnboardingConfigurationScope);
    expect(result.current.settings.readinessAccess.requireDocuments).toBe(true);
  });

  it('inherits defaults and preserves independent school and academic overrides', () => {
    const { result } = renderHook(() => useOnboardingSettings(), { wrapper });

    expect(result.current.scope.level).toBe('school');
    expect(result.current.isInherited).toBe(true);
    expect(result.current.settings.readinessAccess.requireDocuments).toBe(true);

    act(() => {
      result.current.applyReadinessAccess({
        ...result.current.settings.readinessAccess,
        requireDocuments: false,
      });
    });

    expect(result.current.isInherited).toBe(false);
    expect(result.current.settings.readinessAccess.requireDocuments).toBe(false);
    expect(result.current.revision).toBe(1);

    act(() => result.current.setScope(academicScope));

    expect(result.current.scope.key).toBe(academicScope.key);
    expect(result.current.isInherited).toBe(true);
    expect(result.current.settings.readinessAccess.requireDocuments).toBe(false);

    act(() => result.current.setRollAssignmentMode('manual'));

    expect(result.current.isInherited).toBe(false);
    expect(result.current.settings.rollNumber.assignmentMode).toBe('manual');

    act(() =>
      result.current.setScope({
        level: 'school',
        key: 'school:current',
        label: 'Current school',
        schoolName: 'Current school',
      })
    );

    expect(result.current.settings.readinessAccess.requireDocuments).toBe(false);
    expect(result.current.settings.rollNumber.assignmentMode).toBe('both');

    act(() => result.current.resetToInherited());

    expect(result.current.isInherited).toBe(true);
    expect(result.current.settings.readinessAccess.requireDocuments).toBe(true);
    expect(result.current.revision).toBe(0);
  });

  it('upserts an applied Roll policy for Student Setup consumption', () => {
    const { result } = renderHook(() => useOnboardingSettings(), { wrapper });

    act(() => {
      result.current.saveRollNumberConfiguration({
        ...defaultRollNumberConfiguration,
        className: 'All classes',
        numberingScope: 'class',
        assignmentTiming: 'manual-bulk',
        midYearHandling: 'manual',
        requireApproval: true,
      });
    });

    expect(result.current.settings.rollNumber.configurations).toHaveLength(1);
    expect(result.current.settings.rollNumber.configurations[0]).toMatchObject({
      id: defaultRollNumberConfiguration.id,
      numberingScope: 'class',
      assignmentTiming: 'manual-bulk',
      midYearHandling: 'manual',
      requireApproval: true,
    });

    act(() => {
      result.current.saveRollNumberConfiguration({
        ...result.current.settings.rollNumber.configurations[0],
        startingNumber: 25,
      });
    });

    expect(result.current.settings.rollNumber.configurations).toHaveLength(1);
    expect(result.current.settings.rollNumber.configurations[0].startingNumber).toBe(25);
    expect(result.current.revision).toBe(2);
  });

  it('appends a Readiness academic override without replacing its route fallback', () => {
    const { result } = renderHook(() => useOnboardingSettings(), { wrapper });
    const source = defaultOnboardingSettings.onboardingProfiles[0];

    act(() => {
      result.current.applyOnboardingProfile({
        ...source,
        id: 'fresh-gseb-override',
        name: 'Fresh admission GSEB override',
        applicability: {
          ...source.applicability,
          boardMode: 'selected',
          boardIds: ['board-gseb'],
        },
      });
    });

    expect(result.current.settings.onboardingProfiles).toHaveLength(5);
    expect(result.current.settings.onboardingProfiles[0].id).toBe('fresh-admission');
    expect(result.current.settings.onboardingProfiles[4]).toMatchObject({
      id: 'fresh-gseb-override',
      admissionRoutes: ['Fresh admission'],
      applicability: { boardMode: 'selected', boardIds: ['board-gseb'] },
    });
  });
});
it('defaults legacy profiles to email OFF without changing account requirements', () => {
  const legacy = JSON.parse(JSON.stringify(defaultOnboardingSettings));
  for (const rules of [legacy.readinessAccess, ...legacy.onboardingProfiles.map((profile: any) => profile.rules)]) {
    delete rules.sendStudentCredentialEmail;
    delete rules.sendGuardianCredentialEmail;
    delete rules.credentialSendingTime;
    delete rules.credentialProvisioningMode;
    delete rules.guardianAccountRelationship;
  }
  const { result } = renderHook(() => useOnboardingSettings(), { wrapper: ({ children }) => <OnboardingSettingsProvider initialSettings={legacy}>{children}</OnboardingSettingsProvider> });
  for (const rules of [result.current.settings.readinessAccess, ...result.current.settings.onboardingProfiles.map(profile => profile.rules)]) {
    expect(rules).toMatchObject({ sendStudentCredentialEmail: false, sendGuardianCredentialEmail: false, credentialSendingTime: 'activation', credentialProvisioningMode: 'manual', guardianAccountRelationship: 'guardian' });
  }
  expect(result.current.settings.readinessAccess.studentAccount).toBe(true);
});

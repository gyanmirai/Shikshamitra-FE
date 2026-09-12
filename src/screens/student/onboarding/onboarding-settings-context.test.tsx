import type { ReactNode } from 'react';

import { it, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useOnboardingSettings, OnboardingSettingsProvider } from './onboarding-settings-context';
import {
  defaultRollNumberConfiguration,
  type OnboardingConfigurationScope,
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
    expect(result.current.settings.readinessAccess.requireDocuments).toBe(true);

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
});

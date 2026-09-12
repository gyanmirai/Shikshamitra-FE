'use client';

import type { ReactNode } from 'react';

import { useMemo, useState, useContext, useCallback, createContext } from 'react';

import {
  defaultOnboardingSettings,
  defaultOnboardingConfigurationScope,
} from './onboarding-settings-model';

import type {
  OnboardingProfile,
  AssignmentModePolicy,
  ReadinessAccessRules,
  GrNumberConfiguration,
  RollNumberConfiguration,
  DivisionChangeConfiguration,
  OnboardingConfigurationScope,
  OnboardingSettingsConfiguration,
} from './onboarding-settings-model';

type OnboardingSettingsContextValue = {
  settings: OnboardingSettingsConfiguration;
  revision: number;
  scope: OnboardingConfigurationScope;
  isInherited: boolean;
  setScope: (scope: OnboardingConfigurationScope) => void;
  resetToInherited: () => void;
  applyReadinessAccess: (rules: ReadinessAccessRules) => void;
  applyOnboardingProfile: (profileId: string, rules: ReadinessAccessRules) => void;
  saveGrNumberConfiguration: (configuration: GrNumberConfiguration) => void;
  setGrAssignmentMode: (mode: AssignmentModePolicy) => void;
  saveRollNumberConfiguration: (configuration: RollNumberConfiguration) => void;
  setRollAssignmentMode: (mode: AssignmentModePolicy) => void;
  saveDivisionChangeConfiguration: (configuration: DivisionChangeConfiguration) => void;
};

const OnboardingSettingsContext = createContext<OnboardingSettingsContextValue | null>(null);

const cloneInitialSettings = (
  settings: OnboardingSettingsConfiguration
): OnboardingSettingsConfiguration => ({
  ...settings,
  readinessAccess: {
    ...settings.readinessAccess,
    approvalTriggers: [...settings.readinessAccess.approvalTriggers],
    checks: settings.readinessAccess.checks.map((check) => ({ ...check })),
  },
  onboardingProfiles: settings.onboardingProfiles.map((profile): OnboardingProfile => ({
    ...profile,
    admissionRoutes: [...profile.admissionRoutes],
    rules: {
      ...profile.rules,
      approvalTriggers: [...profile.rules.approvalTriggers],
      checks: profile.rules.checks.map((check) => ({ ...check })),
    },
  })),
  grNumber: {
    ...settings.grNumber,
    configurations: settings.grNumber.configurations.map((configuration) => ({
      ...configuration,
      boardIds: [...configuration.boardIds],
      applicableProfileIds: [...configuration.applicableProfileIds],
    })),
  },
  rollNumber: {
    ...settings.rollNumber,
    configurations: settings.rollNumber.configurations.map((configuration) => ({
      ...configuration,
      boardIds: [...configuration.boardIds],
      orderingRules: configuration.orderingRules.map((rule) => ({ ...rule })),
    })),
  },
  divisionChange: {
    configurations: settings.divisionChange.configurations.map((configuration) => ({
      ...configuration,
      boardIds: [...configuration.boardIds],
    })),
  },
});

export function OnboardingSettingsProvider({
  children,
  initialSettings = defaultOnboardingSettings,
}: {
  children: ReactNode;
  initialSettings?: OnboardingSettingsConfiguration;
}) {
  const [inheritedSettings] = useState(() => cloneInitialSettings(initialSettings));
  const [scope, setActiveScope] = useState(defaultOnboardingConfigurationScope);
  const [overrides, setOverrides] = useState<Record<string, OnboardingSettingsConfiguration>>({});
  const [revisions, setRevisions] = useState<Record<string, number>>({});
  const settings = overrides[scope.key] ?? inheritedSettings;
  const revision = revisions[scope.key] ?? 0;
  const isInherited = !overrides[scope.key];

  const setScope = useCallback((nextScope: OnboardingConfigurationScope) => {
    setActiveScope((current) =>
      current.key === nextScope.key &&
      current.label === nextScope.label &&
      current.schoolName === nextScope.schoolName
        ? current
        : nextScope
    );
  }, []);

  const updateSettings = useCallback(
    (updater: (current: OnboardingSettingsConfiguration) => OnboardingSettingsConfiguration) => {
      setOverrides((current) => {
        const currentSettings = current[scope.key] ?? inheritedSettings;
        return {
          ...current,
          [scope.key]: cloneInitialSettings(updater(currentSettings)),
        };
      });
      setRevisions((current) => ({
        ...current,
        [scope.key]: (current[scope.key] ?? 0) + 1,
      }));
    },
    [inheritedSettings, scope.key]
  );

  const resetToInherited = useCallback(() => {
    setOverrides((current) => {
      if (!current[scope.key]) return current;
      const next = { ...current };
      delete next[scope.key];
      return next;
    });
    setRevisions((current) => {
      if (!current[scope.key]) return current;
      const next = { ...current };
      delete next[scope.key];
      return next;
    });
  }, [scope.key]);
  const applyReadinessAccess = useCallback(
    (rules: ReadinessAccessRules) => {
      updateSettings((current) => ({
        ...current,
        readinessAccess: { ...rules },
      }));
    },
    [updateSettings]
  );
  const applyOnboardingProfile = useCallback(
    (profileId: string, rules: ReadinessAccessRules) => {
      updateSettings((current) => ({
        ...current,
        onboardingProfiles: current.onboardingProfiles.map((profile) =>
          profile.id === profileId
            ? {
                ...profile,
                rules: {
                  ...rules,
                  approvalTriggers: [...rules.approvalTriggers],
                  checks: rules.checks.map((check) => ({ ...check })),
                },
              }
            : profile
        ),
      }));
    },
    [updateSettings]
  );
  const saveGrNumberConfiguration = useCallback(
    (configuration: GrNumberConfiguration) => {
      updateSettings((current) => ({
        ...current,
        grNumber: {
          ...current.grNumber,
          configurations: current.grNumber.configurations.some(
            (item) => item.id === configuration.id
          )
            ? current.grNumber.configurations.map((item) =>
                item.id === configuration.id ? configuration : item
              )
            : [...current.grNumber.configurations, configuration],
        },
      }));
    },
    [updateSettings]
  );
  const setGrAssignmentMode = useCallback(
    (assignmentMode: AssignmentModePolicy) => {
      updateSettings((current) => ({
        ...current,
        grNumber: { ...current.grNumber, assignmentMode },
      }));
    },
    [updateSettings]
  );
  const saveRollNumberConfiguration = useCallback(
    (configuration: RollNumberConfiguration) => {
      updateSettings((current) => ({
        ...current,
        rollNumber: {
          ...current.rollNumber,
          configurations: current.rollNumber.configurations.some(
            (item) => item.id === configuration.id
          )
            ? current.rollNumber.configurations.map((item) =>
                item.id === configuration.id ? configuration : item
              )
            : [...current.rollNumber.configurations, configuration],
        },
      }));
    },
    [updateSettings]
  );
  const setRollAssignmentMode = useCallback(
    (assignmentMode: AssignmentModePolicy) => {
      updateSettings((current) => ({
        ...current,
        rollNumber: { ...current.rollNumber, assignmentMode },
      }));
    },
    [updateSettings]
  );
  const saveDivisionChangeConfiguration = useCallback(
    (configuration: DivisionChangeConfiguration) => {
      updateSettings((current) => ({
        ...current,
        divisionChange: {
          configurations: current.divisionChange.configurations.some(
            (item) => item.id === configuration.id
          )
            ? current.divisionChange.configurations.map((item) =>
                item.id === configuration.id ? configuration : item
              )
            : [...current.divisionChange.configurations, configuration],
        },
      }));
    },
    [updateSettings]
  );
  const value = useMemo<OnboardingSettingsContextValue>(
    () => ({
      settings,
      revision,
      scope,
      isInherited,
      setScope,
      resetToInherited,
      applyReadinessAccess,
      applyOnboardingProfile,
      saveGrNumberConfiguration,
      setGrAssignmentMode,
      saveRollNumberConfiguration,
      setRollAssignmentMode,
      saveDivisionChangeConfiguration,
    }),
    [
      settings,
      revision,
      scope,
      isInherited,
      setScope,
      resetToInherited,
      applyReadinessAccess,
      applyOnboardingProfile,
      saveGrNumberConfiguration,
      setGrAssignmentMode,
      saveRollNumberConfiguration,
      setRollAssignmentMode,
      saveDivisionChangeConfiguration,
    ]
  );

  return (
    <OnboardingSettingsContext.Provider value={value}>
      {children}
    </OnboardingSettingsContext.Provider>
  );
}

export function useOnboardingSettings() {
  const context = useContext(OnboardingSettingsContext);

  if (!context) {
    throw new Error('useOnboardingSettings must be used within OnboardingSettingsProvider.');
  }

  return context;
}

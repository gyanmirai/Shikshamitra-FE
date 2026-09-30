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
  resetToInherited: () => Promise<void> | void;
  setAvailableSchoolLevels: (schoolLevelNames: string[] | null) => Promise<void> | void;
  applyReadinessAccess: (rules: ReadinessAccessRules) => Promise<void> | void;
  applyOnboardingProfile: (profile: OnboardingProfile) => Promise<void> | void;
  saveGrNumberConfiguration: (configuration: GrNumberConfiguration) => Promise<void> | void;
  setGrAssignmentMode: (mode: AssignmentModePolicy) => Promise<void> | void;
  saveRollNumberConfiguration: (configuration: RollNumberConfiguration) => Promise<void> | void;
  setRollAssignmentMode: (mode: AssignmentModePolicy) => Promise<void> | void;
  saveDivisionChangeConfiguration: (configuration: DivisionChangeConfiguration) =>
    | Promise<void>
    | void;
};

const OnboardingSettingsContext = createContext<OnboardingSettingsContextValue | null>(null);

const cloneInitialSettings = (
  settings: OnboardingSettingsConfiguration
): OnboardingSettingsConfiguration => ({
  ...settings,
  academicAvailability: {
    schoolLevelNames: settings.academicAvailability?.schoolLevelNames
      ? [...settings.academicAvailability.schoolLevelNames]
      : null,
  },
  readinessAccess: {
    ...settings.readinessAccess,
    approvalTriggers: [...settings.readinessAccess.approvalTriggers],
    checks: settings.readinessAccess.checks.map((check) => ({ ...check })),
  },
  onboardingProfiles: settings.onboardingProfiles.map((profile): OnboardingProfile => ({
    ...profile,
    admissionRoutes: [...profile.admissionRoutes],
    applicability: {
      ...profile.applicability,
      campusIds: [...(profile.applicability.campusIds ?? [])],
      boardIds: [...profile.applicability.boardIds],
      academicMediumIds: [...profile.applicability.academicMediumIds],
      academicMediumStageIds: [...profile.applicability.academicMediumStageIds],
      standardIds: [...profile.applicability.standardIds],
      divisionIds: [...profile.applicability.divisionIds],
    },
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
      campusIds: [...(configuration.campusIds ?? [])],
      boardIds: [...configuration.boardIds],
      academicMediumIds: [...configuration.academicMediumIds],
      academicMediumStageIds: [...configuration.academicMediumStageIds],
      standardIds: [...configuration.standardIds],
      divisionIds: [...configuration.divisionIds],
      applicableProfileIds: [...configuration.applicableProfileIds],
    })),
  },
  rollNumber: {
    ...settings.rollNumber,
    configurations: settings.rollNumber.configurations.map((configuration) => ({
      ...configuration,
      campusIds: [...(configuration.campusIds ?? [])],
      boardIds: [...configuration.boardIds],
      academicMediumIds: [...configuration.academicMediumIds],
      academicMediumStageIds: [...configuration.academicMediumStageIds],
      standardIds: [...configuration.standardIds],
      divisionIds: [...configuration.divisionIds],
      orderingRules: configuration.orderingRules.map((rule) => ({ ...rule })),
    })),
  },
  divisionChange: {
    configurations: settings.divisionChange.configurations.map((configuration) => ({
      ...configuration,
      campusIds: [...(configuration.campusIds ?? [])],
      boardIds: [...configuration.boardIds],
      academicMediumIds: [...configuration.academicMediumIds],
      academicMediumStageIds: [...configuration.academicMediumStageIds],
      standardIds: [...configuration.standardIds],
      divisionIds: [...configuration.divisionIds],
    })),
  },
});

export function OnboardingSettingsProvider({
  children,
  initialSettings = defaultOnboardingSettings,
  initialOverrides = {},
  initialScope = defaultOnboardingConfigurationScope,
  onPersist,
  onRemoveOverride,
}: {
  children: ReactNode;
  initialSettings?: OnboardingSettingsConfiguration;
  initialOverrides?: Record<string, OnboardingSettingsConfiguration>;
  initialScope?: OnboardingConfigurationScope;
  onPersist?: (
    scope: OnboardingConfigurationScope,
    settings: OnboardingSettingsConfiguration
  ) => Promise<void>;
  onRemoveOverride?: (scope: OnboardingConfigurationScope) => Promise<void>;
}) {
  const [inheritedSettings] = useState(() => cloneInitialSettings(initialSettings));
  const [scope, setActiveScope] = useState(initialScope);
  const [overrides, setOverrides] = useState<Record<string, OnboardingSettingsConfiguration>>(() =>
    Object.fromEntries(
      Object.entries(initialOverrides).map(([key, settings]) => [key, cloneInitialSettings(settings)])
    )
  );
  const [revisions, setRevisions] = useState<Record<string, number>>({});
  const schoolSettings =
    overrides[defaultOnboardingConfigurationScope.key] ?? inheritedSettings;
  const settings =
    overrides[scope.key] ?? (scope.level === 'academic-year' ? schoolSettings : inheritedSettings);
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
      const currentSettings =
        overrides[scope.key] ??
        (scope.level === 'academic-year' ? schoolSettings : inheritedSettings);
      const nextSettings = cloneInitialSettings(updater(currentSettings));
      const commit = () => {
        setOverrides((current) => ({ ...current, [scope.key]: nextSettings }));
        setRevisions((current) => ({
          ...current,
          [scope.key]: (current[scope.key] ?? 0) + 1,
        }));
      };

      if (!onPersist) {
        commit();
        return undefined;
      }

      return onPersist(scope, nextSettings).then(commit);
    },
    [inheritedSettings, onPersist, overrides, schoolSettings, scope]
  );

  const resetToInherited = useCallback(() => {
    if (!overrides[scope.key]) return undefined;
    const commit = () => {
      setOverrides((current) => {
        const next = { ...current };
        delete next[scope.key];
        return next;
      });
      setRevisions((current) => {
        const next = { ...current };
        delete next[scope.key];
        return next;
      });
    };

    if (!onRemoveOverride) {
      commit();
      return undefined;
    }

    return onRemoveOverride(scope).then(commit);
  }, [onRemoveOverride, overrides, scope]);
  const applyReadinessAccess = useCallback(
    (rules: ReadinessAccessRules) =>
      updateSettings((current) => ({
        ...current,
        readinessAccess: { ...rules },
      })),
    [updateSettings]
  );
  const setAvailableSchoolLevels = useCallback(
    (schoolLevelNames: string[] | null) =>
      updateSettings((current) => ({
        ...current,
        academicAvailability: { schoolLevelNames: schoolLevelNames ? [...schoolLevelNames] : null },
      })),
    [updateSettings]
  );
  const applyOnboardingProfile = useCallback(
    (updatedProfile: OnboardingProfile) =>
      updateSettings((current) => ({
        ...current,
        onboardingProfiles: (() => {
          const nextProfile: OnboardingProfile = {
            ...updatedProfile,
            admissionRoutes: [...updatedProfile.admissionRoutes],
            applicability: {
              ...updatedProfile.applicability,
              campusIds: [...(updatedProfile.applicability.campusIds ?? [])],
              boardIds: [...updatedProfile.applicability.boardIds],
              academicMediumIds: [...updatedProfile.applicability.academicMediumIds],
              academicMediumStageIds: [...updatedProfile.applicability.academicMediumStageIds],
              standardIds: [...updatedProfile.applicability.standardIds],
              divisionIds: [...updatedProfile.applicability.divisionIds],
            },
            rules: {
              ...updatedProfile.rules,
              approvalTriggers: [...updatedProfile.rules.approvalTriggers],
              checks: updatedProfile.rules.checks.map((check) => ({ ...check })),
            },
          };
          return current.onboardingProfiles.some((profile) => profile.id === updatedProfile.id)
            ? current.onboardingProfiles.map((profile) =>
                profile.id === updatedProfile.id ? nextProfile : profile
              )
            : [...current.onboardingProfiles, nextProfile];
        })(),
      })),
    [updateSettings]
  );
  const saveGrNumberConfiguration = useCallback(
    (configuration: GrNumberConfiguration) =>
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
      })),
    [updateSettings]
  );
  const setGrAssignmentMode = useCallback(
    (assignmentMode: AssignmentModePolicy) =>
      updateSettings((current) => ({
        ...current,
        grNumber: { ...current.grNumber, assignmentMode },
      })),
    [updateSettings]
  );
  const saveRollNumberConfiguration = useCallback(
    (configuration: RollNumberConfiguration) =>
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
      })),
    [updateSettings]
  );
  const setRollAssignmentMode = useCallback(
    (assignmentMode: AssignmentModePolicy) =>
      updateSettings((current) => ({
        ...current,
        rollNumber: { ...current.rollNumber, assignmentMode },
      })),
    [updateSettings]
  );
  const saveDivisionChangeConfiguration = useCallback(
    (configuration: DivisionChangeConfiguration) =>
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
      })),
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
      setAvailableSchoolLevels,
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
      setAvailableSchoolLevels,
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

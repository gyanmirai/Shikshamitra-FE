'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { StudentOnboardingSettingsRecord } from 'src/redux/student/onboarding/student-onboarding-types';

import { useRef, useMemo, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Box, LinearProgress } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import {
  useGetStudentOnboardingSettingsQuery,
  useSaveStudentOnboardingSettingsMutation,
  useDeleteStudentOnboardingSettingsMutation,
} from 'src/redux/student/onboarding/student-onboarding-api';

import { OnboardingSettingsProvider } from './onboarding-settings-context';
import {
  defaultOnboardingSettings,
  defaultOnboardingConfigurationScope,
} from './onboarding-settings-model';

import type {
  OnboardingConfigurationScope,
  OnboardingSettingsConfiguration,
} from './onboarding-settings-model';

const SCHEMA_VERSION = 1;

const getAcademicScopeKey = (academicYearId: string) =>
  `school:current:academic-year:${academicYearId}`;

const parseConfiguration = (
  record?: StudentOnboardingSettingsRecord
): OnboardingSettingsConfiguration | null => {
  if (!record || record.schemaVersion !== SCHEMA_VERSION) return null;

  try {
    const value = JSON.parse(record.configurationJson) as Partial<OnboardingSettingsConfiguration>;
    if (
      !value.readinessAccess ||
      !Array.isArray(value.onboardingProfiles) ||
      !value.grNumber ||
      !Array.isArray(value.grNumber.configurations) ||
      !value.rollNumber ||
      !Array.isArray(value.rollNumber.configurations) ||
      !value.divisionChange ||
      !Array.isArray(value.divisionChange.configurations)
    ) {
      return null;
    }

    return value as OnboardingSettingsConfiguration;
  } catch {
    return null;
  }
};

const getRecordKey = (academicYearId?: string | null) => academicYearId ?? 'school';

export function PersistedOnboardingSettingsProvider({ children }: { children: ReactNode }) {
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const academicYearId = currentYear?.id;
  const settingsQuery = useGetStudentOnboardingSettingsQuery(
    academicYearId ? { academicYearId } : undefined
  );
  const [saveSettings] = useSaveStudentOnboardingSettingsMutation();
  const [deleteSettings] = useDeleteStudentOnboardingSettingsMutation();
  const recordsRef = useRef(new Map<string, StudentOnboardingSettingsRecord>());

  useEffect(() => {
    if (!settingsQuery.data) return;
    recordsRef.current = new Map(
      settingsQuery.data.map((record) => [getRecordKey(record.academicYearId), record])
    );
  }, [settingsQuery.data]);

  const initialState = useMemo(() => {
    const schoolRecord = settingsQuery.data?.find((record) => !record.academicYearId);
    const schoolSettings = parseConfiguration(schoolRecord) ?? defaultOnboardingSettings;
    const initialOverrides: Record<string, OnboardingSettingsConfiguration> = {};

    if (schoolRecord && parseConfiguration(schoolRecord)) {
      initialOverrides[defaultOnboardingConfigurationScope.key] = schoolSettings;
    }

    if (academicYearId) {
      const academicRecord = settingsQuery.data?.find(
        (record) => record.academicYearId === academicYearId
      );
      const academicSettings = parseConfiguration(academicRecord);
      if (academicSettings) {
        initialOverrides[getAcademicScopeKey(academicYearId)] = academicSettings;
      }
    }

    return { initialOverrides };
  }, [academicYearId, settingsQuery.data]);

  const persist = useCallback(
    async (
      scope: OnboardingConfigurationScope,
      configuration: OnboardingSettingsConfiguration
    ) => {
      const scopeAcademicYearId = scope.level === 'academic-year' ? scope.academicYearId : null;
      if (scope.level === 'academic-year' && !scopeAcademicYearId) {
        throw new Error('Select an academic year before saving this onboarding override.');
      }
      const recordKey = getRecordKey(scopeAcademicYearId);
      const currentRecord = recordsRef.current.get(recordKey);

      try {
        const savedRecord = await saveSettings({
          academicYearId: scopeAcademicYearId,
          schemaVersion: SCHEMA_VERSION,
          configurationJson: JSON.stringify(configuration),
          concurrencyStamp: currentRecord?.concurrencyStamp,
        }).unwrap();
        recordsRef.current.set(recordKey, savedRecord);
        shikshaMitraToast.success({ message: 'Onboarding configuration saved.' });
      } catch (error) {
        shikshaMitraToast.error({
          message: 'The onboarding configuration could not be saved. Refresh and retry.',
        });
        throw error;
      }
    },
    [saveSettings]
  );

  const removeOverride = useCallback(
    async (scope: OnboardingConfigurationScope) => {
      const scopeAcademicYearId = scope.level === 'academic-year' ? scope.academicYearId : null;
      const recordKey = getRecordKey(scopeAcademicYearId);
      const currentRecord = recordsRef.current.get(recordKey);
      if (!currentRecord) return;

      try {
        await deleteSettings({
          id: currentRecord.id,
          concurrencyStamp: currentRecord.concurrencyStamp,
        }).unwrap();
        recordsRef.current.delete(recordKey);
        shikshaMitraToast.success({ message: 'Onboarding override removed.' });
      } catch (error) {
        shikshaMitraToast.error({
          message: 'The onboarding override could not be removed. Refresh and retry.',
        });
        throw error;
      }
    },
    [deleteSettings]
  );

  if (settingsQuery.isLoading) {
    return (
      <Box sx={{ width: 1, pt: 0.5 }}>
        <LinearProgress aria-label="Loading onboarding configuration" />
      </Box>
    );
  }

  if (settingsQuery.isError) {
    return <OnboardingSettingsProvider>{children}</OnboardingSettingsProvider>;
  }

  return (
    <OnboardingSettingsProvider
      key={academicYearId ?? 'school'}
      initialSettings={defaultOnboardingSettings}
      initialOverrides={initialState.initialOverrides}
      onPersist={persist}
      onRemoveOverride={removeOverride}
    >
      {children}
    </OnboardingSettingsProvider>
  );
}

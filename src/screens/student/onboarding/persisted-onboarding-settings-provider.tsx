'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { StudentOnboardingSettingsRecord } from 'src/redux/student/onboarding/student-onboarding-types';

import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRef, useMemo, useEffect, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Stack, Alert, Button, LinearProgress } from '@mui/material';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';
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

function SettingsStateHeader({ pathname }: { pathname: string }) {
  const isSettings = pathname.startsWith(studentPaths.onboarding.settings);
  const heading = isSettings ? 'Onboarding Settings' : 'Student Setup';
  const description = isSettings
    ? 'Configure app login, GR numbers and roll numbers.'
    : 'Prepare admission students for activation and complete their app access.';
  return (
    <CustomBreadcrumbs
      heading={heading}
      description={description}
      links={[
        { name: 'Student', href: studentPaths.dashboard },
        { name: 'Onboarding', href: studentPaths.onboarding.setup },
        { name: heading },
      ]}
    />
  );
}

export function PersistedOnboardingSettingsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canConfigure = hasGrantedPermission(permissions, studentPermissions.onboarding.configure);
  const canDelete = hasGrantedPermission(permissions, studentPermissions.onboarding.delete);
  const academicYearId = currentYear?.id;
  const settingsQuery = useGetStudentOnboardingSettingsQuery(
    academicYearId ? { academicYearId } : undefined
  );
  // RTK Query's data may still belong to the previous year while new arguments load.
  // Only currentData can initialize this year's editable settings and concurrency stamps.
  const records = settingsQuery.currentData;
  const [saveSettings] = useSaveStudentOnboardingSettingsMutation();
  const [deleteSettings] = useDeleteStudentOnboardingSettingsMutation();
  const recordsRef = useRef(new Map<string, StudentOnboardingSettingsRecord>());

  useEffect(() => {
    if (!records) {
      recordsRef.current = new Map();
      return;
    }
    recordsRef.current = new Map(
      records.map((record) => [getRecordKey(record.academicYearId), record])
    );
  }, [records]);

  const initialState = useMemo(() => {
    const schoolRecord = records?.find((record) => !record.academicYearId);
    const schoolSettings = parseConfiguration(schoolRecord) ?? defaultOnboardingSettings;
    const initialOverrides: Record<string, OnboardingSettingsConfiguration> = {};

    if (schoolRecord && parseConfiguration(schoolRecord)) {
      initialOverrides[defaultOnboardingConfigurationScope.key] = schoolSettings;
    }

    if (academicYearId) {
      const academicRecord = records?.find((record) => record.academicYearId === academicYearId);
      const academicSettings = parseConfiguration(academicRecord);
      if (academicSettings) {
        initialOverrides[getAcademicScopeKey(academicYearId)] = academicSettings;
      }
    }

    return { initialOverrides };
  }, [academicYearId, records]);

  const persist = useCallback(
    async (scope: OnboardingConfigurationScope, configuration: OnboardingSettingsConfiguration) => {
      if (!canConfigure) throw new Error('Add/Update permission is required to save onboarding settings.');
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
    [canConfigure, saveSettings]
  );

  const removeOverride = useCallback(
    async (scope: OnboardingConfigurationScope) => {
      if (!canDelete) throw new Error('Delete permission is required to remove an onboarding override.');
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
    [canDelete, deleteSettings]
  );

  const isLoading = settingsQuery.isLoading || (!records && !settingsQuery.isError);
  const isInvalid = records?.some((record) => !parseConfiguration(record));
  if (isLoading || settingsQuery.isError || isInvalid) {
    return (
      <Stack spacing={1} sx={{ minWidth: 0, height: '100%' }}>
        <SettingsStateHeader pathname={pathname} />
        <Box sx={{ minWidth: 0 }}>
          {isLoading ? (
            <LinearProgress aria-label="Loading onboarding configuration" />
          ) : settingsQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button size="small" color="inherit" onClick={() => settingsQuery.refetch()}>
                  Retry
                </Button>
              }
            >
              Onboarding settings could not be loaded. Retry before making changes.
            </Alert>
          ) : (
            <Alert severity="error">
              The saved onboarding configuration is invalid or uses an unsupported version. Ask an
              administrator to repair it before making changes; saved rules have not been replaced
              with defaults.
            </Alert>
          )}
        </Box>
      </Stack>
    );
  }

  return (
    <OnboardingSettingsProvider
      key={academicYearId ?? 'school'}
      initialScope={
        academicYearId
          ? {
              ...defaultOnboardingConfigurationScope,
              level: 'academic-year',
              key: getAcademicScopeKey(academicYearId),
              label: `Academic year — ${currentYear?.name ?? ''}`,
              academicYearId,
              academicYearName: currentYear?.name ?? '',
            }
          : defaultOnboardingConfigurationScope
      }
      initialSettings={defaultOnboardingSettings}
      initialOverrides={initialState.initialOverrides}
      onPersist={persist}
      onRemoveOverride={removeOverride}
    >
      {children}
    </OnboardingSettingsProvider>
  );
}
